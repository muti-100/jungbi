# Waruru — Technical Architecture
_@backend-developer | 2026-03-26_

---

## 1. Tech Stack

| Layer | Choice | Version | Reasoning |
|---|---|---|---|
| **Mobile** | Flutter | 3.22 | Cross-platform, BLE plugin ecosystem (flutter_blue_plus) |
| **Web/Admin** | Next.js | 14.2 (App Router) | SSR for SEO landing + RSC for admin dashboard |
| **API Gateway** | Supabase Edge Functions | Deno 1.43 | OSRM calls run at edge, sub-50ms cold start in ap-northeast-1 |
| **Backend** | NestJS | 10.x (Node 20 LTS) | Clean Architecture already in place; decorators map cleanly to ports |
| **Realtime** | Supabase Realtime | — | WebSocket channels already used for chat; extend for BLE events |
| **Primary DB** | PostgreSQL | 15.6 (via Supabase) | PostGIS for venue geo queries |
| **Cache** | Redis | 7.2 (Upstash) | Matching queue state, BLE confirmation TTL |
| **Object Store** | Supabase Storage | — | Rolling paper images, figurine assets |
| **AI/ML** | OpenAI Embeddings + Python sidecar | text-embedding-3-small | Big Five cosine similarity; sidecar isolated for A/B variants |
| **Venue Routing** | OSRM | 5.27 (self-hosted, t3.small) | Free, offline-capable, Seoul road network pre-loaded |
| **Infra** | AWS ap-northeast-2 (Seoul) | — | Lowest latency for Korean users; PIPA data residency |
| **CI/CD** | GitHub Actions + Docker | — | Per-service Dockerfile; staging auto-deploy on merge to main |
| **A/B Testing** | GrowthBook | 0.35 (self-hosted) | Open source, SDK for Flutter + NestJS, no vendor lock-in |

---

## 2. 12 Key API Endpoints

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | POST | `/v1/auth/verify-phone` | KYC phone OTP — onboarding gate |
| 2 | POST | `/v1/matching/queue` | Enter matching queue with location + Big Five snapshot |
| 3 | DELETE | `/v1/matching/queue` | Leave queue (timeout or user cancel) |
| 4 | GET | `/v1/matching/{match_id}` | Poll match status + assigned venue |
| 5 | POST | `/v1/venue/midpoint` | OSRM midpoint calc — returns top-3 venues |
| 6 | POST | `/v1/arrival/ble-event` | Ingest BLE scan event from Flutter plugin |
| 7 | GET | `/v1/arrival/{match_id}/status` | Current arrival confirmation state for both users |
| 8 | POST | `/v1/rolling-paper/{match_id}` | Create rolling paper entry post-meetup |
| 9 | GET | `/v1/rolling-paper/{match_id}` | Fetch rolling paper with figurine URL |
| 10 | POST | `/v1/figurine/generate` | Trigger AI figurine generation job |
| 11 | GET | `/v1/abtest/assignment` | Get GrowthBook experiment variant for caller |
| 12 | POST | `/v1/legacy/migrate` | Bridge — proxy legacy service calls during migration window |

---

## 3. Core DB Schema (5 Tables)

```sql
-- users
users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash    text UNIQUE NOT NULL,          -- SHA-256, never raw
  big_five      jsonb NOT NULL,                -- {O,C,E,A,N} scores 0-100
  embedding     vector(1536),                  -- OpenAI text-embedding-3-small
  created_at    timestamptz DEFAULT now()
)

-- venues
venues (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  district      text NOT NULL CHECK (district IN ('마포','성동','강남','용산','송파')),
  location      geography(Point, 4326) NOT NULL,  -- PostGIS
  category      text NOT NULL,                -- cafe | bar | restaurant
  ble_beacon_id text,                         -- nullable — not all venues have beacon
  active        boolean DEFAULT true
)

-- matches
matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a        uuid REFERENCES users(id),
  user_b        uuid REFERENCES users(id),
  venue_id      uuid REFERENCES venues(id),
  big_five_score numeric(4,2),               -- cosine similarity 0-1
  ab_variant    text,                        -- 'control' | 'v2_weights'
  status        text DEFAULT 'pending'       -- pending|confirmed|arrived|cancelled
    CHECK (status IN ('pending','confirmed','arrived','cancelled')),
  created_at    timestamptz DEFAULT now()
)

-- arrival_events
arrival_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id      uuid REFERENCES matches(id),
  user_id       uuid REFERENCES users(id),
  method        text CHECK (method IN ('ble','gps_fallback')),
  rssi          integer,                     -- BLE signal strength dBm
  confirmed_at  timestamptz DEFAULT now()
)

-- rolling_papers
rolling_papers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id      uuid REFERENCES matches(id) UNIQUE,
  author_a_msg  text,
  author_b_msg  text,
  figurine_url  text,                        -- Supabase Storage path
  generated_at  timestamptz,
  created_at    timestamptz DEFAULT now()
)
```

**Relationships:** `matches` is the hub — references `users` (x2) and `venues`. `arrival_events` and `rolling_papers` hang off `matches` 1:N and 1:1 respectively.

---

## 4. BLE Arrival Confirmation Flow

```
Flutter Plugin          WebSocket              NestJS              Redis / DB
     |                     |                     |                     |
     |-- BLE scan: beacon_id, rssi, match_id --> WS channel            |
     |                     |-- emit 'ble_event' event ---------------> |
     |                     |                     |-- RSSI >= -75dBm?   |
     |                     |                     |   YES: write        |
     |                     |                     |   arrival_events    |
     |                     |                     |-- SET ble:{match_id}:{user_id} EX 300
     |                     |                     |-- both users confirmed?
     |                     |                     |   YES: UPDATE matches SET status='arrived'
     |                     |<-- push 'arrival_confirmed' to both users |
     |<-- UI: "상대방도 도착했어요!" --------------|                     |
```

**Fallback:** If BLE beacon absent (non-beacon venue), GPS proximity check at <= 100m triggers `gps_fallback` method. TTL on Redis key is 300s — after expiry, status remains `confirmed` but not `arrived`, triggering in-app nudge.

---

## 5. OSRM Midpoint Calculation (Edge Function)

```python
# Input: user_a_coords, user_b_coords, candidate_venues[]
midpoint = ((lat_a + lat_b) / 2, (lon_a + lon_b) / 2)
for venue in candidate_venues:
    t_a = osrm.route(user_a_coords, venue.location).duration  # seconds
    t_b = osrm.route(user_b_coords, venue.location).duration
    venue.score = -abs(t_a - t_b) - (0.3 * max(t_a, t_b))   # fairness + speed
return sorted(candidate_venues, key=lambda v: v.score, reverse=True)[:3]
```

Score penalizes fairness gap (neither person should travel 2x more) and raw travel time. Venues pre-filtered to `district IN (nearest districts to midpoint)` before OSRM calls to cap API calls at <= 20 per request.

---

## 6. Big Five A/B Test Infrastructure

| Component | Detail |
|---|---|
| Variants | `control` (equal weights), `v2_weighted` (Agreeableness x1.5 for Korean cultural fit) |
| Assignment | GrowthBook SDK assigns on `POST /v1/matching/queue` — stored in `matches.ab_variant` |
| Metric | 7-day retention rate + rolling paper completion rate per variant |
| Rollout | 50/50 split; graduate winner after 500 matches per variant |
| Isolation | Python sidecar exposes `/score` endpoint — variant logic lives entirely in sidecar, zero NestJS change needed to switch weights |

---

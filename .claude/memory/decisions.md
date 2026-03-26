# Architecture Decisions

_Agents: Read this before making any tech stack or architecture decisions._

## Decisions Log

### [2026-03-26] UWB deferred to v2
- Decision: BLE-only for launch, UWB post-launch
- Reason: iOS UWB permission restrictions make launch-blocking risk too high
- Owner: @cpo

### [2026-03-26] Venue coverage scoped to 5 Seoul districts for launch
- Districts: 마포, 성동, 강남, 용산, 송파
- Reason: Reduce venue DB completion risk; expand post-launch based on MAU data
- Owner: @cpo

### [2026-03-26] Big Five — ship with minimum 50-pair validation, tune in production
- Reason: Waiting for statistically significant offline validation blocks launch
- Risk accepted: Match quality may be suboptimal in first 2 weeks
- Owner: @cpo

### [2026-03-26] Rolling paper is the #1 priority feature to polish before launch
- Reason: Highest RICE score (50.4), lowest effort (1wk), directly drives Day-7 retention loop
- Owner: @cpo

### [2026-03-26] Tech stack finalized for launch
- Mobile: Flutter 3.22 | Web: Next.js 14.2 (App Router) | Backend: NestJS 10.x
- DB: PostgreSQL 15.6 + PostGIS | Cache: Redis Upstash 7.2 | Realtime: Supabase Realtime
- Design: Primary #E86A3A (테라코타), Secondary #3A7BD5 (KYC 전용), Font: Pretendard
- Owner: @backend-developer + @ui-designer

### [2026-03-26] BLE RSSI threshold set at -75 dBm for arrival confirmation
- Reason: Balances false positive rate vs. venue entry detection distance (~3m)
- Fallback: GPS <= 100m for non-beacon venues
- Owner: @backend-developer

### [2026-03-26] OSRM self-hosted on t3.small (Seoul road network)
- Reason: Free tier, offline-capable, no per-call cost vs. Google Maps/Kakao API
- Decision: Pre-filter venues to nearest districts before OSRM calls (cap 20 calls/req)
- Owner: @backend-developer

### [2026-03-26] GrowthBook (self-hosted 0.35) for A/B test infrastructure
- Reason: Open source, PIPA-compliant (no data leaves Korea), Flutter + NestJS SDK support
- Variants: control vs. v2_weighted (Agreeableness x1.5); graduate after 500 matches/variant
- Owner: @backend-developer

### [2026-03-26] Big Five sidecar pattern — Python service isolated from NestJS
- Reason: A/B variant weight changes require zero NestJS redeploy; sidecar exposes /score endpoint
- Owner: @backend-developer

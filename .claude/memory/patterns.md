# Patterns That Worked

_Agents: Read this before writing code. Reuse what worked._
_Agents: Add to this when you find a pattern that solved a problem well._

## Code Patterns

### [2026-03-26] BigFiveVector dataclass with __post_init__ validation
- Validate each trait is float in [0.0, 1.0] inside __post_init__
- Coerce int → float explicitly so callers can pass integer 0/1 safely
- Expose to_array() returning np.ndarray for math operations
- Avoids Pydantic overhead in the pure-math layer; Pydantic stays at HTTP boundary

### [2026-03-26] Weighted cosine similarity via element-wise scaling
- Apply weight vector before cosine: a_w = a * weights, b_w = b * weights
- No custom math needed — standard cosine on scaled vectors is equivalent to weighted angle
- VARIANT_WEIGHTS dict keyed by string; unknown keys fall back to "control" silently

### [2026-03-26] Prompt injection guard for user-authored text
- Sanitise with unicodedata.normalize + regex strip control chars
- Hard-truncate at MAX_MESSAGE_CHARS (400) before any LLM submission
- Embed in clearly labelled bracket section in DALL-E prompt with explicit instruction
- match_id validated with strict [a-zA-Z0-9_-] regex at Pydantic field_validator

### [2026-03-26] FastAPI lifespan for resource init/teardown
- Redis client and FigurineGenerator initialised in lifespan contextmanager
- Redis unavailability is a warning + graceful degradation, not startup failure
- Dependency injection via Depends(get_redis) / Depends(get_figurine_generator)

### [2026-03-26] Redis cache key for deterministic scoring
- Build key from stringified 3-decimal trait values + variant name
- setex TTL=300 seconds; read errors and write errors both silently bypassed
- JSON serialise/deserialise via model_dump() for clean cache round-trip

## Prompt Patterns

### [2026-03-26] DALL-E figurine prompt structure
- "A cute 3D chibi figurine character for a Korean social app."
- Style tags from Big Five mapping (one primary tag per dimension)
- User message in bracket section with explicit non-instruction note
- "White studio background, soft shadows, product shot aesthetic."

## Flutter / Mobile Patterns

### [2026-03-26] StateNotifier + autoDispose.family for per-screen state
- Use StateNotifierProvider.autoDispose.family keyed by matchId or (matchId, venueId)
- autoDispose prevents stale Realtime subscriptions when navigating away
- Always dispose BLE scan + RealtimeChannel inside notifier.dispose()

### [2026-03-26] BleService: UUID filter + RSSI threshold + GPS haversine fallback
- Filter ScanResults by serviceUuids list OR device name prefix "wru-{matchId[:8]}"
- Only confirm arrival when RSSI >= -75 dBm (prevents false positives at doorstep)
- GPS haversine: confirm when distance <= 100m; always show manual button
- Broadcast arrival via Supabase Realtime channel "arrival-{matchId}" for instant partner update

### [2026-03-26] GoRouter deep-link params via uri.queryParameters
- Pass matchId/venueId as query params: /matching/card?matchId=xxx
- Read in pageBuilder: state.uri.queryParameters['matchId'] ?? ''
- Enables deep-link from notification payload with zero extra setup

### [2026-03-26] Auto-advance with 300ms delay via Timer in StateNotifier
- Cancel previous timer before scheduling new one to prevent double-advance
- Set isAutoAdvancing flag in state to dim/animate the question card
- Clear flag in _advance() after state mutation

### [2026-03-26] Lottie with errorBuilder fallback for missing assets
- Wrap every Lottie.asset() in errorBuilder returning Icon placeholder
- Keeps UI functional before animation files are added to the repo
- Pattern: _LottieOrPlaceholder widget with assetPath + placeholderIcon params

## Next.js / React Patterns

### [2026-03-26] framer-motion useInView scroll animations
- Always use `once: true, margin: '-80px'` in useInView to trigger before element is fully in view
- Wrap motion.div variants with staggerChildren on the container, itemVariants on each child
- Custom easing [0.22, 1, 0.36, 1] gives a natural deceleration ("ease out expo" approximation)
- Keep custom ease as cubic-bezier array, not string, for framer-motion compatibility

### [2026-03-26] Admin auth guard via Supabase SSR in Server Component layout
- createClient() in layout.tsx (server) → supabase.auth.getSession()
- If no session → redirect('/admin/login') — runs on server, no flicker
- Client components (sidebar, buttons) use createBrowserClient separately
- Keep server/client Supabase clients in separate files (lib/supabase/server.ts, client.ts)

### [2026-03-26] WruButton loading state pattern
- Single `loading` prop → replaces leftIcon with Loader2 spinner + sets aria-busy
- Disable button when loading OR disabled — prevents double-submit
- Size-aware spinner: sm→14px, default→16px, xl→20px

### [2026-03-26] Tailwind color token naming convention
- Use DEFAULT key for the base color: `primary: { DEFAULT: '#E86A3A', 500: '#E86A3A', ... }`
- This allows both `bg-primary` and `bg-primary-500` to work
- Extend fontFamily with array including Korean system font fallbacks

## Architecture Patterns

### [2026-03-26] Python AI sidecar isolated from NestJS
- FastAPI service on PORT=8000, called via HTTP from NestJS
- All A/B variant weight changes require zero NestJS redeploy
- Stateless scoring (no DB), optional Redis cache, optional OpenAI key
- Graceful degradation: no Redis → compute live; no OpenAI → placeholder URLs

### [2026-03-26] NestJS Clean Architecture layout
- Each feature = controller + service + dto/ + module; no cross-module direct service injection (use exports)
- DatabaseModule and RedisModule are @Global() — no need to import in feature modules
- JwtAuthGuard is exported from AuthModule; feature modules import AuthModule to use it
- Global ValidationPipe with whitelist:true prevents extra fields from reaching services

### [2026-03-26] Opossum circuit breaker for legacy proxy
- Wrap the axios call (not the controller method) inside CircuitBreaker constructor
- volumeThreshold:3 prevents circuit from opening on first probe requests
- Fail fast check: if (this.breaker.opened) → throw 503 before inspecting axios error
- Instantiate breaker in constructor, not per-request (one breaker per service target)

### [2026-03-26] Redis sorted set for FIFO matching queue
- Key: matching:queue, score = Date.now() (ms) → natural FIFO ordering within time window
- User presence tracked via separate key matching:user:{userId} with TTL = max_wait_seconds
- Prevent double-queue with redis.exists(userKey) before zadd
- Pipeline zadd + set in single roundtrip; pipeline zrem + del on dequeue

### [2026-03-26] BLE arrival confirmation double-key pattern
- Set arrival:{match_id}:{user_id} with TTL 300s on each user confirmation
- Check both keys exist → update match.status = 'arrived' in one UPDATE
- Idempotent: INSERT ... ON CONFLICT DO NOTHING on arrival_events table
- Emit WebSocket event from both REST controller AND gateway for dual-client coverage

### [2026-03-26] Supabase Edge Function (Deno) for PostGIS queries
- Call PostGIS logic via supabase.rpc() — never interpolate user input into SQL
- Define the SQL function in a separate migration (002_venue_rpc_functions.sql) with SECURITY DEFINER
- OSRM Table API: sources=0;1 (users), destinations=2..N (venues); parse durations[0][i] and durations[1][i]
- Score formula: -(|t_a - t_b| + 0.3 * max(t_a, t_b)) — penalises imbalance AND long travel

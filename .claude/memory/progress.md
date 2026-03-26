# Sprint Progress

_Agents: Update this after completing each task._

## Current Project
Waruru — Real-time offline social matching app (Korean market)

## Phase
/ship — deployment artifacts written. Project is ready for production deploy.

## Completed (deployment — 2026-03-26)
- [2026-03-26] @devops: All deployment artifacts written
  - projects/waruru/src/backend/Dockerfile (multi-stage, node:20-alpine)
  - projects/waruru/src/web/Dockerfile (multi-stage, Next.js standalone output)
  - projects/waruru/src/ai-sidecar/Dockerfile (python:3.12-slim, uv, nobody user)
  - projects/waruru/docker-compose.yml (profiles: default / routing / abtest)
  - projects/waruru/src/backend/.env.example (19 vars)
  - projects/waruru/src/ai-sidecar/.env.example
  - projects/waruru/src/web/.env.example
  - projects/waruru/.github/workflows/deploy.yml (test → build+push GHCR → SSH deploy)
  - projects/waruru/README.md (5-min quick start)

## Completed
- [2026-03-26] CPO /plan: RICE scoring of 6 launch-critical features
- [2026-03-26] CPO /plan: 6-week sprint plan defined
- [2026-03-26] CPO /plan: Korean GTM 3-tactic strategy defined
- [2026-03-26] @backend-developer: Technical architecture designed (stack, 12 endpoints, 5 DB tables, BLE flow, OSRM algorithm)
- [2026-03-26] @trend-researcher: Market validation complete — market opportunity 8/10, market-research.md created

## Completed (continued)
- [2026-03-26] @ai-engineer: Python AI sidecar built — projects/waruru/src/ai-sidecar/
  - POST /score (control + v2_weighted Big Five variants)
  - POST /generate-figurine (DALL-E 3 + placeholder fallback)
  - GET /health (Redis + OpenAI status)
  - Full test suite: tests/test_big_five.py (16 test cases)

## Completed (mobile)
- [2026-03-26] @mobile-builder: Flutter app scaffold — projects/waruru/src/mobile/
  - pubspec.yaml: flutter_riverpod, go_router, flutter_blue_plus, supabase_flutter, google_maps_flutter, lottie, cached_network_image, permission_handler, shared_preferences
  - lib/main.dart: ProviderScope + Supabase env-based init + Pretendard font + portrait lock
  - lib/core/theme/app_theme.dart: light/dark, Pretendard TextTheme 15 styles, WruColors tokens
  - lib/core/widgets/wru_button.dart: primary/secondary/ghost, loading state, 52px min height
  - lib/core/widgets/wru_bottom_sheet.dart: drag handle, showWruBottomSheet() helper
  - lib/core/router/app_router.dart: GoRouter 7 routes, slide-up transitions, deep-link params
  - features/onboarding/big_five_screen.dart: 15q slider, 300ms auto-advance, SharedPrefs interrupt save, progress microcopy
  - features/matching/matching_queue_screen.dart: Lottie waiting, Realtime ETA, 30min timeout empty state, notification banner
  - features/matching/match_card_screen.dart: blurred photo, Big Five badge, shared interest tags, 15s AnimatedCountdown, swipe gesture, auto-decline
  - features/venue/venue_suggestion_screen.dart: Google Maps midpoint, 3x WruVenueCard, 2-reroll limit, KakaoMap deep-link, auto-expand radius
  - features/arrival/arrival_screen.dart: BLE status animation, manual fallback (always visible), both-arrived Lottie, permission OS settings deep link
  - features/arrival/services/ble_service.dart: flutter_blue_plus scan, UUID + name filter, RSSI -75 dBm, Supabase Realtime broadcast, GPS haversine fallback 100m
  - features/rolling_paper/rolling_paper_compose_screen.dart: text + 20 emoji grid, 200 char counter, unboxing Lottie, figurine Edge Function call
  - features/rolling_paper/figurine_gallery_screen.dart: CachedNetworkImage grid 2-col, empty state CTA, tap → modal with rolling paper message

## Completed (backend)
- [2026-03-26] @backend-developer: NestJS 10 backend built — projects/waruru/src/backend/
  - 12 REST endpoints across 6 modules (auth, matching, venue, arrival, rolling-paper, abtest, legacy)
  - WebSocket gateway: /arrival namespace, JWT middleware, ble_scan event → arrival_confirmed broadcast
  - Redis sorted set matching queue + double-key BLE arrival confirmation (TTL 300s)
  - OSRM venue scoring: -(|t_a - t_b| + 0.3 * max(t_a, t_b)), auto-expand 500m→1km
  - Opossum circuit breaker on legacy proxy (volumeThreshold=3, resetTimeout=30s)
  - GrowthBook A/B proxy with fail-open (returns control variant on timeout)
  - 2 DB migrations: 001_initial_schema.sql (PostGIS+vector, RLS policies), 002_venue_rpc_functions.sql
  - Supabase Deno edge function: venue-midpoint (OSRM matrix scoring, parameterized PostGIS RPC)
  - openapi.yaml: full spec for all 12 endpoints
  - .env.example: 19 required environment variables

## Completed (web frontend)
- [2026-03-26] @frontend-developer: Next.js 14 web app built — projects/waruru/src/web/
  - Landing page: 7-section marketing page (Hero, HowItWorks, Features, SocialProof, Safety, DownloadCTA, Footer)
    - All sections use framer-motion useInView scroll animations
    - Fixed nav with blur backdrop, skip-nav accessibility link
  - Admin: layout.tsx with Supabase SSR auth guard (redirect /admin/login), AdminSidebar with active-link, collapsible
  - Admin pages: Dashboard (KPI cards + recent matches table), Venues (search + add form + toggle active), Reports (filter + resolve/suspend actions)
  - Components: WruButton (primary/secondary/ghost/danger, loading state), SkeletonCard/Table/KpiGrid, StatusBadge, KpiCard
  - Config: tailwind.config.ts (primary #E86A3A, secondary #3A7BD5, Pretendard fontFamily), next.config.ts (security headers, image optimization), strict tsconfig
  - API: /api/admin/stats with session guard
  - Error handling: error.tsx, not-found.tsx, loading.tsx

## What's Next (by priority)
1. W1-2: Venue DB seed data — 5 Seoul districts (마포/성동/강남/용산/송파)
2. W1-2: Supabase Edge Function generate-figurine (calls AI sidecar)
3. W1-2: Big Five A/B offline validation with 100 pairs
4. W3-4: OSRM self-hosted deploy (t3.small Seoul road network)
5. W5-6: GTM execution — influencer collabs, community seeding, popup event

## North Star
MAU 58,000 in 6 months post-launch

# Code Review — Waruru

**Reviewer:** @code-reviewer
**Date:** 2026-03-26
**Scope:** `projects/waruru/src/` (backend, web, mobile, ai-sidecar)

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 6 | ✅ All fixed |
| 🟡 Warning | 9 | Documented below |
| 🟢 Suggestion | 5 | Documented below |

---

## 🔴 Critical Issues (Fixed)

### 1. WebSocket CORS wildcard — `arrival.gateway.ts:31`
**Risk:** Any origin can connect to the WebSocket namespace, bypassing browser CORS protection.
**Fix applied:** Replaced `origin: '*'` with a callback that reads `CORS_ORIGINS` env var and allows only listed origins.

### 2. Race condition in both-arrived check — `arrival.service.ts:87-93`
**Risk:** Two simultaneous arrival events could both read `otherArrived === true` before either writes `status = 'arrived'`, resulting in duplicate `UPDATE` executions and potential double-notification.
**Fix applied:** Added Redis `SET NX EX 60` lock on `arrival:lock:{match_id}`. Only the first acquirer proceeds with the DB update. `UPDATE` also guarded with `AND status <> 'arrived'`.

### 3. Missing ownership check on `/figurine/generate` — `rolling-paper.controller.ts:74`
**Risk:** Any authenticated user could trigger figurine generation for a match they don't belong to, wasting AI credits and potentially exposing data.
**Fix applied:** Replaced direct `triggerFigurineGeneration('' ...)` call with new `generateFigurineForMatch(matchId, userId, style)` service method that first verifies the user is the `author_id` AND a participant of the match. Returns 403 if not.

### 4. Swagger exposed in production — `main.ts:60`
**Risk:** Swagger UI exposes full API schema (parameter names, response shapes, auth requirements) in production, aiding attackers.
**Fix applied:** Wrapped `SwaggerModule.setup` in `if (process.env.NODE_ENV !== 'production')`.

### 5. Admin auth uses `getSession()` instead of `getUser()` — `web/app/admin/layout.tsx:21`
**Risk:** `getSession()` reads from cookie storage without re-validating against Supabase Auth server, making it vulnerable to forged/expired session tokens. No role check meant any authenticated user could access admin.
**Fix applied:** Replaced with `getUser()` (server-validated) + `app_metadata.role === 'admin'` check. Redirects to `/admin/login` on either failure.

### 6. OSRM localhost fallback in Edge Function — `venue-midpoint/index.ts:86`
**Risk:** `?? 'http://localhost:5000'` silently falls back to localhost in production, causing all venue requests to fail with misleading 502 errors instead of a clear config error.
**Fix applied:** Removed fallback; added explicit check that returns `500 CONFIG_ERROR` if `OSRM_URL` is not set.

---

## 🟡 Warnings (Not auto-fixed — review before launch)

### W1. `O(n)` Redis scan in `leaveQueue` — `matching.service.ts`
The matching queue removal iterates over all queue members to find the user. Use a secondary Redis hash (`matching:user:{userId} → score`) for O(1) lookup. Low risk at <1k MAU but will degrade at scale.

### W2. Python sidecar CORS hardcoded to `localhost:3000` — `ai-sidecar/main.py`
```python
allow_origins=["http://localhost:3000"]
```
Production NestJS calls from a different host will be blocked. Move to `AI_ALLOWED_ORIGINS` env var.

### W3. `getOrThrow` on `JWT_SECRET` in WebSocket middleware — `arrival.gateway.ts:65`
Each socket connection calls `configService.getOrThrow`, which does a map lookup on every JWT verify. Cache the secret at `afterInit` time to avoid repeated lookups.

### W4. No retry/circuit-breaker on Python sidecar calls — `rolling-paper.service.ts:134`
The figurine generation call uses a 5s timeout but no retry or circuit breaker. A slow sidecar will cause all rolling paper creates to block for 5s. Consider fire-and-forget with a queue (BullMQ).

### W5. Missing CSP header in Next.js config — `next.config.mjs`
The security headers block is present but lacks `Content-Security-Policy`. Without CSP, XSS attacks on the admin panel can escalate to full session compromise.

### W6. `matching.service.ts` — Python sidecar score not validated
The response from `POST /score` is used directly as `score` in the Redis sorted set with no range or type validation. A corrupted sidecar response could corrupt the matching queue.

### W7. No rate limiting on `/v1/arrival` REST endpoint — `arrival.controller.ts`
BLE scan events from a single device can flood the endpoint. Add `@Throttle()` from `@nestjs/throttler`.

### W8. AI sidecar prompt injection defense — `figurine/generator.py`
`sanitize_message` strips angle brackets but not Unicode lookalikes or prompt-injection patterns. Consider a deny-list of `ignore previous instructions`, `system:`, etc.

### W9. `rolling_papers` table missing index on `author_id` — `001_initial_schema.sql`
`SELECT FROM rolling_papers WHERE match_id = $1 AND author_id = $2` requires a composite index `(match_id, author_id)`. Add before launch to avoid seq scans.

---

## 🟢 Suggestions

### S1. Add figurine generation tests to ai-sidecar — `tests/test_big_five.py`
Only Big Five scoring is tested. Add tests for `generator.py`: mock DALL-E response, test placeholder fallback, test `sanitize_message`.

### S2. Replace `axios` with NestJS `HttpModule` — `rolling-paper.service.ts`
Using raw `axios` bypasses NestJS interceptors. Switch to `HttpService` from `@nestjs/axios` for consistent observability.

### S3. Add `zod` validation to Edge Function request body — `venue-midpoint/index.ts`
The hand-rolled `validateBody` function works but misses coercion edge cases. `zod` is available in Deno and provides cleaner validation with better error messages.

### S4. Add `docker-compose.yml` for local dev — missing
Developers need to manually start PostgreSQL, Redis, OSRM, and GrowthBook. A `docker-compose.yml` at the repo root would reduce onboarding time significantly.

### S5. Admin `/api/admin/stats` missing role middleware — `app/api/admin/stats/route.ts`
The API route uses `getSession()` (same risk as W5 above) and has no role check. Fix before launch to prevent data leakage.

---

## Files Changed by This Review

| File | Change |
|------|--------|
| `src/backend/src/arrival/arrival.gateway.ts` | CORS origin callback |
| `src/backend/src/arrival/arrival.service.ts` | Redis NX lock for both-arrived |
| `src/backend/src/main.ts` | Swagger gated behind NODE_ENV |
| `src/backend/src/rolling-paper/rolling-paper.service.ts` | Added `generateFigurineForMatch` with ownership check |
| `src/backend/src/rolling-paper/rolling-paper.controller.ts` | Use `generateFigurineForMatch` |
| `src/web/app/admin/layout.tsx` | `getUser()` + role check |
| `src/backend/supabase/functions/venue-midpoint/index.ts` | Hard fail if OSRM_URL missing |

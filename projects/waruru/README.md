# Waruru — 실시간 오프라인 소셜 매칭

> 서울 도시 직장인을 위한 Big Five 기반 장소 추천 & BLE 도착 확인 플랫폼

## Quick Start (5분 설정)

### Prerequisites
- Docker & Docker Compose v2
- Node.js 20+ (for local dev without Docker)
- Flutter 3.22+ (for mobile development)

### 1. Clone & configure
```bash
git clone <repo-url>
cd waruru
cp src/backend/.env.example src/backend/.env
cp src/ai-sidecar/.env.example src/ai-sidecar/.env
cp src/web/.env.example src/web/.env.local
# Edit .env files with your Supabase and OpenAI credentials
```

### 2. Start services
```bash
docker compose up -d
```

### 3. Run migrations
```bash
docker compose exec backend npm run migration:run
```

### 4. Open
- Backend API: http://localhost:3000
- Swagger docs: http://localhost:3000/docs (dev only)
- Web admin: http://localhost:3001/admin
- AI sidecar: http://localhost:8000/health

## Architecture

```
  [Flutter Mobile App]
         |  |
         |  +------ Supabase Realtime (WebSocket) <----+
         |                                              |
         v                                              |
  [NestJS Backend API :3000] ---------> [PostgreSQL 15 + PostGIS :5432]
         |                    \
         |                     +------> [Redis 7 :6379]
         |
         +-----------> [Python AI Sidecar :8000] -----> [OpenAI API]
         |
  [Next.js Web Admin :3001]
```

## Services

| Service     | Port | Description                                          |
|-------------|------|------------------------------------------------------|
| backend     | 3000 | NestJS REST API + WebSocket                          |
| web         | 3001 | Next.js admin + landing page                         |
| ai-sidecar  | 8000 | Python FastAPI for Big Five scoring + DALL-E figurines |
| postgres    | 5432 | PostgreSQL 15 + PostGIS                              |
| redis       | 6379 | Redis 7 (queue + BLE arrival cache)                  |

## Optional Services

```bash
# OSRM routing (requires Seoul OSM data download — see docs/osrm-setup.md)
docker compose --profile routing up -d

# GrowthBook A/B testing
docker compose --profile abtest up -d
```

## Environment Variables

See `src/backend/.env.example`, `src/ai-sidecar/.env.example`, `src/web/.env.example`.

## CI/CD

GitHub Actions pipeline at `.github/workflows/deploy.yml`:
- Tests on every PR
- Builds & pushes Docker images to GHCR on merge to main
- SSH deploys to production server

## Launch Gates

- [ ] Supabase project created and env vars configured
- [ ] OpenAI API key with DALL-E 3 access
- [ ] PostgreSQL migrations applied
- [ ] OSRM Seoul road network loaded (optional — GPS fallback available)
- [ ] GrowthBook SDK key configured
- [ ] Admin user role set in Supabase app_metadata

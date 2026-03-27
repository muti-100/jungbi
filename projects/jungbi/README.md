# 정비나라 (Jungbi)

도시정비사업 법령/절차 관리 SaaS 플랫폼

재개발, 재건축, 소규모주택정비, 모아주택의 법령 조회, 절차 플로우차트, 시도별 조례 비교, 일정 관리를 한 곳에서.

## 빠른 시작 (5분)

### 1. 클론 & 의존성 설치

```bash
cd projects/jungbi/src/web
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열고 최소 다음 2개를 설정:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> Supabase 미설정 시에도 데모 데이터로 동작합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

### 4. Docker로 실행

```bash
cd projects/jungbi
docker compose up --build
```

## 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 대시보드 | `/dashboard` | KPI, 절차 타임라인, 이번 주 일정, 법령 알림 |
| 법령 조회 | `/laws` | 도시정비법/빈집특별법 조문 뷰어, 개정이력 |
| 조례 비교 | `/laws/compare` | 시도별 용적률/동의율/기부채납 비교 테이블 |
| 절차 플로우차트 | `/flow` | React Flow 기반 10단계 절차 시각화 |
| 일정 관리 | `/calendar` | FullCalendar 월간 뷰, 법정 기한 D-day |
| 사례 검색 | `/cases` | 유사 정비사업 사례 필터 검색 |
| 설정 | `/settings` | 프로필, 조합 정보, 알림, 보안, 구독 |

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **시각화**: React Flow (플로우차트) + FullCalendar (캘린더)
- **DB/Auth**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **배포**: Docker (multi-stage) + GitHub Actions + GHCR

## 프로젝트 구조

```
projects/jungbi/
├── docs/
│   ├── vision.md          # 제품 비전
│   ├── plan.md            # RICE 스코어링 + 스프린트 계획
│   ├── ui-design-spec.md  # 디자인 시스템 + 와이어프레임
│   └── review.md          # 코드 리뷰 결과
├── src/web/               # Next.js 앱
│   ├── src/app/           # App Router 페이지
│   ├── src/components/    # 재사용 컴포넌트
│   ├── src/lib/           # 유틸리티, Supabase 클라이언트
│   ├── src/types/         # TypeScript 타입 정의
│   ├── Dockerfile         # Multi-stage Docker 빌드
│   └── .env.example       # 환경 변수 템플릿
├── docker-compose.yml     # 로컬/프로덕션 실행
├── .github/workflows/     # CI/CD 파이프라인
└── README.md              # 이 파일
```

## 요금제

| 플랜 | 가격 | 핵심 기능 |
|------|------|-----------|
| Free | 무료 | 법령 조회, 플로우차트 열람 |
| Pro | 월 59,000원 | 절차 관리, 일정, 법령 알림, 조례 비교 |
| Enterprise | 월 299,000원 | 다중 조합, API, 사례 검색, 전담 CS |

## 라이선스

Proprietary - All rights reserved

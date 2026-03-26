# 정비나라 (Jungbi) — 제품 기획 계획서

> 작성자: @cpo
> 작성일: 2026-03-26
> 스프린트 단계: /plan

---

## 1. RICE 점수 산정

### 산정 기준 정의

| 항목 | 기준 |
|------|------|
| Reach (도달) | 월 영향 사용자 수 (1=소수 고급 사용자, 10=전체 조합 행정 담당자) |
| Impact (임팩트) | 사용자 1인당 업무 개선 효과 (1=편의, 10=없으면 불가능) |
| Confidence (확신도) | 가설 검증 수준 (인터뷰, 법령 현황, 시장 리서치 반영) |
| Effort (개발 공수) | 2인 풀스택 기준 주(week) 단위 |

---

### 기능별 RICE 점수

#### 기능 1. 법령/조례 통합 정리 뷰

**근거:** 재개발·재건축·소규모·모아주택 4개 사업 유형의 법령은 각각 도시정비법, 빈집특별법, 모아주택 조례 등 수십 개 법령에 분산되어 있다. 현재 정비사업 실무자들은 국가법령정보센터, 각 시도 자치법규정보시스템, 자체 Word 파일을 번갈아 확인한다. 이 기능이 없으면 플랫폼 자체 이유가 사라진다.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 9 | 6개 사용자 그룹 전원 사용 |
| Impact | 9 | 핵심 정보 검색 시간 80% 단축 |
| Confidence | 85% | 업계 인터뷰 + 법령 분산 현황 직접 확인 |
| Effort | 4주 | 4개 유형 × 법령 수집/구조화/UI |

**RICE = (9 × 9 × 0.85) ÷ 4 = 17.2**

---

#### 기능 2. 시도별 조례 비교 테이블

**근거:** 서울·경기·부산 등 시도별로 용적률 인센티브, 동의 요건, 분양 기준이 상이하다. 컨설팅사와 변호사들은 이 비교 작업을 매 사건마다 수작업으로 반복한다. 타깃 사용자 중 컨설팅·변호사·공무원 3개 그룹의 핵심 니즈.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 6 | 컨설팅·변호사·공무원 중심 (전체 60%) |
| Impact | 7 | 조례 비교 작업 90% 자동화 |
| Confidence | 80% | 조례 종류·형식 직접 조사 완료 |
| Effort | 3주 | 테이블 UI + 17개 광역시도 조례 수집 |

**RICE = (6 × 7 × 0.80) ÷ 3 = 11.2**

---

#### 기능 3. 절차 플로우차트 (사업 유형별)

**근거:** 정비사업은 추진위 구성 → 조합 설립 → 사업 시행 인가 → 관리처분 → 착공 → 준공까지 최소 10년. 단계별 필수 행정 처리, 의결 정족수, 기한 조건이 다르다. 조합 집행부와 정비사업전문관리업체의 핵심 오리엔테이션 도구.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 8 | 조합 집행부 + 전문관리업체 (전체 70%) |
| Impact | 8 | 절차 오해에 의한 인가 지연 방지 |
| Confidence | 90% | 도시정비법 절차 공개 정보로 완전 매핑 가능 |
| Effort | 3주 | React Flow 기반 4개 유형 플로우 + 단계별 팝오버 |

**RICE = (8 × 8 × 0.90) ÷ 3 = 19.2**

---

#### 기능 4. 법령 자동 갱신/알림 (국가법령정보센터 크롤링)

**근거:** 도시정비법은 연 1~2회 개정된다. 실무자가 개정 사항을 놓치면 사업 인가 신청에 오류가 생긴다. 현재는 법제처 뉴스레터를 수동 구독하거나 법률 정보 서비스를 유료 결제해야 한다.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 9 | 전체 사용자 혜택 |
| Impact | 8 | 개정 법령 누락 사고 예방 (리스크 제거) |
| Confidence | 70% | 국가법령정보센터 크롤링 기술 검증 필요 |
| Effort | 3주 | 크롤러 + 변경 감지 + 알림(이메일/인앱) |

**RICE = (9 × 8 × 0.70) ÷ 3 = 16.8**

---

#### 기능 5. 조합별 절차 진행 관리 (SaaS 핵심)

**근거:** 각 조합은 자신의 현재 단계, 완료 항목, 미완료 항목을 추적해야 한다. 현재는 Excel + 카카오톡으로 관리하며 문서 유실, 버전 충돌이 상시 발생한다. 이것이 유료 구독의 핵심 가치 제안이다.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 7 | 조합 집행부 + 전문관리업체 직접 사용 |
| Impact | 10 | Excel → SaaS 이전, 구독 이탈 방지 핵심 |
| Confidence | 85% | SaaS 유사 사례 (아파트아이, 홈즈 등) 검증 |
| Effort | 5주 | 다중 조합 테넌트 + 체크리스트 + 권한 관리 |

**RICE = (7 × 10 × 0.85) ÷ 5 = 11.9**

---

#### 기능 6. 일정 관리 (법정 기한, 캘린더)

**근거:** 정비사업에는 법정 기한이 존재한다(예: 추진위 설립 후 2년 내 조합 설립 신청). 이 기한을 넘기면 처음부터 재추진해야 한다. 법정 기한 관리 기능은 조합 집행부의 가장 큰 불안 요소를 해소한다.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 7 | 조합 집행부 + 전문관리업체 |
| Impact | 9 | 법정 기한 초과 방지 = 사업 자체 보호 |
| Confidence | 85% | FullCalendar 연동 + 법정 기한 목록 공개 정보 |
| Effort | 3주 | FullCalendar + 법정 기한 룰 엔진 + 알림 |

**RICE = (7 × 9 × 0.85) ÷ 3 = 17.9**

---

#### 기능 7. 유사 사례 검색

**근거:** "강남구 재건축 조합이 관리처분 인가 단계에서 어떤 행정 서류를 냈는가"를 검색하려면 현재 법원 판례, 국토부 유권 해석, 개별 컨설팅에 의존해야 한다. 변호사·컨설팅사의 차별화 도구가 될 수 있다.

| 항목 | 값 | 설명 |
|------|-----|------|
| Reach | 5 | 변호사·컨설팅사 중심 (전체 40%) |
| Impact | 7 | 판례·사례 검색 시간 70% 단축 |
| Confidence | 60% | 사례 데이터 수집 및 구조화 난이도 불확실 |
| Effort | 4주 | 사례 DB + 임베딩 검색 + UI |

**RICE = (5 × 7 × 0.60) ÷ 4 = 5.25**

---

### RICE 종합 순위

| 순위 | 기능 | RICE 점수 | 우선순위 근거 |
|------|------|-----------|-------------|
| 1 | 절차 플로우차트 | 19.2 | 높은 확신도, 전체 사용자 커버, 3주 내 완성 가능 |
| 2 | 일정 관리 | 17.9 | SaaS 구독 이탈 방지 직결, 법정 기한 = 고객 핵심 불안 |
| 3 | 법령/조례 통합 정리 뷰 | 17.2 | 플랫폼 존재 이유, 없으면 나머지 기능이 무의미 |
| 4 | 법령 자동 갱신/알림 | 16.8 | 자동화 가치 높음, 확신도가 유일한 할인 요소 |
| 5 | 조합별 절차 진행 관리 | 11.9 | 유료 구독 핵심이지만 공수 최고 (5주) |
| 6 | 시도별 조례 비교 테이블 | 11.2 | 타깃 좁음, 그러나 컨설팅사 세일즈 킬러 피처 |
| 7 | 유사 사례 검색 | 5.25 | 확신도 낮음, 데이터 수집 불확실성 높음 |

---

## 2. 빌드 우선순위 및 스프린트 계획

### 전체 구조 원칙

- **MVP (스프린트 1~3, 6주):** RICE 상위 4개 기능 → 유료 구독 첫 전환 가능한 상태
- **v2 (스프린트 4~5, 4주):** 나머지 3개 기능 + 고도화
- **총 개발 기간:** 10주 (2인 풀스택 기준)

---

### 스프린트 1 (1~2주차) — 플랫폼 기초 + 절차 플로우차트

**목표:** 사용자가 처음 접속했을 때 "이게 뭔지" 즉시 이해할 수 있는 상태

| 태스크 | 담당 | 설명 |
|--------|------|------|
| Next.js 14 프로젝트 셋업 | 풀스택 | App Router, Supabase 연결, Tailwind, shadcn/ui |
| Supabase 스키마 마이그레이션 v1 | 백엔드 | organizations, projects, procedure_steps, laws 테이블 |
| 절차 플로우차트 UI (재개발) | 프론트 | React Flow, 단계별 노드, 팝오버 상세 |
| 절차 플로우차트 UI (재건축) | 프론트 | 재개발과 공유 컴포넌트 80% |
| 절차 데이터 입력 (재개발·재건축) | 데이터 | 각 단계 명칭, 소요 기간, 법적 근거 조문 |
| 인증 (이메일 + 카카오 소셜) | 백엔드 | Supabase Auth, 조합별 테넌트 분리 |
| 랜딩 페이지 초안 | 프론트 | Hero, 기능 소개, 베타 신청 CTA |

**완료 기준:** 재개발·재건축 플로우차트를 로그인 없이 열람 가능

---

### 스프린트 2 (3~4주차) — 법령 통합 뷰 + 나머지 유형 플로우차트

**목표:** 핵심 정보 레이어 완성. 유료 전환 전 무료 가치 증명

| 태스크 | 담당 | 설명 |
|--------|------|------|
| 법령/조례 통합 정리 뷰 UI | 프론트 | 탭(사업유형) + 트리 구조 법령 목록 + 조문 뷰어 |
| 법령 데이터 수집 (재개발·재건축) | 데이터 | 도시정비법 주요 조문 + 서울시 조례 구조화 |
| 절차 플로우차트 (소규모·모아주택) | 프론트 | 빈집특별법, 모아주택 조례 기반 |
| 절차 데이터 입력 (소규모·모아주택) | 데이터 | 단계 명칭, 소요 기간, 법적 근거 |
| 전체 검색 (법령 + 절차 통합) | 프론트 | Supabase Full Text Search, 한국어 형태소 pg_trgm |
| 반응형 레이아웃 완성 | 프론트 | 태블릿·데스크탑 우선, 모바일 최소 지원 |

**완료 기준:** 4개 사업 유형 플로우차트 + 법령 뷰 공개. 베타 신청자 대상 공개 링크 발송 가능

---

### 스프린트 3 (5~6주차) — 일정 관리 + 법령 자동 갱신/알림 + 유료 결제

**목표:** 첫 유료 구독 전환. 이 스프린트 후 첫 매출 발생 가능

| 태스크 | 담당 | 설명 |
|--------|------|------|
| FullCalendar 일정 관리 UI | 프론트 | 월/주 뷰, 법정 기한 하이라이트, 커스텀 일정 추가 |
| 법정 기한 룰 엔진 | 백엔드 | 조합 설립일 입력 → 이후 모든 법정 기한 자동 계산 |
| D-day 알림 (이메일 + 인앱) | 백엔드 | D-30, D-7, D-1 트리거, Resend 이메일 API |
| 국가법령정보센터 크롤러 v1 | 백엔드 | Node.js + Puppeteer, 변경 감지 → DB 업데이트 |
| 법령 변경 알림 이메일 | 백엔드 | 개정 법령 요약 + 변경된 조문 하이라이트 |
| 토스페이먼츠 결제 연동 | 백엔드 | 월 구독, 웹훅 처리, 구독 상태 관리 |
| 구독 플랜 게이팅 | 프론트 | Free/Pro/Enterprise 기능 분기, 업그레이드 모달 |

**완료 기준:** Pro 구독자가 조합 캘린더 생성 + 법정 기한 자동 입력 + 알림 수신 완료

---

### 스프린트 4 (7~8주차) — 조합별 절차 진행 관리 (SaaS 핵심)

**목표:** 조합 집행부가 Excel을 완전히 대체할 수 있는 상태

| 태스크 | 담당 | 설명 |
|--------|------|------|
| 조합 프로젝트 대시보드 | 프론트 | 현재 단계 표시, 완료율 프로그레스바, 다음 단계 CTA |
| 절차 체크리스트 (단계별) | 프론트 | 각 단계별 필수 서류/의결/공고 체크리스트 |
| 서류 첨부 및 메모 | 프론트 | Supabase Storage, PDF/이미지 업로드, 단계별 메모 |
| 멤버 초대 + 권한 관리 | 백엔드 | 조합원/집행부/관리업체 역할별 접근 제어 (RLS) |
| 활동 로그 (Audit Trail) | 백엔드 | 누가 어떤 항목을 언제 변경했는지 기록 |
| 다중 조합 관리 뷰 | 프론트 | 전문관리업체용: 담당 조합 전체 현황 한눈에 |

**완료 기준:** 전문관리업체 담당자 1명이 5개 조합의 진행 현황을 하나의 대시보드에서 관리 가능

---

### 스프린트 5 (9~10주차) — 시도별 조례 비교 + 유사 사례 검색 + 안정화

**목표:** 프리미엄 사용자(변호사·컨설팅사) 위한 고급 기능 + 전체 QA

| 태스크 | 담당 | 설명 |
|--------|------|------|
| 시도별 조례 비교 테이블 | 프론트 | 17개 광역시도 × 주요 항목(용적률, 동의 요건 등) |
| 조례 비교 데이터 수집 | 데이터 | 17개 시도 조례 핵심 항목 구조화 |
| 유사 사례 검색 (MVP) | 프론트+백 | pgvector 임베딩 기반 유사 사례 검색, 20개 시드 사례 |
| 법령 자동 갱신 크롤러 고도화 | 백엔드 | 국토부 보도자료 + 법제처 동시 모니터링 |
| E2E 테스트 (Playwright) | QA | 핵심 유저 플로우 5개 자동화 |
| 성능 최적화 | 풀스택 | 법령 뷰 페이지 LCP < 2.5s, React Flow lazy load |
| 접근성 감사 (WCAG AA) | 프론트 | 공무원·법무법인 사용 환경 고려 |

**완료 기준:** 전체 기능 QA 통과 + 사례 검색 20건 이상 + 조례 비교 17개 시도 커버

---

### 스프린트 일정 요약

| 스프린트 | 기간 | 주요 산출물 | 마일스톤 |
|----------|------|------------|---------|
| S1 | W1~W2 | 플로우차트 (재개발·재건축), 인증, 랜딩 | 베타 공개 가능 |
| S2 | W3~W4 | 법령 통합 뷰, 전체 유형 플로우차트 | 정보 플랫폼 완성 |
| S3 | W5~W6 | 일정 관리, 법령 알림, 결제 | **첫 매출** |
| S4 | W7~W8 | 조합 진행 관리, 다중 조합 뷰 | SaaS 핵심 완성 |
| S5 | W9~W10 | 조례 비교, 사례 검색, QA | **정식 런치** |

---

## 3. 페이지/라우트 구조 (사이트맵)

```
/                           ← 랜딩 페이지 (공개)
├── /login                  ← 로그인 (이메일 + 카카오)
├── /signup                 ← 회원가입 + 조합 등록
│
├── /explore                ← 비로그인 공개 탐색
│   ├── /explore/laws       ← 법령 통합 정리 뷰 (사업유형 탭)
│   └── /explore/flow       ← 절차 플로우차트 (사업유형 탭)
│
├── /dashboard              ← 조합 대시보드 (로그인 필요)
│   ├── /dashboard/[orgId]               ← 조합 홈 (현재 단계, 요약)
│   ├── /dashboard/[orgId]/flow          ← 내 조합 기준 절차 뷰
│   ├── /dashboard/[orgId]/checklist     ← 단계별 체크리스트
│   ├── /dashboard/[orgId]/calendar      ← 법정 기한 + 커스텀 일정
│   ├── /dashboard/[orgId]/documents     ← 서류 업로드 관리
│   ├── /dashboard/[orgId]/members       ← 멤버 초대·권한 관리
│   └── /dashboard/[orgId]/activity      ← 활동 로그
│
├── /laws                   ← 법령 정보 (로그인 권장, Free 접근)
│   ├── /laws/[type]        ← 사업유형별 법령 목록 (재개발|재건축|소규모|모아)
│   ├── /laws/[type]/[id]   ← 법령 상세 (조문 뷰어, 변경 이력)
│   └── /laws/compare       ← 시도별 조례 비교 테이블 (Pro+)
│
├── /flow                   ← 절차 플로우차트
│   └── /flow/[type]        ← 사업유형별 플로우 (재개발|재건축|소규모|모아)
│
├── /calendar               ← 전사 캘린더 (Pro+)
│
├── /cases                  ← 유사 사례 검색 (Enterprise)
│   └── /cases/[id]         ← 사례 상세
│
├── /alerts                 ← 법령 변경 알림 수신함
│
├── /settings               ← 계정·조합 설정
│   ├── /settings/profile
│   ├── /settings/organization
│   ├── /settings/members
│   ├── /settings/billing    ← 구독 플랜·결제
│   └── /settings/notifications
│
└── /admin                  ← 내부 운영 관리자 (슈퍼 어드민)
    ├── /admin/dashboard
    ├── /admin/organizations
    ├── /admin/laws          ← 법령 데이터 CMS
    └── /admin/cases         ← 사례 데이터 CMS
```

---

## 4. DB 스키마 설계

### 설계 원칙
- Supabase (PostgreSQL 15) 기반
- 멀티 테넌트: `organization_id` FK로 조합별 데이터 완전 격리
- Row Level Security (RLS) 전면 적용
- `updated_at` 트리거는 모든 테이블에 공통 적용

---

### 테이블 목록

#### `organizations` — 조합/기관 (테넌트 단위)

```sql
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                          -- 조합명
  type          TEXT NOT NULL                           -- 'association' | 'management_company' | 'consulting' | 'gov' | 'law_firm' | 'constructor'
                CHECK (type IN ('association','management_company','consulting','gov','law_firm','constructor')),
  project_type  TEXT,                                   -- 'redevelopment' | 'reconstruction' | 'small_scale' | 'moa'
  region        TEXT,                                   -- 시도 코드 (e.g. 'seoul', 'gyeonggi')
  district      TEXT,                                   -- 시군구
  address       TEXT,
  registration_number TEXT,                             -- 조합 등록번호
  established_at DATE,                                  -- 조합 설립일 (법정 기한 계산 기준)
  current_stage TEXT,                                   -- 현재 진행 단계 코드
  subscription_tier TEXT NOT NULL DEFAULT 'free'
                CHECK (subscription_tier IN ('free','pro','enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

#### `organization_members` — 조합 멤버 + 역할

```sql
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL
                  CHECK (role IN ('owner','admin','manager','viewer')),
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
```

#### `procedure_templates` — 절차 단계 템플릿 (마스터 데이터)

```sql
CREATE TABLE procedure_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type    TEXT NOT NULL,                        -- 'redevelopment' | 'reconstruction' | 'small_scale' | 'moa'
  stage_code      TEXT NOT NULL,                        -- e.g. 'RD-01', 'RD-02'
  stage_name      TEXT NOT NULL,                        -- e.g. '추진위원회 구성'
  stage_name_en   TEXT,
  sequence_order  INTEGER NOT NULL,
  description     TEXT,
  legal_basis     TEXT[],                               -- 법적 근거 조문 배열 (e.g. ['도시정비법 제31조', '서울시 조례 제5조'])
  typical_duration_months INT,                          -- 일반적 소요 기간 (월)
  legal_deadline_rule TEXT,                             -- 법정 기한 룰 (e.g. 'established_at + 2 years')
  required_consent_rate NUMERIC(5,2),                  -- 동의 요건 (%) — NULL이면 해당 없음
  required_documents TEXT[],                            -- 필수 서류 목록
  node_x          NUMERIC,                              -- React Flow 노드 위치
  node_y          NUMERIC,
  is_parallel     BOOLEAN DEFAULT FALSE,               -- 병렬 진행 가능 여부
  parent_stage_code TEXT,                               -- 선행 단계
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_type, stage_code)
);
```

#### `project_progress` — 조합별 절차 진행 현황

```sql
CREATE TABLE project_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_code      TEXT NOT NULL,
  project_type    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','in_progress','completed','skipped','blocked')),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  legal_deadline  DATE,                                 -- 법정 기한 (룰 엔진으로 자동 계산)
  notes           TEXT,
  completed_by    UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, stage_code)
);
```

#### `checklist_items` — 단계별 체크리스트 항목

```sql
CREATE TABLE checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_code      TEXT NOT NULL,
  title           TEXT NOT NULL,                        -- 체크 항목명
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_by    UUID REFERENCES auth.users(id),
  completed_at    TIMESTAMPTZ,
  is_required     BOOLEAN DEFAULT TRUE,
  source          TEXT DEFAULT 'user'                   -- 'template' | 'user'
                  CHECK (source IN ('template','user')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `documents` — 서류 첨부

```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_code      TEXT,
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,                        -- Supabase Storage 경로
  file_size_bytes BIGINT,
  mime_type       TEXT,
  description     TEXT,
  uploaded_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `laws` — 법령/조례 마스터

```sql
CREATE TABLE laws (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_code        TEXT NOT NULL UNIQUE,                 -- e.g. 'URBAN_REGEN_ACT'
  name            TEXT NOT NULL,                        -- e.g. '도시 및 주거환경정비법'
  short_name      TEXT,                                 -- e.g. '도시정비법'
  law_type        TEXT NOT NULL
                  CHECK (law_type IN ('national_law','presidential_decree','ordinance','guideline')),
  applicable_types TEXT[],                              -- 적용 사업 유형
  region          TEXT,                                 -- NULL이면 전국, 'seoul' 등
  source_url      TEXT,                                 -- 국가법령정보센터 URL
  last_amended_at DATE,
  effective_at    DATE,
  version         TEXT,                                 -- 법령 개정 버전/공포번호
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `law_articles` — 법령 조문

```sql
CREATE TABLE law_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_id          UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  article_number  TEXT NOT NULL,                        -- e.g. '제31조'
  title           TEXT,
  content         TEXT NOT NULL,
  tags            TEXT[],                               -- 관련 단계 코드 태그
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `law_change_logs` — 법령 변경 이력

```sql
CREATE TABLE law_change_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_id          UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  change_type     TEXT NOT NULL
                  CHECK (change_type IN ('amendment','repeal','new_enactment','partial_change')),
  changed_at      DATE NOT NULL,
  summary         TEXT,
  affected_articles TEXT[],
  source_url      TEXT,
  notified        BOOLEAN DEFAULT FALSE,                -- 알림 발송 여부
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `ordinance_comparison` — 시도별 조례 비교 데이터

```sql
CREATE TABLE ordinance_comparison (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region          TEXT NOT NULL,                        -- 시도 코드
  project_type    TEXT NOT NULL,
  item_key        TEXT NOT NULL,                        -- 비교 항목 키 (e.g. 'floor_area_ratio_incentive')
  item_name       TEXT NOT NULL,                        -- e.g. '용적률 인센티브 상한'
  value           TEXT,                                 -- 해당 시도의 값
  unit            TEXT,                                 -- 단위 (%, %, m² 등)
  basis_article   TEXT,                                 -- 근거 조문
  last_verified_at DATE,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (region, project_type, item_key)
);
```

#### `calendar_events` — 일정 관리

```sql
CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  event_type      TEXT NOT NULL
                  CHECK (event_type IN ('legal_deadline','custom','meeting','submission','notification')),
  stage_code      TEXT,
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ,
  is_all_day      BOOLEAN DEFAULT FALSE,
  description     TEXT,
  is_auto_generated BOOLEAN DEFAULT FALSE,              -- 룰 엔진 자동 생성 여부
  law_basis       TEXT,                                 -- 법적 근거
  reminder_days   INTEGER[],                            -- 알림 트리거 일수 배열 [30, 7, 1]
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `notifications` — 알림 수신함

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL
                  CHECK (type IN ('law_change','deadline_reminder','checklist','member_activity','system')),
  title           TEXT NOT NULL,
  body            TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  action_url      TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

#### `cases` — 유사 사례 (v2)

```sql
CREATE TABLE cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  project_type    TEXT NOT NULL,
  region          TEXT,
  stage_code      TEXT,
  summary         TEXT,
  full_content    TEXT,
  outcome         TEXT,
  tags            TEXT[],
  source          TEXT,                                 -- 출처 (판례번호, 국토부 보도자료 등)
  embedding       vector(1536),                         -- pgvector OpenAI 임베딩
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON cases USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### `activity_logs` — 활동 로그 (Audit Trail)

```sql
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,                        -- e.g. 'checklist.complete', 'document.upload'
  resource_type   TEXT,                                 -- 'checklist_item' | 'document' | 'progress' 등
  resource_id     UUID,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

### RLS 정책 원칙

```sql
-- organizations: 해당 organization_members에 속한 user_id만 SELECT/UPDATE
-- project_progress: organization_id 기준 멤버만 접근
-- documents: organization_id 기준 멤버만 접근, viewer는 DELETE 불가
-- laws, law_articles, procedure_templates: 전체 공개 (SELECT only for anon)
-- cases: is_published=TRUE인 경우만 anon SELECT 허용
-- activity_logs: organization_id 기준 admin/owner만 SELECT
```

---

## 5. 핵심 유저 플로우

### 플로우 A: 조합 가입 → 절차 조회 → 진행 관리

```
[랜딩 페이지]
  ↓ "무료로 시작하기" CTA 클릭
[회원가입]
  - 이메일 또는 카카오 소셜 로그인
  - 이름, 연락처 입력
  ↓
[조합 등록 또는 참여]
  ┌─ 신규 조합 등록 →
  │   - 조합명, 사업 유형 선택 (재개발/재건축/소규모/모아주택)
  │   - 지역 선택 (시도 → 시군구)
  │   - 현재 진행 단계 선택 (플로우차트에서 클릭)
  │   - 조합 설립일 입력 (또는 미정)
  │   └─ 조합 대시보드로 이동
  └─ 초대 링크로 참여 →
      - 초대 코드 입력 또는 링크 클릭
      - 역할 확인 (manager/viewer)
      └─ 조합 대시보드로 이동
  ↓
[조합 대시보드 — /dashboard/[orgId]]
  - 현재 단계 하이라이트된 플로우차트 (전체 진행률 표시)
  - 이번 달 법정 기한 알림 카드
  - 미완료 체크리스트 항목 카드
  - 최근 활동 로그
  ↓ "현재 단계 상세 보기"
[단계 상세 — /dashboard/[orgId]/checklist?stage=RD-05]
  - 해당 단계 설명 + 법적 근거 조문 (법령 뷰어 팝업 가능)
  - 체크리스트 항목 목록 (필수/선택 구분)
  - 서류 첨부 섹션
  - 메모 입력
  ↓ 체크리스트 100% 완료
["단계 완료" 확인 모달]
  - 완료 날짜 확인
  - 다음 단계 자동 계산된 법정 기한 미리보기
  ↓ 확인
[다음 단계 자동 전환 + 캘린더 이벤트 생성]
  - project_progress.status = 'completed'
  - 다음 단계 legal_deadline 자동 계산
  - calendar_events 자동 생성 (D-30, D-7, D-1 알림 설정)
  - 멤버 전원에게 알림 발송
  ↓
[캘린더 뷰 — /dashboard/[orgId]/calendar]
  - 방금 생성된 법정 기한 이벤트 확인
  - 과거/미래 단계 타임라인 확인
  - 커스텀 일정 추가 (총회, 설명회 등)
```

---

### 플로우 B: 법령 변경 알림 수신 → 확인 → 체크리스트 반영

```
[이메일 수신: "도시정비법 개정 알림"]
  - 변경된 조문 요약
  - "정비나라에서 상세 확인" 링크
  ↓
[알림 상세 — /alerts/[notificationId]]
  - 변경 조문 전후 비교 (diff 뷰)
  - 내 조합의 현재 단계와 연관성 표시
  - "관련 체크리스트 업데이트 필요" 안내
  ↓ "체크리스트 확인하기"
[체크리스트 — /dashboard/[orgId]/checklist]
  - 개정 법령 영향을 받는 항목 강조 표시
```

---

### 플로우 C: 전문관리업체 — 다중 조합 현황 파악

```
[다중 조합 대시보드 — /dashboard]
  - 담당 조합 카드 목록 (각 조합명, 사업유형, 현재 단계, 다음 법정 기한)
  - 긴급 알림 (D-7 이내 법정 기한 있는 조합 빨간 뱃지)
  ↓ 특정 조합 클릭
[해당 조합 대시보드로 이동]
  (플로우 A 동일)
```

---

## 6. 요금제 제안

### 설계 원칙

1. **Free 플랜은 실제로 쓸 수 있어야 한다** — 플로우차트, 법령 뷰는 무료. 영업 도구가 아니라 서비스 자체
2. **Pro 플랜은 조합 하나를 제대로 관리하는 가격** — 조합 운영 사무비 대비 압도적 저렴
3. **Enterprise는 전문관리업체 전용** — 다중 조합 + 데이터 내보내기 + 전담 지원

---

### 요금제 상세

| 기능 | Free | Pro | Enterprise |
|------|------|-----|------------|
| **가격** | 무료 | 월 59,000원 | 월 299,000원 |
| **조합 수** | 1개 (읽기 전용) | 1개 (전체 관리) | 무제한 |
| 절차 플로우차트 조회 | O | O | O |
| 법령/조례 통합 정리 뷰 | O (전체) | O | O |
| 법령 변경 알림 | 월 1회 | 실시간 | 실시간 + 슬랙 연동 |
| 절차 진행 관리 (체크리스트) | X | O | O |
| 서류 첨부 저장 용량 | X | 10 GB | 100 GB |
| 일정 관리 (법정 기한 자동 계산) | X | O | O |
| 멤버 초대 수 | X | 10명 | 무제한 |
| 시도별 조례 비교 테이블 | 3개 시도 미리보기 | O (17개 시도) | O |
| 유사 사례 검색 | X | X | O |
| 다중 조합 통합 대시보드 | X | X | O |
| 활동 로그 (Audit Trail) | X | 30일 | 무제한 |
| 데이터 CSV 내보내기 | X | X | O |
| 전담 CS 지원 | X | 이메일 | 전담 담당자 |
| API 접근 | X | X | O |

---

### 요금 근거

**Pro (월 59,000원):**
- 조합 운영 사무비는 통상 월 200~500만원 수준 → 비교 대상 아님, 압도적 저렴
- 법무법인 법령 검토 의뢰 시 건당 50~200만원 → Pro 1개월로 일상 업무 자가 해결
- 연 결제 시 20% 할인 (월 47,200원 상당)

**Enterprise (월 299,000원):**
- 정비사업전문관리업체 평균 담당 조합 수: 10~30개
- 조합당 환산 시 월 10,000~30,000원 → 허가받은 관리업체에게 극히 저렴
- 연 결제 시 15% 할인

**Free 전략:**
- 공무원, 변호사, 연구자 등 구매 결정권이 없는 사용자 층을 공개 정보 제공으로 유입
- 이들이 조합에 정비나라를 추천하는 내부 전도사(Evangelists)로 기능

---

### 성장 전망 (보수적 시나리오)

| 월차 | Free | Pro | Enterprise | MRR |
|------|------|-----|------------|-----|
| M3 | 200 | 10 | 1 | 889,000원 |
| M6 | 800 | 40 | 5 | 3,855,000원 |
| M12 | 2,000 | 120 | 20 | 13,060,000원 |

- 국내 정비사업 추진 조합 수: 약 2,000~3,000개 (서울 기준 700개 이상)
- 정비사업전문관리업체 등록 사: 약 600개
- TAM 기준 Pro 전환율 5~10%만 달성해도 연 매출 3~5억원 도달 가능

---

## 7. 핵심 리스크 및 대응 전략

### 리스크 1. 법령 데이터 수동 구조화 공수 과대

- **위험:** 도시정비법 조문 수백 개를 수작업 입력 시 S1~S2 일정 초과
- **대응:** S1에서는 핵심 10개 단계의 법적 근거만 구조화. 나머지는 국가법령정보센터 링크 임베드로 처리. 크롤러(S3)로 자동화 후 소급 적용

### 리스크 2. 국가법령정보센터 크롤링 차단

- **위험:** robots.txt 강화 또는 IP 차단 시 법령 자동 갱신 기능 미작동
- **대응:** 법제처 OpenAPI (open.law.go.kr) 공식 API 우선 활용. 크롤링은 보조 수단으로만 운용. API 키 발급은 런치 전 완료

### 리스크 3. 멀티테넌트 데이터 격리 실수

- **위험:** RLS 정책 누락 시 조합 A가 조합 B의 데이터를 열람
- **대응:** Supabase RLS 전면 적용 + 모든 쿼리에 `organization_id` 필터 의무화 + E2E 테스트에 크로스 테넌트 시나리오 포함 (S5)

### 리스크 4. 초기 법령 데이터 오류로 인한 신뢰 훼손

- **위험:** 잘못된 조문 해석 → 실무자 오판 → 법적 분쟁 책임 이슈
- **대응:** 모든 법령 정보에 "참고용 정보이며 법적 효력 없음" 면책 문구 명시. 서비스 이용약관에 정보 오류 책임 제한 조항 포함. 초기 데이터는 전문가 1인 검토 후 공개

### 리스크 5. 유사 사례 데이터 수집 불가

- **위험:** 판례·사례 저작권 문제 또는 데이터 양 부족
- **대응:** RICE 최하위 기능으로 이미 분류. S5에서 파일럿 20건만 시드. 이후 사용자 기여(User-generated cases) 모델로 전환 검토

---

## 8. MVP vs v2 경계

### MVP (10주, S1~S5 전체)
- 절차 플로우차트 (4개 사업유형)
- 법령/조례 통합 정리 뷰
- 법령 자동 갱신/알림
- 조합별 절차 진행 관리
- 일정 관리 (법정 기한 자동 계산)
- 시도별 조례 비교 테이블
- 유료 결제 (토스페이먼츠)

### v2 (런치 후 3개월 이내)
- 유사 사례 검색 (pgvector 임베딩)
- 모바일 앱 (React Native 또는 PWA 강화)
- 슬랙/카카오워크 알림 연동
- API 개방 (Enterprise 전용)
- 국토부·LH 입찰 공고 연동 알림
- 조합원 총회 의결 관리 모듈

---

*이 문서는 /build 단계 착수 전 @cpo 최종 검토가 필요합니다.*
*다음 단계: /build — @backend-developer (Supabase 스키마 마이그레이션 + 법제처 API 연동)*

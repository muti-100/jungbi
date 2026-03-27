# 정비나라 (Jungbi) — 코드 리뷰

> 작성일: 2026-03-27
> 검토 대상: projects/jungbi/src/web/src/ (33개 파일)
> 검토자: @code-reviewer

---

## 요약

| 등급 | 건수 | 상태 |
|------|------|------|
| 🔴 Critical | 2건 | ✅ 자동 수정 완료 |
| 🟡 Warning | 5건 | 사용자 판단 필요 |
| 🟢 Suggestion | 4건 | 선택 사항 |

---

## 🔴 Critical — 자동 수정 완료

### C1. 인증 미들웨어 없음 (보안)

- **파일**: 없음 → `src/middleware.ts` 신규 생성
- **문제**: 대시보드, 법령, 캘린더 등 모든 라우트가 인증 없이 접근 가능
- **위험**: 유료 SaaS 콘텐츠가 무인증 노출, 조합 데이터 무단 접근 가능
- **수정**: Supabase Auth 기반 미들웨어 추가
  - 공개 경로: `/`, `/login`, `/signup`, `/api/health`
  - 비인증 사용자 → `/login?redirect={path}`로 리다이렉트
  - Supabase 미설정 시(dev 모드) 통과 허용

### C2. next.config 보안 헤더 없음

- **파일**: `next.config.mjs`
- **문제**: X-Frame-Options, HSTS, Content-Type-Options 등 보안 헤더 미설정
- **위험**: 클릭재킹, MIME 스니핑 공격 가능
- **수정**: 6개 보안 헤더 추가
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `X-DNS-Prefetch-Control: on`

---

## 🟡 Warning — 사용자 판단 필요

### W1. FlowPage에서 매 렌더마다 노드/엣지 재생성 (성능)

- **파일**: `src/app/(dashboard)/flow/page.tsx:423-424`
- **문제**: `buildNodes()`, `buildEdges()`가 렌더마다 호출되어 불필요한 재계산
- **상태**: ✅ `useMemo`로 자동 수정 완료

### W2. Calendar AddEventModal이 공유 Modal 컴포넌트 미사용

- **파일**: `src/app/(dashboard)/calendar/page.tsx:162-259`
- **문제**: `components/ui/Modal.tsx`가 이미 포커스 트랩, ESC 닫기 등을 구현하고 있으나, 캘린더 페이지는 자체 모달을 인라인으로 구현
- **영향**: 코드 중복, 포커스 트랩 누락 (AddEventModal에 포커스 트랩 없음)
- **권장**: `Modal` 컴포넌트로 교체

### W3. 라우트 그룹에 loading.tsx / error.tsx 없음

- **파일**: `src/app/(dashboard)/`, `src/app/(auth)/`
- **문제**: 라우트 그룹에 `loading.tsx`, `error.tsx`가 없어서 로딩/에러 시 빈 화면 표시
- **권장**: 각 라우트 그룹에 Skeleton 기반 loading.tsx 및 error boundary 추가

### W4. 법령 검색의 regex가 빈 문자열일 때 모든 텍스트 매칭

- **파일**: `src/app/(dashboard)/laws/page.tsx:242`
- **문제**: `HighlightedText`에서 `term`이 빈 문자열이면 early return하지만, `regex.test(part)`가 빈 패턴에서 true 반환 가능
- **상태**: 현재 코드에서 `if (!term) return <>{text}</>` 가드로 보호됨 — 실제 위험 낮음
- **참고**: 현재는 안전하나, 향후 리팩토링 시 주의

### W5. 개별 페이지 metadata 누락 (SEO)

- **파일**: 모든 `(dashboard)/**` 페이지
- **문제**: 개별 페이지에 `export const metadata`가 없어서 root layout의 기본 metadata만 사용됨
- **권장**: 주요 페이지에 페이지별 metadata 추가 (title, description)

---

## 🟢 Suggestion — 선택 사항

### S1. 테스트 코드 없음

- 현재 E2E/단위 테스트가 전혀 없음
- plan.md S5에서 Playwright E2E 예정이나, 핵심 유틸(`escapeRegExp`, `cn` 등) 단위 테스트는 조기 추가 권장

### S2. components/flow/FlowchartNode.tsx 미사용

- `src/components/flow/FlowchartNode.tsx` — 별도 파일로 존재하나 flow/page.tsx에서 인라인 정의된 FlowchartNode를 사용
- 사용되지 않는 파일 삭제 또는 page.tsx에서 import하도록 통합 권장

### S3. Supabase 타입 자동 생성 미연동

- `src/types/database.ts`가 수동 작성 — Supabase CLI `supabase gen types typescript` 결과와 동기화되지 않음
- Supabase 프로젝트 연결 후 자동 생성 파이프라인 구축 권장

### S4. 다크모드 미지원

- UI 디자인 스펙에서 라이트 모드만 정의됨
- 공무원/법무법인의 야간 사용 시나리오 고려 시 다크모드 v2 검토

---

## 보안 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| XSS (dangerouslySetInnerHTML) | ✅ 안전 | 사용하지 않음. HighlightedText는 React 노드로 렌더링 |
| RegExp DoS | ✅ 안전 | escapeRegExp 함수로 사용자 입력 이스케이프 |
| 환경 변수 노출 | ✅ 안전 | NEXT_PUBLIC_ 접두사만 클라이언트 노출, 서비스키는 서버 전용 |
| 비밀 키 하드코딩 | ✅ 안전 | .env.example에 플레이스홀더만 존재 |
| CSRF | ✅ 안전 | Supabase Auth 쿠키 기반 + SameSite 설정 |
| 인증 미들웨어 | ✅ 수정 완료 | C1에서 추가 |
| 보안 헤더 | ✅ 수정 완료 | C2에서 추가 |
| SQL Injection | N/A | 현재 직접 쿼리 없음 (데모 데이터만) |
| RLS 정책 | ⏳ 미적용 | Supabase 스키마 마이그레이션 시 적용 예정 |

---

## 코드 품질 점수

| 항목 | 점수 | 비고 |
|------|------|------|
| TypeScript 엄격도 | 9/10 | strict mode, 빌드 에러 0 |
| 접근성 (a11y) | 8/10 | aria-label, role, skip-nav 전반 적용. 일부 모달 포커스 트랩 누락 |
| 디자인 시스템 준수 | 9/10 | 커스텀 토큰 전면 적용, generic tailwind 클래스 제거 완료 |
| 보안 | 8/10 | 미들웨어 + 보안 헤더 추가 후 양호. RLS 미적용은 DB 연결 시 해결 예정 |
| 성능 | 7/10 | useMemo 적용. FullCalendar 번들 크기(73kB) 최적화 여지 있음 |
| 테스트 커버리지 | 1/10 | 테스트 없음 |

**종합: 7.0/10** — 프로덕션 배포 전 W2, W3 해결 및 핵심 경로 E2E 테스트 추가 권장

---

*다음 단계: /ship — Docker, CI/CD, README 작성*

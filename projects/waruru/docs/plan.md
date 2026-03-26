# Execution Plan: Waruru
> Real-time offline social matching — Seoul launch blueprint
> Generated: 2026-03-26 | North Star: MAU 58,000 in 6 months

---

## Tech Stack

| Layer | Choice | Version | Reason |
|-------|--------|---------|--------|
| **Mobile** | Flutter | 3.22 | flutter_blue_plus BLE 플러그인 생태계 |
| **Web/Admin** | Next.js | 14.2 (App Router) | SSR 랜딩 + RSC 어드민 대시보드 |
| **Backend** | NestJS | 10.x (Node 20 LTS) | 기존 Clean Architecture 유지 |
| **Edge Function** | Supabase Edge Functions | Deno 1.43 | OSRM 호출 엣지 처리, cold start 50ms 이하 |
| **Realtime** | Supabase Realtime | — | 기존 채팅 WebSocket → BLE 이벤트 확장 |
| **Database** | PostgreSQL + PostGIS | 15.6 | 장소 지오 쿼리 |
| **Cache** | Redis (Upstash) | 7.2 | BLE 확인 TTL 300s, 매칭 큐 상태 |
| **AI** | OpenAI text-embedding-3-small + Python sidecar | — | Big Five 코사인 유사도, A/B 변형 격리 |
| **Routing** | OSRM self-hosted | 5.27 (t3.small) | 서울 도로망 사전 로딩, 무료 |
| **A/B Test** | GrowthBook | 0.35 (self-hosted) | PIPA 준수, Flutter+NestJS SDK |

---

## Market Validation

- **시장 규모**: 한국 소셜/데이팅 앱 USD 180–240M (2024), 성장세 (1인 가구 35% 돌파, 포스트 코로나 오프라인 반등)
- **기회 점수**: 8/10 — 콜드 스타트(-1), 여성 안전 인식(-1)
- **공백**: 실시간 + 1:1 + 성격 매칭 + 장소 자동 제안 + 만남 후 기억을 한 플로우로 연결한 제품 없음
- **포지셔닝**: "지금 이 시간, 당신 근처의 누군가와 — 앱이 장소까지 잡아드립니다." (스와이프 피로 직장인 25-35세 타깃)

| 경쟁사 | 공백 |
|--------|------|
| Tinder Korea | 외모 중심, 실제 만남 촉진 없음, 성격 매칭 없음 |
| STST | 실시간 불가, 만남 후 리텐션 루프 없음 |
| Timeleft | 주 1회 고정, 그룹(6명), 한국 미진출 |

**경쟁 우위 3가지**
1. 전 단계 마찰 제거: 누굴(Big Five) → 어디서(OSRM) → 도착 확인(BLE) → 재방문 이유(롤링페이퍼)
2. 롤링페이퍼 리텐션 해자: Between이 증명한 기억 메커닉을 신규 만남에 최초 적용
3. 즉흥 만남 미점유: "오늘 저녁 90분" 유스케이스 — 경쟁사 전원 미점유

**시장 리스크**
1. 콜드 스타트 → 강남+마포 집중, 오후 6–9시 매칭 윈도우 우선 운영
2. 여성 안전 인식 → KYC 필수 + "여성 먼저" 안전 내러티브 GTM 전면 배치

---

## Features by Priority (RICE)

| # | 기능 | Reach | Impact | Confidence | Effort(wk) | RICE |
|---|------|-------|--------|------------|------------|------|
| 1 | 롤링페이퍼 polish (애니메이션 + 공유카드) | 7 | 9 | 80% | 1 | **50.4** |
| 2 | 팝업 이벤트 (서울 현장 체험) | 8 | 9 | 60% | 1 | **43.2** |
| 3 | 안전장치 — KYC + 신고 플로우 | 6 | 7 | 90% | 1 | **37.8** |
| 4 | Venue DB 완성 (5개 구 + OSRM Edge Fn) | 8 | 8 | 80% | 2 | **25.6** |
| 5 | 한국 GTM — 인플루언서 + 커뮤니티 시딩 | 9 | 8 | 65% | 2 | **23.4** |
| 6 | Big Five A/B 테스트 (50쌍 검증) | 6 | 9 | 75% | 2 | **20.3** |
| 7 | BLE 도착 확인 Flutter 플러그인 | 7 | 8 | 70% | 2 | **19.6** |
| 8 | 레거시 서비스 마이그레이션 (bridge pattern) | 5 | 7 | 85% | 2 | **14.9** |

---

## User Stories

1. **강남의 혼자인 직장인으로서** 나와 매칭된 상대방 사이의 중간 약속 장소를 앱이 자동으로 제안해줬으면 한다. 어디서 만날지 협의 시간을 0으로 줄이기 위해.
2. **처음 사용하는 유저로서** BLE가 자동으로 도착을 확인해서 롤링페이퍼가 자동으로 열렸으면 한다. 만남의 마찰을 최소화하고 싶기 때문에.
3. **매칭 수신자로서** 만남 이후 롤링페이퍼 비둘기 애니메이션을 받고 싶다. 이 만남이 기억에 남아야 다음에도 앱을 열기 때문에.
4. **안전을 중시하는 유저로서** 신고 후 2시간 이내에 검토 결과를 받고 싶다. 낯선 사람을 만날 만큼 플랫폼을 신뢰할 수 있어야 하기 때문에.
5. **파워 유저로서** 매칭 수락 전에 Big Five 궁합 점수를 보고 싶다. 의도된 페어링이라는 확신이 있어야 실제로 나가기 때문에.

---

## Screens

| # | 스크린 | 목적 | 주요 컴포넌트 | 핵심 인터랙션 | 엣지 케이스 |
|---|--------|------|-------------|-------------|------------|
| 1 | Splash | 브랜드 + 네트워크 감지 | 로고 애니메이션, 오프라인 배너 | 1.8초 자동 이동 | 오프라인 → 연결 안내 팝업 |
| 2 | Big Five 테스트 | 성격 벡터 수집 | WruSlider, 진행률 바, 마이크로카피 | 문항 자동 진행, 중단 시 로컬 저장 | 재진입 시 이어서 시작 |
| 3 | 매칭 대기 | 큐 상태 + 기대감 유지 | 예상 대기시간, 취소, 백그라운드 배너 | 실시간 대기열 표시 | 30분 초과 → graceful empty state |
| 4 | 매치 카드 | 15초 내 수락/거절 | 사진(blur), Big Five 점수, 태그, 타이머 | 수락/거절 스와이프 | 상대 취소 → 알림 + 큐 재진입 |
| 5 | 장소 제안 지도 | 의사결정 부담 제거 | WruVenueCard ×3, 지도, 딥링크 | 재롤 2회 한도 | 장소 없음 → 500m→1km 자동 확장 |
| 6 | 이동 중 상태 | 이탈 방지 + 상호 확인 감 | 내 ETA, "상대방도 이동 중" 인디케이터 | ETA 차이 >15분 경고 | 한쪽 취소 → 즉시 알림 |
| 7 | BLE 도착 확인 | 만남 성사 공식 확인 | 도착 감지 애니메이션, 수동 폴백 버튼 | BLE 50m 자동 감지 | BLE 비활성 → OS 딥링크 + 수동 확인 |
| 8 | 롤링페이퍼 + 갤러리 | 감성 루프 완성 + 재방문 동기 | 텍스트+이모지 입력, 언박싱 애니메이션, 갤러리 그리드 | 작성 → 피규어 생성 → 공유 | 상대 탈퇴 시 컬렉션 보존, 갤러리 0개 → 매칭 CTA |

### Design System Tokens
- **Primary**: `#E86A3A` (테라코타 — 신뢰감 있는 따뜻함, 메인 CTA)
- **Secondary**: `#3A7BD5` (KYC·인증 맥락 전용 — 안전 신호)
- **Font**: Pretendard (한국어 최적화, Flutter 단일 패밀리)
- **Reusable components**: `WruButton` (primary/secondary/ghost), `WruProfileChip` (사진+이름+태그), `WruBottomSheet` (장소/수락/신고 공통)

---

## API Endpoints

| # | Method | Path | 목적 |
|---|--------|------|------|
| 1 | POST | `/v1/auth/verify-phone` | KYC 전화번호 OTP |
| 2 | POST | `/v1/matching/queue` | 매칭 큐 진입 (위치 + Big Five 스냅샷) |
| 3 | DELETE | `/v1/matching/queue` | 큐 이탈 |
| 4 | GET | `/v1/matching/{match_id}` | 매치 상태 + 배정 장소 조회 |
| 5 | POST | `/v1/venue/midpoint` | OSRM 중간지점 계산 — top-3 장소 반환 |
| 6 | POST | `/v1/arrival/ble-event` | Flutter BLE 스캔 이벤트 수신 |
| 7 | GET | `/v1/arrival/{match_id}/status` | 양측 도착 확인 상태 |
| 8 | POST | `/v1/rolling-paper/{match_id}` | 롤링페이퍼 생성 |
| 9 | GET | `/v1/rolling-paper/{match_id}` | 피규어 URL 포함 롤링페이퍼 조회 |
| 10 | POST | `/v1/figurine/generate` | AI 피규어 생성 잡 트리거 |
| 11 | GET | `/v1/abtest/assignment` | GrowthBook 실험 변형 조회 |
| 12 | POST | `/v1/legacy/migrate` | 레거시 서비스 브릿지 프록시 |

---

## DB Schema

```sql
users          (id, big_five_vector, interests[], location_point, kyc_verified)
venues         (id, name, category, location_point GEOMETRY, district, open_hours)
matches        (id, user_a_id, user_b_id, venue_id, status, ab_variant, created_at)
arrival_events (id, match_id, user_id, method[ble|gps_fallback], rssi, confirmed_at)
rolling_papers (id, match_id, author_id, message, figurine_url, created_at)
-- matches가 허브: users(x2) + venues 참조, arrival_events(1:N) + rolling_papers(1:1) 매달림
```

### BLE 도착 확인 플로우
```
Flutter → beacon_id + rssi + match_id → WebSocket
  → NestJS: RSSI >= -75 dBm 검증
  → arrival_events INSERT + Redis TTL 300s
  → 양측 확인: matches.status = 'arrived'
  → 양측 push: arrival_confirmed → 롤링페이퍼 자동 오픈
  폴백: GPS <= 100m → method = 'gps_fallback'
```

### OSRM 중간지점 알고리즘
```python
candidates = venues.filter(district=midpoint_district)[:20]
for v in candidates:
    t_a, t_b = osrm.duration(user_a→v), osrm.duration(user_b→v)
    score = -(abs(t_a - t_b) + 0.3 * max(t_a, t_b))  # 공정성 + 최대 이동시간 페널티
return sorted(candidates, key=score)[:3]
```

---

## Sprint Plan

### W1–2: 코어 제품 완성
| Task | Exit Criteria |
|------|---------------|
| 롤링페이퍼 polish (애니메이션 + 공유카드) | 공유율 >= 30% (내부 테스트) |
| Big Five A/B 하네스 설치 (GrowthBook + Python sidecar) | p-value 프레임워크 + 50쌍 로깅 |
| Venue DB 스크래핑 + QA (5개 구) | 구당 200개+ / OSRM p99 < 300ms |
| OSRM Edge Function 스테이징 배포 | cold start < 500ms, 스테이징 그린 |

### W3–4: 인프라 + 안전망
| Task | Exit Criteria |
|------|---------------|
| BLE Flutter 플러그인 현장 정확도 테스트 | iOS+Android 90%+ |
| 레거시 브릿지 패턴 | 채팅/결제 회귀 0건 |
| KYC + 신고 플로우 | 리뷰 SLA < 2시간 |
| 풀 E2E QA | P0 버그 0건, P1 < 3건 |

### W5–6: GTM + 런치
| Task | Exit Criteria |
|------|---------------|
| 인플루언서 시딩 10명 (나노/마이크로) | 포스트 3건+ 라이브 |
| 커뮤니티 시딩 (에브리타임/블라인드/오픈카톡) | 웨이트리스트 500명 |
| 팝업 이벤트 (강남 or 마포) | 현장 매칭 50건+ |
| App Store + Play Store 제출 | 양 스토어 승인 |
| 런치 워룸 | p99 < 800ms, 크래시율 < 0.5% |

---

## Launch Readiness — Definition of Done

| 게이트 | 통과 기준 |
|--------|-----------|
| 매칭 | Big Five 50쌍 검증 + A/B 하네스 프로덕션 배포 |
| 장소 | 5개 구 각 200개+ + OSRM p99 < 300ms |
| 도착 확인 | BLE 정확도 iOS+Android 90%+ |
| 리텐션 | 베타 코호트 롤링페이퍼 완성률 40%+ |
| 안전 | KYC 활성화 + 신고 리뷰 SLA < 2시간 |
| 마이그레이션 | 채팅/결제 회귀 버그 0건 |
| GTM | 웨이트리스트 500명 + 인플루언서 포스트 1건+ 라이브 |
| 인프라 | 크래시율 < 0.5% + 동접 500 기준 p99 < 800ms |

**8개 게이트 ALL GREEN → App Store 제출**

---

## User Flow (목표: 설치 → 첫 만남 30분 이내)

| 단계 | 액션 | 목표 지표 |
|------|------|----------|
| 1. 설치 | 카카오 소셜 로그인 | — |
| 2. KYC | 셀피 + 신분증 촬영 | 완료 < 90초 |
| 3. Big Five | 15문항 슬라이더 | 이탈률 < 20% |
| 4. 온보딩 완료 | 관심사 + 사진 2장 | — |
| 5. 큐 진입 | "지금 만나기" + GPS 허용 | — |
| 6. 매치 수락 | 15초 타이머 | 수락률 > 60% |
| 7. 장소 확인 | 중간지점 카페 3곳 | 첫 번째 선택률 > 70% |
| 8. 이동 | 카카오맵 딥링크 | 이탈률 < 30% |
| 9. BLE 도착 | 50m 반경 양측 감지 | 만남 성사 |
| 10. 롤링페이퍼 | 메시지 → 피규어 수령 | 작성률 > 50% |

**완주율 목표:** Step 1→9 = 35% (론치 4주차 기준)

---

## Risks + Mitigations

| Risk | 확률 | Mitigation |
|------|------|------------|
| BLE false-positive (iOS) | High | RSSI 기기별 튜닝 + 수동 확인 폴백 |
| Big Five 품질 불만 (W1) | Medium | 궁합 이유 UI 노출 + 빠른 가중치 재조정 루프 |
| Venue DB 미완성 | Medium | 구당 검증 20곳 하드코딩 폴백 |
| 여성 안전 사고 → SNS 증폭 | Medium | KYC 필수 + GTM "여성 먼저" 안전 내러티브 |
| 콜드 스타트 매치 0건 이탈 | High | 강남+마포 2구 집중, 오후 6-9시 윈도우 |

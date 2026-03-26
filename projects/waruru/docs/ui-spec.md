# Waruru — UI Screen Architecture Spec
_Owner: @ui-designer | Date: 2026-03-26_

---

## Design System Tokens

| Token | Value | Rationale |
|-------|-------|-----------|
| `color-primary` | `#E86A3A` (warm terracotta) | Trustworthy warmth, not romantic red |
| `color-secondary` | `#3A7BD5` (calm blue) | Reliability signal for KYC/safety contexts |
| `color-surface-light` | `#FAF8F5` | Off-white; reduces harsh contrast |
| `color-surface-dark` | `#1C1A18` | Warm dark, not pure black |
| `color-success` | `#4CAF7D` | Arrival confirmation, match |
| `font-display` | Pretendard Bold | Korean-optimized, wide glyph support |
| `font-body` | Pretendard Regular | Same family; clean at 14–16sp |
| `radius-card` | `20px` | Friendly, not sharp |
| `touch-min` | `44px` | Accessibility floor, all tappables |
| `spacing-unit` | `8px` base grid | Flutter-native alignment |

---

## 8 Key Screens

### 1. Splash / Brand Entry
**Purpose:** Establish brand identity and initialize auth state check.

**Key Components:**
- Centered logo mark (animated scale-in, 600ms)
- Tagline: `"오늘, 딱 한 명"` — 16sp, body, fade-in after logo
- Background: `color-surface-light` / `color-surface-dark`

**Primary Interaction:** None — auto-navigates after 1.8s to either Home or KYC.

**Edge Case:** If network offline on first launch, surface an inline toast (`"인터넷 연결을 확인해주세요"`) with retry CTA before navigating.

---

### 2. Big Five Personality Test
**Purpose:** Collect the psychometric input that drives match quality.

**Key Components:**
- Progress bar (step X of 20), `color-primary` fill
- Question card (white/dark card, `radius-card`, single question per screen)
- 5-point slider (`color-primary` thumb, labeled 전혀 → 매우)
- Back chevron (top-left, 44px hit area)

**Primary Interaction:** Slider drag confirms answer; auto-advance after 300ms.

**Edge Case:** User exits mid-test — persist partial answers locally; resume prompt on re-entry.

---

### 3. Matching Queue (Waiting State)
**Purpose:** Keep users engaged while the algorithm finds a compatible match.

**Key Components:**
- Pulsing ring animation (3 rings, `color-primary` opacity 0.2→0.6, staggered)
- Status label: `"지금 서울에서 N명 탐색 중"` — updates every 30s
- Estimated wait chip (e.g., `"약 8분"`)
- Cancel button — bottom, ghost style, 44px height

**Primary Interaction:** Passive wait; cancel returns to Home with confirmation bottom sheet.

**Edge Case:** Wait exceeds 30 min — show "오늘은 매칭이 어려워요" state with option to set a next-day alert.

---

### 4. Match Found Card
**Purpose:** Present the matched person and trigger accept/decline decision.

**Key Components:**
- Profile photo (circular, 120px, blurred until accept — privacy-first)
- Big Five compatibility score bar (labeled `"궁합 87%"`)
- 3 shared interest tags (`color-primary` outlined chips)
- Accept button (full-width, `color-primary` fill) / Decline (ghost)
- 15-second countdown timer — auto-declines on expiry

**Primary Interaction:** Tap Accept — both-sides-accepted triggers venue suggestion screen.

**Edge Case:** Other user declines while this user is viewing — animate card away with `"다음 기회에"` micro-copy, return to queue.

---

### 5. Venue Suggestion Map
**Purpose:** Show the algorithmically selected meeting spot between both users.

**Key Components:**
- Flutter map widget (Naver Maps SDK), centered on midpoint venue
- Venue card (bottom sheet, 60% height): name, category tag, distance from each user, photo thumbnail
- `"여기서 만나요"` confirm CTA (full-width, `color-primary`)
- Suggest different venue — text link above CTA (max 2 re-rolls)

**Primary Interaction:** Confirm locks venue; both users receive push notification with venue pin.

**Edge Case:** Venue closes or is at capacity — auto-select next-best venue and notify both users before confirmation locks.

---

### 6. Countdown + BLE Arrival
**Purpose:** Guide both users to the venue and confirm physical co-presence via BLE.

**Key Components:**
- Large countdown timer (display font, center screen)
- Map thumbnail with walking route
- BLE status indicator: `"상대방 감지 중..."` → pulsing dot
- "I've arrived" manual fallback button (shown after T-minus 5 min)

**Primary Interaction:** BLE detects both phones within ~10m — triggers celebration animation.

**Edge Case:** BLE blocked by OS permissions — gracefully fall back to manual arrival tap; never hard-block the flow.

---

### 7. Rolling Paper Compose
**Purpose:** Let users write a post-meeting note that becomes a permanent keepsake.

**Key Components:**
- Paper-textured card background (subtle grain, adapts to dark mode as deep parchment)
- Handwriting-style font selector (3 options)
- Text field, max 200 chars, live char counter
- Sticker tray (bottom, horizontally scrollable, 8 stickers at launch)
- Send button — top-right, `color-primary` icon button

**Primary Interaction:** Tap Send — card flips animation (300ms), transitions to sent confirmation.

**Edge Case:** User sends, then recipient account is deleted — store paper in sender's collection as a private memory; never surface error to sender.

---

### 8. Figurine Collection Gallery
**Purpose:** Display earned figurines as a tangible retention reward loop.

**Key Components:**
- Grid layout (3 columns, `radius-card` tiles)
- Figurine tile: illustration + meeting date label + partner first name initial
- Locked tile state: greyscale silhouette with `"?"` — not yet earned
- Tap to expand: full figurine detail sheet (partner nickname, venue, rolling paper preview)
- Total count badge in AppBar

**Primary Interaction:** Tap tile — bottom sheet expands with meeting memory detail.

**Edge Case:** Empty state (0 figurines) — single large illustration with `"첫 만남을 기다리고 있어요"` and Match CTA.

---

## 3 Reusable Component Specs

### A. `WruButton` (Primary Action Button)
- Height: 52px, full-width or hug-content
- Variants: `filled` (`color-primary` bg, white label), `ghost` (transparent bg, `color-primary` border+label), `destructive` (red)
- States: default, hover (8% darken), pressed (scale 0.97), disabled (40% opacity)
- Loading state: replaces label with 20px circular spinner, same color

### B. `WruProfileChip` (Person Tag)
- 44px height, horizontal pill
- Avatar (24px circle) + name label (14sp, Pretendard Medium)
- Used on: Match Found Card, Rolling Paper, Collection detail
- Tap behavior: navigate to limited profile view

### C. `WruBottomSheet` (Action Sheet Container)
- Corner radius top: 24px
- Drag handle: 4x32px, `color-surface` +20% lightness
- Max height: 90% of screen; min: wrap content
- Dismissible: swipe down or tap scrim
- Used on: Venue Card, Collection detail, Cancel confirmation

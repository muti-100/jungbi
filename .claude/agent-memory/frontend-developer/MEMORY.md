# Frontend Developer Memory — jungbi (정비나라)

## Project: jungbi
- Web root: `projects/jungbi/src/web/src/`
- Framework: Next.js 14 App Router, Tailwind CSS, lucide-react
- All pages: `'use client'` directive required
- UI components: `@/components/ui/` (Badge, Button, Card, KpiCard, Modal, SkeletonLoader)
- Layout: `@/components/layout/` (AppShell, Sidebar, TopBar)

## Design Tokens (Tailwind classes)
- Colors: primary, success, warning, danger, info, neutral (each has -50 to -900 shades)
- Badge variants: primary | success | warning | danger | info | neutral
- Button variants: primary | secondary | ghost | danger

## Sidebar Pattern
- File: `projects/jungbi/src/web/src/components/layout/Sidebar.tsx`
- Add flat nav items to `NAV_ITEMS` array with `{ label, icon, href }`
- Group items use `{ label, icon, children: [{label, href}] }`
- Icons imported from lucide-react, typed as `LucideIcon`

## Toast Pattern
- Use a `useToast()` hook pattern: `useState<string | null>` + timer ref
- Render toast as `role="alert" aria-live="polite"` fixed bottom-right div
- Auto-dismiss after ~2800ms

## Upload Area Pattern
- Styled `div` with `role="button" tabIndex={0}` for keyboard accessibility
- Handlers: onDragOver (e.preventDefault + setIsDragging), onDragLeave, onDrop, onClick, onKeyDown (Enter/Space)
- Visual feedback: border-dashed, change border/bg color on isDragging

## Pages Built
- `/meetings` — 총회 관리 (booklet library, template downloads, file upload)
- `/settings/security-policy` — Security & Privacy Policy
- `/settings` — Settings page (profile, org, notifications, security, billing tabs)
- `/proposals` — 시공사 제안서 분석 (upload area, sticky-header comparison table, detail cards, AI summary)
- `/zone-map` — 정비구역 현황 지도 (SVG-free district bubble map, project list, KPI bar)
- `/bid-invite` — 시공사 입찰 공문 발송 (3-step wizard: select companies, edit doc, confirm send)

## Patterns That Worked
- Section-per-`<section>` with `aria-labelledby` for accessibility
- Grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` for responsive templates
- Expandable column list with `useState` + ChevronDown/Up icons
- Security notice blocks using `bg-neutral-900` dark card with bullet list
- Comparison table: sticky left `<th scope="row">` column + best-value highlight with `bg-success-50` + `CheckCircle2`
- District bubble map: `position: relative` container with `paddingBottom` aspect ratio trick, bubbles as `position: absolute` + `transform: translate(-50%,-50%)`, size from project count
- Tooltip on hover: absolute child inside bubble with `bottom: 110%`, `pointer-events-none`, CSS arrow via border trick
- `parseLeadingNumber()` helper to extract numeric value from Korean strings (removes 억원, 평, %, 개월 etc.) for best-value comparison
- 3-step wizard: manage `step` as `1 | 2 | 3` literal type with `useState`; pass data forward via `onNext(data)` callback; each step is a separate component
- Animated send simulation: recursive `sendNext()` with `setTimeout` + spreading partial results via `setResults([...res])` gives real-time progress
- Official Korean document (공문) preview: HTML `<table>` for meta fields (발신/수신/제목/문서번호), `<pre style="white-space:pre-wrap">` for body text; `fontFamily: 'Malgun Gothic'` for authentic look
- Template variable insertion at cursor: save `textarea.selectionStart/End`, splice into string, then `setTimeout(() => textarea.setSelectionRange(...), 0)` to restore focus
- Recipient cycling in preview: `useState(previewIdx)` + prev/next buttons to cycle through selected companies

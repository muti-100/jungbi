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

## Patterns That Worked
- Section-per-`<section>` with `aria-labelledby` for accessibility
- Grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` for responsive templates
- Expandable column list with `useState` + ChevronDown/Up icons
- Security notice blocks using `bg-neutral-900` dark card with bullet list

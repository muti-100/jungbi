'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScrollText,
  GitBranch,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Landmark,
  MessageCircleQuestion,
  BookOpenCheck,
  HardHat,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  icon: LucideIcon
  href?: string
  children?: SubItem[]
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { label: '대시보드', icon: LayoutDashboard, href: '/dashboard' },
  {
    label: '법령/조례',
    icon: ScrollText,
    children: [
      { label: '법령 조회', href: '/laws' },
      { label: '스마트 검색', href: '/laws/search' },
      { label: '조례 비교', href: '/laws/compare' },
      { label: '법령 알림', href: '/laws/alerts' },
    ],
  },
  {
    label: '절차/일정',
    icon: GitBranch,
    children: [
      { label: '절차 플로우차트', href: '/flow' },
      { label: '캘린더', href: '/calendar' },
      { label: '입찰 공문 발송', href: '/bid-invite' },
    ],
  },
  {
    label: '부동산 정보',
    icon: Landmark,
    children: [
      { label: '대출규제 현황', href: '/loans' },
      { label: '세금 가이드', href: '/tax' },
      { label: '정비구역 지도', href: '/zone-map' },
    ],
  },
  { label: '총회 관리', icon: BookOpenCheck, href: '/meetings' },
  { label: '시공사 분석', icon: HardHat, href: '/proposals' },
  { label: '사례/Q&A', icon: MessageCircleQuestion, href: '/qna', badge: 3, children: [
    { label: 'Q&A 게시판', href: '/qna' },
    { label: '사례 검색', href: '/cases' },
  ]},
  { label: '설정', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void
}

export function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Auto-expand group containing current path on mount
    const initial = new Set<string>()
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        initial.add(item.label)
      }
    })
    return initial
  })

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  return (
    <aside
      aria-label="메인 내비게이션"
      className={cn(
        'h-full flex flex-col',
        'bg-primary-900 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <ul role="list" className="space-y-px px-2">
          {NAV_ITEMS.map((item) => {
            const isGroup = Boolean(item.children)
            const isExpanded = expandedGroups.has(item.label)
            const isActiveParent = item.children?.some((c) => pathname.startsWith(c.href)) ?? false
            const isActiveSingle = item.href ? pathname === item.href || pathname.startsWith(item.href + '/') : false
            const isActive = isActiveSingle || isActiveParent

            if (!isGroup) {
              return (
                <li key={item.label}>
                  <Link
                    href={item.href!}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors duration-150',
                      'text-white/70 hover:text-white hover:bg-primary-800',
                      isActive && 'text-white bg-primary-800 border-l-[3px] border-primary-500 pl-[9px]'
                    )}
                  >
                    <item.icon size={16} className="shrink-0" aria-hidden />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge != null && item.badge > 0 && (
                      <span className="ml-auto bg-danger-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            }

            // Group item
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  title={collapsed ? item.label : undefined}
                  aria-expanded={!collapsed ? isExpanded : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150',
                    'text-white/70 hover:text-white hover:bg-primary-800',
                    isActiveParent && 'text-white'
                  )}
                >
                  <item.icon size={16} className="shrink-0" aria-hidden />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn('shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
                        aria-hidden
                      />
                    </>
                  )}
                </button>

                {/* Sub-items */}
                {!collapsed && isExpanded && (
                  <ul role="list" className="mt-px space-y-px ml-6">
                    {item.children!.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
                      return (
                        <li key={child.href + child.label}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors duration-150',
                              'text-white/55 hover:text-white hover:bg-primary-800',
                              childActive && 'text-white bg-primary-800 border-l-2 border-primary-500'
                            )}
                          >
                            <span className="w-1 h-1 rounded-full bg-current shrink-0" aria-hidden />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs',
            'text-white/50 hover:text-white hover:bg-primary-800 transition-colors duration-150'
          )}
        >
          {collapsed ? (
            <ChevronRight size={14} aria-hidden />
          ) : (
            <>
              <ChevronLeft size={14} aria-hidden />
              <span>접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  MapPin,
  Flag,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    label: '대시보드',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: '사용자 관리',
    href: '/admin/users',
    icon: Users,
    exact: false,
  },
  {
    label: '매치 현황',
    href: '/admin/matches',
    icon: HeartHandshake,
    exact: false,
  },
  {
    label: '장소 DB',
    href: '/admin/venues',
    icon: MapPin,
    exact: false,
  },
  {
    label: '신고 관리',
    href: '/admin/reports',
    icon: Flag,
    exact: false,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside
      className="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col"
      aria-label="관리자 사이드바 내비게이션"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/admin"
          className="text-xl font-extrabold text-gradient-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          aria-label="관리자 대시보드 홈"
        >
          와루루 관리자
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1" aria-label="관리자 메뉴">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="관리자 로그아웃"
        >
          <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
          로그아웃
        </button>
      </div>
    </aside>
  )
}

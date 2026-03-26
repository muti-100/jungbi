import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: {
    default: '관리자 대시보드',
    template: '%s | 와루루 관리자',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  // Role check — only allow users with app_metadata.role = 'admin'
  const role = (user.app_metadata as Record<string, unknown>)?.role
  if (role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            관리자 콘솔
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {user.email}
            </div>
            <div
              className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400"
              aria-hidden="true"
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          id="admin-main-content"
          className="flex-1 p-6 overflow-auto"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

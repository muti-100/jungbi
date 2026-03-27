'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  organizationName?: string
  organizationProjectType?: string
  unreadNotifications?: number
  userName?: string
  userInitials?: string
}

export function AppShell({
  children,
  organizationName,
  organizationProjectType,
  unreadNotifications = 0,
  userName,
  userInitials,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <TopBar
        organizationName={organizationName}
        organizationProjectType={organizationProjectType}
        unreadNotifications={unreadNotifications}
        userName={userName}
        userInitials={userInitials}
        onMenuToggle={() => setMobileOpen((v) => !v)}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always visible on lg+, slide-in overlay on mobile */}
      <div
        className={cn(
          'fixed top-16 left-0 bottom-0 z-40 transition-transform duration-300 ease-in-out',
          // On lg+ always show; on mobile slide in/out
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 ease-in-out',
          // On mobile, no left padding — sidebar is overlay
          'pl-0',
          // On lg+, account for sidebar width
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
        )}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </>
  )
}

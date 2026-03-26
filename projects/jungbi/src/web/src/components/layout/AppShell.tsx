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

  return (
    <>
      <TopBar
        organizationName={organizationName}
        organizationProjectType={organizationProjectType}
        unreadNotifications={unreadNotifications}
        userName={userName}
        userInitials={userInitials}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'pl-16' : 'pl-60'
        )}
      >
        <div className="p-6 max-w-8xl mx-auto">
          {children}
        </div>
      </main>
    </>
  )
}

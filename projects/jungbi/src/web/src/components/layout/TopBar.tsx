'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Bell, HelpCircle, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TopBarProps {
  organizationName?: string
  organizationProjectType?: string
  unreadNotifications?: number
  userName?: string
  userInitials?: string
}

export function TopBar({
  organizationName = '조합 미선택',
  organizationProjectType,
  unreadNotifications = 0,
  userName = '사용자',
  userInitials = 'U',
}: TopBarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [orgSelectorOpen, setOrgSelectorOpen] = useState(false)

  return (
    <header
      role="banner"
      className="fixed top-0 inset-x-0 z-40 h-16 bg-white border-b border-neutral-200 flex items-center px-4 gap-4"
    >
      {/* Logo + Service Name */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-bold text-base text-primary-900 shrink-0"
        aria-label="정비나라 홈"
      >
        <Building2 size={22} className="text-primary-600" aria-hidden />
        <span className="hidden sm:block">정비나라</span>
      </Link>

      {/* Vertical divider */}
      <div className="h-6 w-px bg-neutral-200 shrink-0" aria-hidden />

      {/* Organization selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOrgSelectorOpen(!orgSelectorOpen)}
          aria-expanded={orgSelectorOpen}
          aria-haspopup="listbox"
          aria-label="조합 선택"
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm',
            'hover:bg-neutral-100 transition-colors',
            orgSelectorOpen && 'bg-neutral-100'
          )}
        >
          <span className="font-medium text-neutral-800 max-w-[180px] truncate">
            {organizationName}
          </span>
          {organizationProjectType && (
            <span className="text-xs font-semibold text-primary-600 bg-primary-050 px-1.5 py-0.5 rounded-sm">
              {organizationProjectType}
            </span>
          )}
          <ChevronDown size={14} className="text-neutral-400 shrink-0" aria-hidden />
        </button>

        {/* Dropdown */}
        {orgSelectorOpen && (
          <div
            role="listbox"
            aria-label="조합 목록"
            className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 py-2"
          >
            <p className="px-4 py-2 text-xs text-neutral-400 uppercase tracking-wide font-medium">
              내 조합
            </p>
            <button
              role="option"
              aria-selected={true}
              onClick={() => setOrgSelectorOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-neutral-50 text-left"
            >
              <span className="font-medium text-neutral-800">{organizationName}</span>
              {organizationProjectType && (
                <span className="ml-auto text-xs font-semibold text-primary-600 bg-primary-050 px-1.5 py-0.5 rounded-sm">
                  {organizationProjectType}
                </span>
              )}
            </button>
            <div className="border-t border-neutral-200 mt-2 pt-2 px-4">
              <Link
                href="/settings/organization"
                className="text-sm text-primary-600 hover:underline"
                onClick={() => setOrgSelectorOpen(false)}
              >
                + 새 조합 등록
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Help */}
        <button
          type="button"
          aria-label="도움말"
          className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <HelpCircle size={20} />
        </button>

        {/* Notifications */}
        <Link
          href="/alerts"
          aria-label={`알림 ${unreadNotifications > 0 ? `(읽지 않은 알림 ${unreadNotifications}건)` : ''}`}
          className="relative p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span
              aria-hidden
              className="absolute top-1 right-1 w-4 h-4 bg-danger-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-label="사용자 메뉴"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <span
              aria-hidden
              className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center"
            >
              {userInitials}
            </span>
            <span className="hidden md:block text-sm font-medium text-neutral-700 max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown size={14} className="text-neutral-400" aria-hidden />
          </button>

          {userMenuOpen && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 py-1"
            >
              <Link
                href="/settings/profile"
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <User size={16} aria-hidden />
                내 프로필
              </Link>
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Settings size={16} aria-hidden />
                설정
              </Link>
              <div className="border-t border-neutral-200 my-1" aria-hidden />
              <button
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-100 text-left"
                onClick={() => setUserMenuOpen(false)}
              >
                <LogOut size={16} aria-hidden />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

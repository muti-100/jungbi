'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ScrollText,
  GitFork,
  Scale,
  CalendarDays,
  FolderSearch,
  Settings,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  User,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  {
    label: '법령 관리',
    icon: ScrollText,
    children: [
      { label: '법령 조회', href: '/laws' },
      { label: '법령 업데이트 알림', href: '/laws/updates' },
    ],
  },
  {
    label: '절차 관리',
    icon: GitFork,
    children: [
      { label: '절차 플로우차트', href: '/flow' },
      { label: '단계별 진행 현황', href: '/flow/status' },
    ],
  },
  { label: '조례 비교', href: '/laws/compare', icon: Scale },
  {
    label: '일정 관리',
    icon: CalendarDays,
    children: [
      { label: '캘린더', href: '/calendar' },
      { label: '마감기한 현황', href: '/calendar/deadlines' },
    ],
  },
  { label: '사례 검색', href: '/cases', icon: FolderSearch },
  {
    label: '설정',
    icon: Settings,
    children: [
      { label: '조합 정보', href: '/settings/union' },
      { label: '구성원 관리', href: '/settings/members' },
      { label: '알림 설정', href: '/settings/notifications' },
    ],
  },
];

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => pathname.startsWith(c.href));
  });

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + '/') : false;
  const Icon = item.icon;

  if (!item.children) {
    return (
      <Link
        href={item.href ?? '#'}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 relative group
          ${isActive
            ? 'bg-[#12335C] text-white border-l-[3px] border-[#2468B2]'
            : 'text-white/70 hover:bg-[#12335C] hover:text-white/95 border-l-[3px] border-transparent'
          }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={20} strokeWidth={1.5} className="shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {collapsed && (
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.label}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 border-l-[3px] border-transparent
          ${open ? 'text-white/95 bg-[#12335C]' : 'text-white/70 hover:bg-[#12335C] hover:text-white/95'}`}
        aria-expanded={open}
      >
        <Icon size={20} strokeWidth={1.5} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="pl-4">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-150
                  ${childActive ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
                aria-current={childActive ? 'page' : undefined}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${childActive ? 'bg-[#2468B2]' : 'bg-white/30'}`}
                />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: 'var(--color-primary-900)' }}
        aria-label="메인 내비게이션"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0">
          <Building2 size={24} className="text-white shrink-0" strokeWidth={1.5} />
          {!collapsed && (
            <div className="ml-2 overflow-hidden">
              <span className="text-white font-bold text-sm block leading-tight">정비나라</span>
              <span className="text-white/50 text-xs">도시정비 통합플랫폼</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => (
            <SidebarItem key={item.label} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 flex items-center justify-center border-t border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? <ChevronRight size={20} strokeWidth={1.5} /> : <ChevronLeft size={20} strokeWidth={1.5} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header
          className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6"
          role="banner"
        >
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-blue-700 transition-colors">
              <Building2 size={16} strokeWidth={1.5} className="text-gray-500" />
              성동구 XX구역 재개발조합
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">재개발</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="알림 (3건 미확인)"
            >
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
            </button>
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="도움말"
            >
              <HelpCircle size={20} strokeWidth={1.5} />
            </button>
            <button
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="사용자 메뉴"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User size={16} className="text-white" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-gray-700">김철수</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

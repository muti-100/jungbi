import { AppShell } from '@/components/layout/AppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      organizationName="성동구 XX구역 재개발조합"
      organizationProjectType="재개발"
      unreadNotifications={3}
      userName="김철수"
      userInitials="김"
    >
      {children}
    </AppShell>
  );
}

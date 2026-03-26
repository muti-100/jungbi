import { Suspense } from 'react'
import { Users, HeartHandshake, ScrollText, Bluetooth } from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { MatchStatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonKpiGrid, SkeletonTable } from '@/components/ui/SkeletonCard'
import { mockDashboardStats, mockRecentMatches } from '@/lib/mock-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대시보드',
}

// Simulate async data fetch
async function getDashboardData() {
  await new Promise((r) => setTimeout(r, 0))
  return { stats: mockDashboardStats, recentMatches: mockRecentMatches }
}

async function DashboardContent() {
  const { stats, recentMatches } = await getDashboardData()

  return (
    <>
      {/* KPI Grid */}
      <section aria-labelledby="kpi-heading" className="mb-8">
        <h2 id="kpi-heading" className="sr-only">
          주요 지표
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="일간 활성 사용자 (DAU)"
            value={stats.dau}
            delta={stats.dauDelta}
            icon={Users}
            iconBg="bg-primary-50 dark:bg-primary-900/20"
            iconColor="text-primary-500"
          />
          <KpiCard
            title="이번 주 매칭 성사"
            value={stats.weeklyMatches}
            delta={stats.weeklyMatchesDelta}
            icon={HeartHandshake}
            iconBg="bg-secondary-50 dark:bg-secondary-900/20"
            iconColor="text-secondary-500"
          />
          <KpiCard
            title="롤링페이퍼 완성률"
            value={stats.rollingPaperRate}
            delta={stats.rollingPaperRateDelta}
            icon={ScrollText}
            iconBg="bg-green-50 dark:bg-green-900/20"
            iconColor="text-green-500"
            suffix="%"
          />
          <KpiCard
            title="BLE 도착 확인률"
            value={stats.bleArrivalRate}
            delta={stats.bleArrivalRateDelta}
            icon={Bluetooth}
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-500"
            suffix="%"
          />
        </div>
      </section>

      {/* Recent matches table */}
      <section aria-labelledby="recent-matches-heading">
        <div className="card-base overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2
              id="recent-matches-heading"
              className="text-base font-bold text-gray-900 dark:text-white"
            >
              최근 매치 현황
            </h2>
            <a
              href="/admin/matches"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              전체 보기
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="최근 매치 목록">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <th
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    매치 ID
                  </th>
                  <th
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    지역
                  </th>
                  <th
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    참가자
                  </th>
                  <th
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    상태
                  </th>
                  <th
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    생성일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentMatches.map((match) => (
                  <tr
                    key={match.matchId}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {match.matchId}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {match.district}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {match.participantCount}명
                    </td>
                    <td className="px-6 py-4">
                      <MatchStatusBadge status={match.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(match.createdAt).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          와루루 서비스 현황을 한눈에 확인하세요
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-8">
            <SkeletonKpiGrid />
            <div className="card-base p-6">
              <SkeletonTable rows={5} />
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  )
}

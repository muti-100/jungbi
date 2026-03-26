'use client'

import { useState } from 'react'
import { Search, CheckCircle, Ban, ChevronDown } from 'lucide-react'
import { ReportStatusBadge } from '@/components/ui/StatusBadge'
import { WruButton } from '@/components/ui/WruButton'
import { mockReports } from '@/lib/mock-data'
import type { Report, ReportStatus } from '@/types'

type FilterStatus = 'all' | ReportStatus

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.reporterNickname.includes(search) ||
      r.targetNickname.includes(search) ||
      r.reason.includes(search)
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = reports.filter((r) => r.status === 'pending').length

  async function handleResolve(id: string) {
    setProcessingId(id)
    try {
      // Mock: in production, PATCH /api/admin/reports/:id
      await new Promise((r) => setTimeout(r, 600))
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'resolved' as ReportStatus } : r))
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm('해당 사용자를 계정 정지하시겠습니까? 이 작업은 즉시 적용됩니다.')) return
    setProcessingId(id)
    try {
      // Mock: in production, POST /api/admin/users/suspend
      await new Promise((r) => setTimeout(r, 800))
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'suspended' as ReportStatus } : r))
      )
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              신고 관리
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              사용자 신고 내역을 검토하고 처리합니다
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              처리 대기 {pendingCount}건
            </span>
          )}
        </div>
      </div>

      <div className="card-base overflow-hidden">
        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="닉네임, 사유 검색"
              className="w-full pl-9 pr-4 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="신고 검색"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="appearance-none pl-3 pr-8 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
              aria-label="신고 상태 필터"
            >
              <option value="all">전체 상태</option>
              <option value="pending">처리 대기</option>
              <option value="resolved">처리 완료</option>
              <option value="suspended">계정 정지</option>
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="신고 목록">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {['신고자', '피신고자', '사유', '시간', '처리 상태', '조치'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 dark:text-gray-600"
                  >
                    신고 내역이 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((report) => {
                  const isProcessing = processingId === report.id
                  const isDone =
                    report.status === 'resolved' || report.status === 'suspended'
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {report.reporterNickname}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {report.targetNickname}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {report.reason}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-xs truncate">
                          {report.detail}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <ReportStatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4">
                        {isDone ? (
                          <span className="text-xs text-gray-400 dark:text-gray-600">
                            처리됨
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <WruButton
                              size="sm"
                              variant="ghost"
                              loading={isProcessing}
                              onClick={() => handleResolve(report.id)}
                              leftIcon={
                                !isProcessing ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : undefined
                              }
                              aria-label={`${report.reporterNickname}의 신고 처리 완료`}
                            >
                              처리완료
                            </WruButton>
                            <WruButton
                              size="sm"
                              variant="danger"
                              loading={isProcessing}
                              onClick={() => handleSuspend(report.id)}
                              leftIcon={
                                !isProcessing ? (
                                  <Ban className="w-3.5 h-3.5" />
                                ) : undefined
                              }
                              aria-label={`${report.targetNickname} 계정 정지`}
                            >
                              계정정지
                            </WruButton>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          {filtered.length}건 표시 중 (전체 {reports.length}건)
        </div>
      </div>
    </div>
  )
}

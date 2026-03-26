import type { MatchStatus, ReportStatus } from '@/types'

const matchStatusConfig: Record<
  MatchStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '대기중',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  confirmed: {
    label: '확정됨',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  arrived: {
    label: '도착확인',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  completed: {
    label: '완료',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: {
    label: '취소',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
}

const reportStatusConfig: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  pending: {
    label: '처리 대기',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  resolved: {
    label: '처리 완료',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  suspended: {
    label: '계정 정지',
    className: 'bg-gray-900 text-gray-100 dark:bg-gray-100 dark:text-gray-900',
  },
}

interface MatchStatusBadgeProps {
  status: MatchStatus
}

interface ReportStatusBadgeProps {
  status: ReportStatus
}

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  const config = matchStatusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const config = reportStatusConfig[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

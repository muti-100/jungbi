import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  suffix?: string
}

export function KpiCard({
  title,
  value,
  delta,
  deltaLabel = '지난 주 대비',
  icon: Icon,
  iconBg,
  iconColor,
  suffix = '',
}: KpiCardProps) {
  const isPositive = delta !== undefined && delta > 0
  const isNegative = delta !== undefined && delta < 0
  const isNeutral = delta === undefined || delta === 0

  return (
    <article className="card-base p-6" aria-label={`${title} KPI 카드`}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}
          aria-hidden="true"
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {delta !== undefined && (
          <span
            className={[
              'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg',
              isPositive
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : isNegative
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            ].join(' ')}
            aria-label={`${Math.abs(delta)}% ${isPositive ? '증가' : isNegative ? '감소' : '변동없음'}`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            ) : (
              <Minus className="w-3 h-3" aria-hidden="true" />
            )}
            {isNeutral ? '0%' : `${isPositive ? '+' : ''}${delta}%`}
          </span>
        )}
      </div>

      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString('ko-KR') : value}
        {suffix && (
          <span className="text-base font-medium text-gray-500 ml-1">{suffix}</span>
        )}
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</div>
      {delta !== undefined && (
        <div className="mt-1 text-xs text-gray-400 dark:text-gray-600">{deltaLabel}</div>
      )}
    </article>
  )
}

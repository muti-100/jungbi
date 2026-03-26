import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  description: string
  urgent?: boolean
  positive?: boolean
  className?: string
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  description,
  urgent = false,
  positive = false,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-neutral-200 p-5 flex flex-col gap-3',
        'min-h-[120px]',
        className
      )}
    >
      {/* Label row */}
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-neutral-400 shrink-0" aria-hidden />
        <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Value */}
      <p
        className={cn(
          'text-3xl font-bold leading-none',
          urgent && 'text-danger-600',
          positive && 'text-success-600',
          !urgent && !positive && 'text-neutral-800'
        )}
      >
        {value}
      </p>

      {/* Description */}
      <p className="text-xs text-neutral-400 leading-tight">{description}</p>
    </div>
  )
}

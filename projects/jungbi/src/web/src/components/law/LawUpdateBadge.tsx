import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LawUpdateBadgeProps {
  label?: string
  className?: string
}

export function LawUpdateBadge({ label = '개정', className }: LawUpdateBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-xs font-semibold',
        'bg-warning-100 text-warning-600',
        className
      )}
      aria-label={`${label} - 법령이 최근 변경되었습니다`}
    >
      <AlertTriangle size={10} aria-hidden />
      {label}
    </span>
  )
}

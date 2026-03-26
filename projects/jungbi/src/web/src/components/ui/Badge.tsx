import { cn } from '@/lib/utils'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger:  'bg-danger-100 text-danger-600',
  info:    'bg-info-100 text-info-600',
  neutral: 'bg-neutral-100 text-neutral-600',
  primary: 'bg-primary-100 text-primary-600',
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

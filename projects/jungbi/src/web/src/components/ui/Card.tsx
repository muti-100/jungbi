import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardSectionProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-neutral-200',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-neutral-200', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg', className)}>
      {children}
    </div>
  )
}

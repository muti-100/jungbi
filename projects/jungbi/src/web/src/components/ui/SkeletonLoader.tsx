import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded-md', className)}
      aria-hidden="true"
      {...rest}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-4" aria-label="로딩 중">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-48" />
    </div>
  )
}

export function SkeletonKpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="로딩 중">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="로딩 중">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-neutral-200">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-sm" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0" aria-label="로딩 중">
      {/* Header */}
      <div className="flex gap-4 py-3 border-b border-neutral-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-neutral-200">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

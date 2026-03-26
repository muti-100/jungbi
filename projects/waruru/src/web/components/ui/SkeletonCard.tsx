import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`}
      role="status"
      aria-label="로딩 중"
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card-base p-6 space-y-4" role="status" aria-label="로딩 중">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
      <span className="sr-only">콘텐츠를 불러오는 중입니다</span>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="테이블 로딩 중">
      <div className="flex gap-4 px-4">
        {[40, 20, 20, 20].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900">
          {[40, 20, 20, 20].map((w, j) => (
            <Skeleton key={j} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
      <span className="sr-only">테이블 데이터를 불러오는 중입니다</span>
    </div>
  )
}

export function SkeletonKpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="status">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-base p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
      <span className="sr-only">KPI 데이터를 불러오는 중입니다</span>
    </div>
  )
}

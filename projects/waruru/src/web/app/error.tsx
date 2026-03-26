'use client'

import { useEffect } from 'react'
import { WruButton } from '@/components/ui/WruButton'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In production, log to error tracking service (e.g., Sentry)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
          문제가 발생했습니다
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시
          시도해주세요.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 dark:text-gray-600 mb-6 font-mono">
            오류 코드: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <WruButton variant="primary" onClick={reset}>
            다시 시도
          </WruButton>
          <WruButton variant="ghost" onClick={() => (window.location.href = '/')}>
            홈으로
          </WruButton>
        </div>
      </div>
    </div>
  )
}

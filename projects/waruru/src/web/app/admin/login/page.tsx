'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WruButton } from '@/components/ui/WruButton'
import { Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold text-gradient-primary mb-2">
            와루루
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            관리자 로그인
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        <div className="card-base p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  이메일
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@waruru.co.kr"
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus:border-primary-500 transition"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus:border-primary-500 transition"
                    aria-required="true"
                  />
                </div>
              </div>

              <WruButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
              >
                로그인
              </WruButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

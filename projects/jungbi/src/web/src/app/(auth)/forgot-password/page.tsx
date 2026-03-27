'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    // Simulate sending
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Building2 size={28} className="text-primary-600" aria-hidden />
          <span className="text-xl font-bold text-primary-900">정비나라</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-neutral-950 mb-1">비밀번호 재설정</h1>
                <p className="text-sm text-neutral-500">
                  가입 시 사용한 이메일 주소를 입력하시면
                  재설정 링크를 발송해 드립니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    이메일 주소
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                      aria-hidden
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '발송 중...' : '비밀번호 재설정 링크 발송'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-success-500" strokeWidth={1.5} />
              <h2 className="text-lg font-bold text-neutral-900 mb-2">이메일을 확인해 주세요</h2>
              <p className="text-sm text-neutral-500">
                <span className="font-medium text-neutral-800">{email}</span>으로
                비밀번호 재설정 링크를 발송했습니다.
                받은 편지함 또는 스팸 메일함을 확인해 주세요.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={14} />
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

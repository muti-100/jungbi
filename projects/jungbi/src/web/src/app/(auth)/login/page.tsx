import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: '로그인',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary-900">
            <Building2 size={26} className="text-primary-600" />
            정비나라
          </Link>
          <p className="mt-2 text-sm text-neutral-600">도시정비사업 통합 관리 플랫폼</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-8">
          <h1 className="text-xl font-bold text-neutral-800 mb-6">로그인</h1>

          <form className="space-y-5" action="#" method="POST" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                이메일 <span aria-hidden className="text-danger-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="example@company.com"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  비밀번호 <span aria-hidden className="text-danger-600">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="비밀번호 입력"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors text-sm"
            >
              로그인
            </button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-neutral-200" aria-hidden />
              <span className="px-3 text-xs text-neutral-400">또는</span>
              <div className="flex-1 border-t border-neutral-200" aria-hidden />
            </div>

            {/* Kakao login */}
            <button
              type="button"
              className="w-full py-3 bg-[#FEE500] text-[#191919] font-semibold rounded-md hover:bg-yellow-300 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <span aria-hidden className="font-bold">K</span>
              카카오로 시작하기
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-6 text-sm text-neutral-600">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
            무료 회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

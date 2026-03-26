import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: '회원가입',
}

export default function SignupPage() {
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
          <h1 className="text-xl font-bold text-neutral-800 mb-1">무료 회원가입</h1>
          <p className="text-sm text-neutral-500 mb-6">무료로 시작하고 언제든지 업그레이드하세요</p>

          <form className="space-y-4" action="#" method="POST" noValidate>
            {/* Organization Name */}
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                조합/단체명 <span aria-hidden className="text-danger-600">*</span>
              </label>
              <input
                id="org-name"
                name="org_name"
                type="text"
                autoComplete="organization"
                required
                placeholder="예: 성동구 XX구역 재개발조합"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            {/* Project Type */}
            <div>
              <label htmlFor="project-type" className="block text-sm font-medium text-neutral-700 mb-1.5">
                사업 유형 <span aria-hidden className="text-danger-600">*</span>
              </label>
              <select
                id="project-type"
                name="project_type"
                required
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 bg-white"
              >
                <option value="">선택하세요</option>
                <option value="redevelopment">재개발</option>
                <option value="reconstruction">재건축</option>
                <option value="small_scale">소규모정비</option>
                <option value="moa">모아주택</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                담당자 이름 <span aria-hidden className="text-danger-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="홍길동"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                비밀번호 <span aria-hidden className="text-danger-600">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="8자 이상 입력"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
              <p className="mt-1 text-xs text-neutral-400">영문, 숫자 포함 8자 이상</p>
            </div>

            {/* Password Confirm */}
            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                비밀번호 확인 <span aria-hidden className="text-danger-600">*</span>
              </label>
              <input
                id="password-confirm"
                name="password_confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="비밀번호 재입력"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600"
              />
              <label htmlFor="terms" className="text-xs text-neutral-600 leading-relaxed">
                <Link href="/terms" className="text-primary-600 hover:underline">이용약관</Link> 및{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">개인정보 처리방침</Link>에
                동의합니다 <span aria-hidden className="text-danger-600">*</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors text-sm mt-2"
            >
              무료로 시작하기
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-neutral-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

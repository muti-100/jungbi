import Link from 'next/link'
import { Building2, ScrollText, GitBranch, CalendarClock, ArrowRight, Shield, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white/90 backdrop-blur border-b border-neutral-200 flex items-center px-6">
        <div className="flex items-center gap-2 font-bold text-lg text-primary-900">
          <Building2 size={22} className="text-primary-600" />
          정비나라
        </div>
        <nav className="ml-10 hidden md:flex items-center gap-6 text-sm text-neutral-600">
          <a href="#features" className="hover:text-primary-600 transition-colors">기능 소개</a>
          <a href="#pricing" className="hover:text-primary-600 transition-colors">요금제</a>
          <a href="#contact" className="hover:text-primary-600 transition-colors">문의</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-6">
          <Zap size={12} />
          도시정비사업 전용 SaaS 플랫폼
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight mb-6">
          수백 개의 법령·조례,<br />
          <span className="text-primary-600">하나의 플랫폼</span>으로
        </h1>
        <p className="text-lg text-neutral-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          재개발·재건축·소규모정비·모아주택의 법령 조회, 절차 플로우차트,
          법정 기한 캘린더까지. 엑셀과 카카오톡으로 분산된 조합 업무를 통합 관리하세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
          >
            무료로 시작하기 <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-neutral-200 text-neutral-700 px-6 py-3 rounded-md font-semibold hover:bg-neutral-50 transition-colors"
          >
            대시보드 미리보기
          </Link>
        </div>
        <p className="mt-4 text-sm text-neutral-400">
          신용카드 불필요 · Free 플랜 무기한 제공
        </p>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-neutral-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-950 text-center mb-4">
            정비사업 실무자를 위한 핵심 기능
          </h2>
          <p className="text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            법령 검색에서 절차 관리, 일정 추적까지 — 반복 업무를 자동화합니다.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-md bg-primary-50 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-950 text-center mb-4">
            합리적인 요금제
          </h2>
          <p className="text-neutral-600 text-center mb-12">
            법무법인 법령 검토 의뢰 건당 50만원 vs. Pro 플랜 월 59,000원
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 border ${
                  plan.highlighted
                    ? 'border-primary-600 bg-primary-900 text-white ring-2 ring-primary-600'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <div className="mb-6">
                  <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-primary-100' : 'text-primary-600'}`}>
                    {plan.name}
                  </p>
                  <p className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-neutral-950'}`}>
                    {plan.price}
                  </p>
                  {plan.period && (
                    <p className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-neutral-600'}`}>
                      {plan.period}
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2 text-sm ${plan.highlighted ? 'text-primary-100' : 'text-neutral-600'}`}>
                      <Shield size={14} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-primary-300' : 'text-primary-600'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-2.5 rounded-md font-semibold text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-primary-900 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-primary-900">
            <Building2 size={18} className="text-primary-600" />
            정비나라
          </div>
          <p className="text-sm text-neutral-400">
            © 2026 정비나라. 본 서비스의 법령 정보는 참고용이며 법적 효력이 없습니다.
          </p>
          <div className="flex gap-4 text-sm text-neutral-500">
            <a href="#" className="hover:text-primary-600">이용약관</a>
            <a href="#" className="hover:text-primary-600">개인정보처리방침</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    icon: ScrollText,
    title: '법령/조례 통합 정리',
    description: '도시정비법·빈집특별법·각 시도 조례를 사업 유형별로 정리하고 개정 이력까지 추적합니다.',
  },
  {
    icon: GitBranch,
    title: '절차 플로우차트',
    description: '재개발·재건축·소규모·모아주택 4개 유형의 전체 절차를 시각적으로 파악하세요.',
  },
  {
    icon: CalendarClock,
    title: '법정 기한 캘린더',
    description: '조합 설립일 기준으로 모든 법정 기한을 자동 계산하고 D-30, D-7, D-1 알림을 발송합니다.',
  },
  {
    icon: Users,
    title: '조합별 진행 관리',
    description: '단계별 체크리스트, 서류 첨부, 멤버 권한 관리까지. 엑셀을 완전히 대체합니다.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '무료',
    period: '영구 무료',
    highlighted: false,
    cta: '무료로 시작',
    features: [
      '절차 플로우차트 조회',
      '법령/조례 통합 정리 뷰',
      '월 1회 법령 변경 알림',
      '조합 1개 (읽기 전용)',
    ],
  },
  {
    name: 'Pro',
    price: '월 59,000원',
    period: '연 결제 시 20% 할인',
    highlighted: true,
    cta: 'Pro 시작하기',
    features: [
      'Free 플랜 전체 포함',
      '절차 진행 관리 + 체크리스트',
      '일정 관리 (법정 기한 자동 계산)',
      '서류 첨부 10GB',
      '멤버 초대 10명',
      '실시간 법령 변경 알림',
      '시도별 조례 비교 17개 시도',
    ],
  },
  {
    name: 'Enterprise',
    price: '월 299,000원',
    period: '연 결제 시 15% 할인',
    highlighted: false,
    cta: '문의하기',
    features: [
      'Pro 플랜 전체 포함',
      '다중 조합 통합 대시보드',
      '유사 사례 검색',
      '서류 첨부 100GB',
      '멤버 무제한',
      'CSV 데이터 내보내기',
      'API 접근',
      '전담 CS 담당자',
    ],
  },
]

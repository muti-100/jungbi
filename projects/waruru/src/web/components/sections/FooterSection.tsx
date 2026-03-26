import Link from 'next/link'

const footerLinks = {
  서비스: [
    { label: '서비스 소개', href: '/#features' },
    { label: '이용 방법', href: '/#how-it-works' },
    { label: '안전 센터', href: '/#safety' },
    { label: '앱 다운로드', href: '/#download' },
  ],
  법적고지: [
    { label: '이용약관', href: '/terms' },
    { label: '개인정보처리방침', href: '/privacy' },
    { label: '운영 정책', href: '/policy' },
    { label: '청소년 보호 정책', href: '/youth-protection' },
  ],
  지원: [
    { label: '고객센터', href: '/support' },
    { label: '신고 센터', href: '/report' },
    { label: '사업 제휴', href: '/partnership' },
    { label: '채용', href: '/careers' },
  ],
}

export function FooterSection() {
  return (
    <footer
      className="bg-gray-950 text-gray-400"
      role="contentinfo"
      aria-label="사이트 하단 정보"
    >
      <div className="container-section py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-block text-2xl font-extrabold text-white mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              aria-label="와루루 홈으로 이동"
            >
              와루루
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              지금 이 순간, 당신 근처의 누군가와.
              <br />
              Big Five 성격 기반 오프라인 소셜 매칭 플랫폼.
            </p>

            <div className="mt-6 flex gap-3">
              <SocialLink href="#" label="인스타그램">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="트위터">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} 링크`}>
              <h3 className="text-white font-semibold text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-600">
          <div>
            <p className="font-medium text-gray-500">주식회사 와루루</p>
            <p className="mt-1">
              대표: 김와루 | 사업자등록번호: 000-00-00000 | 통신판매업신고: 제2026-서울마포-0000호
            </p>
            <p>서울특별시 마포구 연남동 | 고객센터: 02-000-0000 | help@waruru.co.kr</p>
          </div>
          <p className="shrink-0">
            &copy; {new Date().getFullYear()} 주식회사 와루루. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {children}
    </a>
  )
}

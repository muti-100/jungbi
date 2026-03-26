import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '정비나라 — 도시정비사업 통합 플랫폼',
    template: '%s | 정비나라',
  },
  description:
    '재개발·재건축·소규모정비 법령 조회, 절차 관리, 일정 캘린더를 한 곳에서. 조합·전문관리업체·법무법인을 위한 SaaS.',
  keywords: ['도시정비', '재개발', '재건축', '소규모정비', '모아주택', '법령', '조례', '조합'],
  openGraph: {
    title: '정비나라',
    description: '도시정비사업 통합 관리 플랫폼',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
        >
          본문으로 이동
        </a>
        {children}
      </body>
    </html>
  )
}

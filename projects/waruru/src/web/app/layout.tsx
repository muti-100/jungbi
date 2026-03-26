import type { Metadata, Viewport } from 'next'
import '@fontsource/pretendard/400.css'
import '@fontsource/pretendard/500.css'
import '@fontsource/pretendard/600.css'
import '@fontsource/pretendard/700.css'
import '@fontsource/pretendard/800.css'
import './globals.css'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://waruru.co.kr'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: '와루루 — 지금 이 순간, 당신 근처의 누군가와',
    template: '%s | 와루루',
  },
  description:
    'Big Five 성격 기반 오프라인 소셜 매칭 플랫폼. 앱이 장소까지 잡아드립니다. 서울 직장인 23,400명의 선택.',
  keywords: [
    '소셜 매칭',
    '오프라인 만남',
    '직장인 모임',
    '서울 소셜',
    '와루루',
    '미팅 앱',
    'Big Five',
    '성격 매칭',
  ],
  authors: [{ name: '주식회사 와루루', url: APP_URL }],
  creator: '주식회사 와루루',
  publisher: '주식회사 와루루',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: APP_URL,
    siteName: '와루루',
    title: '와루루 — 지금 이 순간, 당신 근처의 누군가와',
    description:
      'Big Five 성격 기반 오프라인 소셜 매칭 플랫폼. 앱이 장소까지 잡아드립니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '와루루 — 오프라인 소셜 매칭',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '와루루 — 지금 이 순간, 당신 근처의 누군가와',
    description: 'Big Five 성격 기반 오프라인 소셜 매칭 플랫폼.',
    images: ['/og-image.png'],
    creator: '@waruru_app',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 font-pretendard antialiased">
        {children}
      </body>
    </html>
  )
}

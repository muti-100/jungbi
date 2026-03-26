import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { SafetySection } from '@/components/sections/SafetySection'
import { DownloadCtaSection } from '@/components/sections/DownloadCtaSection'
import { FooterSection } from '@/components/sections/FooterSection'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      {/* Skip navigation for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-500 text-white px-4 py-2 rounded-xl font-medium"
      >
        본문으로 바로가기
      </a>

      {/* Top navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="container-section">
          <nav
            className="flex items-center justify-between h-16"
            aria-label="주요 내비게이션"
          >
            <Link
              href="/"
              className="text-xl font-extrabold text-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              aria-label="와루루 홈"
            >
              <span className="text-gradient-primary">와루루</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Link href="/#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                이용 방법
              </Link>
              <Link href="/#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                기능
              </Link>
              <Link href="/#safety" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                안전
              </Link>
            </div>

            <Link
              href="/#download"
              className="inline-flex items-center h-9 px-5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="앱 다운로드 섹션으로 이동"
            >
              다운로드
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SocialProofSection />
        <SafetySection />
        <DownloadCtaSection />
      </main>

      <FooterSection />
    </>
  )
}

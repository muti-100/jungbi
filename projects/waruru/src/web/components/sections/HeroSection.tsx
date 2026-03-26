'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { WruButton } from '@/components/ui/WruButton'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-hero-mesh"
      aria-label="히어로 섹션"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary-500/5 blur-3xl" />
      </div>

      <div className="container-section relative z-10 text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-slow" aria-hidden="true" />
          <span>서울 직장인 23,400명의 선택</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.08]"
        >
          오늘 저녁,{' '}
          <br className="hidden sm:block" />
          <span className="text-gradient-primary">앱이 장소까지</span>
          <br />
          잡아드립니다
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Big Five 성격 기반 매칭 · OSRM 최적 장소 자동 추천 ·{' '}
          <br className="hidden sm:block" />
          BLE 도착 확인까지 — 처음 만남의 어색함을 없앴습니다
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <WruButton
            size="xl"
            variant="primary"
            className="shadow-glow"
            aria-label="앱 다운로드"
          >
            지금 다운로드
          </WruButton>
          <WruButton
            size="xl"
            variant="ghost"
            aria-label="서비스 소개 더 보기"
          >
            서비스 소개 보기
          </WruButton>
        </motion.div>

        {/* App Store badges (placeholder) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <AppStoreBadge platform="ios" />
          <AppStoreBadge platform="android" />
        </motion.div>

        {/* Social proof number */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400 dark:text-gray-500"
        >
          {[
            { value: '23,400+', label: '누적 사용자' },
            { value: '4.8★', label: '앱스토어 평점' },
            { value: '88%', label: 'BLE 도착 확인률' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-gray-400 dark:text-gray-600"
        >
          <ArrowDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  )
}

function AppStoreBadge({ platform }: { platform: 'ios' | 'android' }) {
  const isIos = platform === 'ios'
  return (
    <a
      href="#"
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label={isIos ? 'App Store에서 다운로드' : 'Google Play에서 다운로드'}
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {isIos ? (
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        ) : (
          <path d="M3.18 23.76c.2.11.43.14.67.08l11.46-6.61-2.5-2.5-9.63 9.03zm15.16-9.22 2.56-1.47c.44-.25.44-.66 0-.91l-2.59-1.5-2.72 2.72 2.75 1.16zM2.61.26a.98.98 0 0 0-.43.83v21.82c0 .35.13.64.4.83l.12.09 12.22-12.22v-.29L2.61.26zm10.55 13.05-2.72-2.72 9.63-5.55c.44-.25.87-.18 1.06.16l-7.97 8.11z" />
        )}
      </svg>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xs opacity-70">{isIos ? 'App Store' : 'Google Play'}</span>
        <span className="font-semibold">{isIos ? '다운로드' : '다운로드'}</span>
      </div>
    </a>
  )
}

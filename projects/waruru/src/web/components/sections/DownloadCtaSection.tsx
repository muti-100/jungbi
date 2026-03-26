'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function DownloadCtaSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="download"
      className="section-padding"
      aria-labelledby="download-heading"
    >
      <div className="container-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-500 to-primary-600 px-8 py-16 sm:px-16 sm:py-20 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          </div>

          <div className="relative z-10">
            <p className="text-primary-200 font-semibold text-sm uppercase tracking-widest mb-4">
              지금 바로 시작하세요
            </p>
            <h2
              id="download-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4"
            >
              오늘 저녁 약속,
              <br />
              와루루가 만들어드립니다
            </h2>
            <p className="text-primary-100 text-lg mb-10 max-w-lg mx-auto">
              지금 다운로드하고 첫 매칭을 경험해보세요.
              <br />
              무료로 시작할 수 있습니다.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              role="group"
              aria-label="앱 다운로드 링크"
            >
              <StoreButton platform="ios" />
              <StoreButton platform="android" />
            </div>

            <p className="mt-8 text-primary-200 text-sm">
              iOS 16+ · Android 10+ 지원
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StoreButton({ platform }: { platform: 'ios' | 'android' }) {
  const isIos = platform === 'ios'
  return (
    <a
      href="#"
      className="inline-flex items-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 min-w-[180px]"
      aria-label={isIos ? 'App Store에서 와루루 다운로드' : 'Google Play에서 와루루 다운로드'}
    >
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {isIos ? (
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        ) : (
          <path d="M3.18 23.76c.2.11.43.14.67.08l11.46-6.61-2.5-2.5-9.63 9.03zm15.16-9.22 2.56-1.47c.44-.25.44-.66 0-.91l-2.59-1.5-2.72 2.72 2.75 1.16zM2.61.26a.98.98 0 0 0-.43.83v21.82c0 .35.13.64.4.83l.12.09 12.22-12.22v-.29L2.61.26zm10.55 13.05-2.72-2.72 9.63-5.55c.44-.25.87-.18 1.06.16l-7.97 8.11z" />
        )}
      </svg>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xs text-gray-500">
          {isIos ? 'Download on the' : 'Get it on'}
        </span>
        <span className="text-base font-bold">
          {isIos ? 'App Store' : 'Google Play'}
        </span>
      </div>
    </a>
  )
}

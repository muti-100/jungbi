'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Flag, Trash2 } from 'lucide-react'

const safetyItems = [
  {
    icon: ShieldCheck,
    title: 'KYC 신원 배지',
    description:
      '신분증 인증을 완료한 사용자에게 KYC 배지를 부여합니다. 실명 검증으로 허위 프로필을 원천 차단해요.',
    detail: '본인인증 완료 시 파란 배지 표시',
    iconBg: 'bg-secondary-50 dark:bg-secondary-900/20',
    iconColor: 'text-secondary-500',
  },
  {
    icon: Flag,
    title: '즉시 신고 시스템',
    description:
      '불쾌한 상황 발생 시 3초 내 신고가 가능합니다. 신고 접수 1시간 내 담당자 검토가 시작됩니다.',
    detail: '24/7 신고 접수 · 1시간 내 검토 시작',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
  },
  {
    icon: Trash2,
    title: '즉시 삭제 보장',
    description:
      '계정 삭제 요청 시 72시간 내 모든 개인정보를 완전 삭제합니다. PIPA 및 GDPR 기준을 모두 충족해요.',
    detail: '72시간 내 완전 삭제 · PIPA 준수',
    iconBg: 'bg-gray-50 dark:bg-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
]

export function SafetySection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="safety"
      className="section-padding"
      aria-labelledby="safety-heading"
    >
      <div className="container-section">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65 }}
          >
            <p className="text-primary-500 font-semibold text-sm uppercase tracking-widest mb-3">
              Safety First
            </p>
            <h2
              id="safety-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
            >
              안전한 만남을
              <br />
              보장합니다
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              오프라인 만남의 가장 큰 우려, 안전 문제를 해결했습니다. KYC 신원
              인증부터 즉시 신고 시스템까지, 와루루는 모든 만남이 안심할 수 있도록
              설계되었습니다.
            </p>

            <div
              className="flex items-center gap-3 p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800"
              role="note"
              aria-label="개인정보 보호 기준"
            >
              <ShieldCheck
                className="w-6 h-6 text-secondary-500 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm text-secondary-700 dark:text-secondary-300 font-medium">
                개인정보보호법(PIPA) 완전 준수 · 데이터 한국 내 저장
              </p>
            </div>
          </motion.div>

          {/* Right: safety cards */}
          <motion.ul
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="mt-12 lg:mt-0 space-y-4"
            aria-label="안전 기능 목록"
          >
            {safetyItems.map(({ icon: Icon, title, description, detail, iconBg, iconColor }) => (
              <li key={title} className="card-base p-6 hover:shadow-card-hover transition-shadow">
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                      {description}
                    </p>
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      {detail}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}

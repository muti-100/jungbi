'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Users, MapPin, Bluetooth, ScrollText } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Users,
    title: 'Big Five 매칭',
    description:
      '5가지 성격 유형 기반으로 나와 잘 맞는 사람을 찾습니다. 단순 취미가 아닌 심층 궁합을 분석해요.',
    color: 'text-primary-500',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
  },
  {
    step: '02',
    icon: MapPin,
    title: '장소 자동 제안',
    description:
      'OSRM 알고리즘이 두 사람의 중간 지점에서 최적의 장소를 자동으로 추천합니다.',
    color: 'text-secondary-500',
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
  },
  {
    step: '03',
    icon: Bluetooth,
    title: 'BLE 도착 확인',
    description:
      'BLE 비콘으로 실제 도착을 확인합니다. 장소 입장 시 자동으로 매칭이 활성화돼요.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    step: '04',
    icon: ScrollText,
    title: '롤링페이퍼',
    description:
      '만남 후 서로에게 익명으로 메시지를 남깁니다. 다음 만남의 설렘을 이어가세요.',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="section-padding bg-gray-50 dark:bg-gray-950/50"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-section">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white"
          >
            만남의 모든 과정을
            <br />
            앱이 함께합니다
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            매칭부터 만남, 그 이후까지 — 4단계로 완성되는 오프라인 소셜 경험
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.ol
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          aria-label="서비스 이용 단계"
        >
          {steps.map(({ step, icon: Icon, title, description, color, bg }) => (
            <motion.li
              key={step}
              variants={itemVariants}
              className="card-base p-6 hover:shadow-card-hover transition-shadow duration-300 group"
            >
              {/* Step number */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className="text-3xl font-black text-gray-100 dark:text-gray-800 group-hover:text-gray-200 dark:group-hover:text-gray-700 transition-colors select-none">
                  {step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}

'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Brain, Route, Pencil } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Big Five 성격 매칭',
    badge: 'AI 기반',
    badgeColor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    description:
      '심리학 기반 5대 성격 요인(개방성, 성실성, 외향성, 친화성, 신경증)을 분석해 진짜 잘 맞는 사람을 연결합니다.',
    points: [
      'PIPA 완전 준수 — 성격 데이터 암호화 저장',
      'GrowthBook A/B 테스트로 지속 개선',
      '50쌍 오프라인 검증 완료',
    ],
    accentColor: 'from-primary-500/10 to-primary-500/5',
    iconBg: 'bg-primary-50 dark:bg-primary-900/20',
    iconColor: 'text-primary-500',
  },
  {
    icon: Route,
    title: 'OSRM 장소 추천',
    badge: '실시간',
    badgeColor: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
    description:
      '두 사람의 현재 위치를 기반으로 OSRM이 실도로 거리를 계산, 이동 시간이 가장 균등한 최적 장소를 자동 추천합니다.',
    points: [
      '서울 5개 구 (마포·성동·강남·용산·송파)',
      '카페·레스토랑·문화공간 큐레이션',
      '실시간 영업 상태 확인',
    ],
    accentColor: 'from-secondary-500/10 to-secondary-500/5',
    iconBg: 'bg-secondary-50 dark:bg-secondary-900/20',
    iconColor: 'text-secondary-500',
  },
  {
    icon: Pencil,
    title: '롤링페이퍼',
    badge: '핵심 기능',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    description:
      '만남 이후 서로에게 익명 메시지를 남기는 롤링페이퍼 기능으로 재방문율을 높이고 감성적 연결을 이어갑니다.',
    points: [
      'RICE 점수 1위 — 가장 높은 ROI 기능',
      '익명 보장 + 수신자 선택 공개',
      'Day-7 리텐션 직결 루프',
    ],
    accentColor: 'from-green-500/10 to-green-500/5',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-500',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

export function FeaturesSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="features"
      className="section-padding"
      aria-labelledby="features-heading"
    >
      <div className="container-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Features
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white"
          >
            기술이 만드는
            <br />
            <span className="text-gradient-primary">진짜 인연</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="주요 기능 목록"
        >
          {features.map(
            ({
              icon: Icon,
              title,
              badge,
              badgeColor,
              description,
              points,
              accentColor,
              iconBg,
              iconColor,
            }) => (
              <motion.article
                key={title}
                variants={cardVariants}
                className={`card-base p-8 bg-gradient-to-br ${accentColor} hover:shadow-card-hover transition-shadow duration-300`}
                role="listitem"
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
                  >
                    {badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  {description}
                </p>

                <ul className="space-y-2" aria-label={`${title} 세부 사항`}>
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            )
          )}
        </motion.div>
      </div>
    </section>
  )
}

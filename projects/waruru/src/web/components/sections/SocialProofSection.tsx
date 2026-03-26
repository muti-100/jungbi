'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    nickname: '별빛고양이',
    job: '마포구 직장인',
    text: '앱이 카페를 알아서 잡아줘서 "어디 갈까요?" 하는 어색한 질문이 없었어요. 만남 자체에 집중할 수 있었습니다.',
    avatar: 'BG',
    avatarBg: 'bg-primary-100 text-primary-600',
  },
  {
    id: 2,
    nickname: '구름토끼',
    job: '강남구 직장인',
    text: 'BLE로 도착을 확인하는 게 신기했어요. 상대방이 실제로 오는지 확인되니까 노쇼 걱정이 없더라고요.',
    avatar: 'GT',
    avatarBg: 'bg-secondary-100 text-secondary-600',
  },
  {
    id: 3,
    nickname: '소나기펭귄',
    job: '성동구 직장인',
    text: '롤링페이퍼가 진짜 매력적이에요. 만남 이후에도 연결이 이어지는 느낌이라 다음 매칭이 기대됩니다.',
    avatar: 'SP',
    avatarBg: 'bg-green-100 text-green-600',
  },
]

const stats = [
  { value: '23,400+', label: '서울 직장인이 이미 만났습니다' },
  { value: '4.8★', label: '앱스토어 평균 평점' },
  { value: '73.6%', label: '롤링페이퍼 완성률' },
  { value: '88.3%', label: 'BLE 도착 확인률' },
]

export function SocialProofSection() {
  const ref = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="social-proof"
      className="section-padding bg-gray-50 dark:bg-gray-950/50"
      aria-labelledby="social-proof-heading"
    >
      <div className="container-section">
        {/* Big stat banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2
            id="social-proof-heading"
            className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-2"
          >
            서울 직장인{' '}
            <span className="text-gradient-primary">23,400명</span>이
          </h2>
          <p className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
            이미 만났습니다
          </p>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
            베타 출시 3개월 · 서울 5개 구 운영 중
          </p>
        </motion.div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          role="list"
          aria-label="서비스 주요 지표"
        >
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card-base p-6 text-center"
              role="listitem"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-500 mb-1">
                {value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-snug">
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          role="list"
          aria-label="사용자 후기"
        >
          {testimonials.map(({ id, nickname, job, text, avatar, avatarBg }, i) => (
            <motion.figure
              key={id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
              className="card-base p-6"
              role="listitem"
            >
              <Quote
                className="w-8 h-8 text-primary-200 dark:text-primary-800 mb-4"
                aria-hidden="true"
              />
              <blockquote>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5">
                  {text}
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-sm font-bold shrink-0`}
                  aria-hidden="true"
                >
                  {avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {nickname}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{job}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

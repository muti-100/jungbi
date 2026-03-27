'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Search,
  BookOpen,
  Newspaper,
  ChevronDown,
  ExternalLink,
  Tag,
  Sparkles,
  X,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type Category = 'procedure' | 'law' | 'loan' | 'tax'

interface LawRef {
  law: string
  article: string
  title: string
  content: string
}

interface NewsItem {
  title: string
  source: string
  date: string
  url: string
}

interface FaqItem {
  id: string
  question: string
  keywords: string[]
  category: Category
  answer: string
  lawRefs: LawRef[]
  relatedNews: NewsItem[]
}

interface LiveNewsItem {
  title: string
  description: string
  link: string
  pubDate: string
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                            */
/* ------------------------------------------------------------------ */

const FAQ_DATA: FaqItem[] = [
  {
    id: '1',
    question: '대의원 출마 조건은?',
    keywords: ['대의원', '출마', '자격', '조건', '피선거권'],
    category: 'procedure',
    answer:
      '조합원으로서 정관이 정하는 바에 따라 대의원회의 대의원으로 선출될 수 있습니다. 일반적으로 해당 정비구역 내 토지등소유자로서 조합원 자격을 가진 자가 대의원이 될 수 있습니다.',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제41조',
        title: '대의원회',
        content:
          '① 조합원의 수가 100인 이상인 조합은 대의원회를 두어야 한다.\n② 대의원회는 조합원 10분의 1 이상으로 구성하되, 조합원이 100인을 넘는 경우에는 조합원의 10분의 1 범위에서 100인 이상으로 구성한다.\n③ 대의원의 자격, 선임방법, 선임절차 및 대의원회의 의결방법 등은 정관으로 정한다.',
      },
    ],
    relatedNews: [
      {
        title: '서울 재개발 조합 대의원 선출 부정 논란...법원 "정관 위반"',
        source: '한국경제',
        date: '2026-02-15',
        url: '#',
      },
    ],
  },
  {
    id: '2',
    question: '대의원 임기는 몇 년인가요?',
    keywords: ['대의원', '임기', '기간', '연임'],
    category: 'procedure',
    answer:
      '대의원의 임기는 정관으로 정합니다. 일반적으로 2~3년이며, 연임 가능 여부도 정관에 따릅니다.',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제41조 제3항',
        title: '대의원회',
        content:
          '대의원의 자격, 선임방법, 선임절차 및 대의원회의 의결방법 등은 정관으로 정한다.',
      },
    ],
    relatedNews: [],
  },
  {
    id: '3',
    question: '조합설립 동의율은 얼마인가요?',
    keywords: ['조합설립', '동의율', '동의', '인가', '설립'],
    category: 'procedure',
    answer:
      '재개발: 토지등소유자 3/4 이상 + 토지면적 1/2 이상 동의\n재건축: 주택단지 내 구분소유자 3/4 이상 + 토지면적 3/4 이상 동의',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제35조',
        title: '조합의 설립인가',
        content:
          '① 재개발사업의 추진위원회가 조합을 설립하려면 토지등소유자의 3/4 이상 및 토지면적의 1/2 이상의 토지소유자의 동의를 받아야 한다.\n② 재건축사업의 추진위원회가 조합을 설립하려면 주택단지 내 구분소유자의 3/4 이상 및 토지면적의 3/4 이상의 토지소유자의 동의를 받아야 한다.',
      },
    ],
    relatedNews: [
      {
        title: '강남 재건축 동의율 75% 달성...조합설립 추진',
        source: '매일경제',
        date: '2026-03-10',
        url: '#',
      },
      {
        title: '"동의율 산정 기준일" 대법원 판례 정리',
        source: '법률신문',
        date: '2026-01-20',
        url: '#',
      },
    ],
  },
  {
    id: '4',
    question: '총회 의결 정족수는?',
    keywords: ['총회', '의결', '정족수', '과반', '결의'],
    category: 'procedure',
    answer:
      '일반 의결: 조합원 과반수 출석 + 출석 과반수 찬성\n특별 의결 (정관 변경, 관리처분 등): 조합원 과반수 출석 + 출석 2/3 이상 찬성\n조합 해산: 조합원 3/4 이상 찬성',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제45조',
        title: '총회의 의결',
        content:
          '① 다음 각 호의 사항은 조합원 과반수의 출석과 출석 조합원 과반수의 찬성으로 의결한다.\n② 다음 각 호의 사항은 조합원 과반수의 출석과 출석 조합원의 3분의 2 이상의 찬성으로 의결한다.\n1. 정관의 변경\n2. 자금의 차입과 그 방법·이율 및 상환방법\n3. 관리처분계획의 수립 및 변경',
      },
    ],
    relatedNews: [
      {
        title: '재개발 총회 의결 무효 소송...정족수 논란',
        source: '서울경제',
        date: '2026-02-28',
        url: '#',
      },
    ],
  },
  {
    id: '5',
    question: '관리처분계획 수립 절차는?',
    keywords: ['관리처분', '계획', '수립', '인가', '분양신청'],
    category: 'procedure',
    answer:
      '분양신청기간 종료 → 관리처분계획 수립 → 총회 의결(출석 2/3 이상) → 시장·군수 인가 신청 → 인가 → 관보 고시',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제74조',
        title: '관리처분계획의 인가',
        content:
          '① 사업시행자는 분양신청기간이 종료된 때에는 관리처분계획을 수립하여 시장·군수등의 인가를 받아야 한다.',
      },
      {
        law: '도시정비법',
        article: '제72조',
        title: '분양신청',
        content:
          '사업시행자는 관리처분계획의 인가를 신청하기 전에 분양대상자에게 30일 이상 60일 이내의 기간을 정하여 분양신청을 하게 하여야 한다.',
      },
    ],
    relatedNews: [
      {
        title: '성동구 재개발 관리처분 인가 획득...이주 시작',
        source: '뉴스1',
        date: '2026-03-05',
        url: '#',
      },
    ],
  },
  {
    id: '6',
    question: '사업시행계획 변경 시 동의 요건은?',
    keywords: ['사업시행', '계획', '변경', '동의', '경미한'],
    category: 'procedure',
    answer:
      '경미한 변경: 총회 의결 불필요 (조합장 승인)\n중요 변경: 총회 의결(출석 2/3 이상) + 시장·군수 인가',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제50조',
        title: '사업시행계획인가',
        content:
          '사업시행자는 사업시행계획서를 작성하여 시장·군수등에게 제출하고 사업시행계획인가를 받아야 한다.',
      },
      {
        law: '도시정비법 시행령',
        article: '제47조',
        title: '경미한 변경',
        content:
          '법 제50조제1항에서 "대통령령으로 정하는 경미한 사항을 변경하려는 때"란 다음 각 호의 어느 하나에 해당하는 때를 말한다.',
      },
    ],
    relatedNews: [],
  },
  {
    id: '7',
    question: '추진위원회 구성 요건은?',
    keywords: ['추진위원회', '구성', '요건', '승인', '위원장'],
    category: 'procedure',
    answer:
      '토지등소유자 과반수의 동의를 받아 위원장을 포함한 5인 이상의 추진위원회를 구성하고 시장·군수의 승인을 받아야 합니다.',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제31조',
        title: '추진위원회의 구성',
        content:
          '① 정비사업을 추진하려는 경우에는 토지등소유자 과반수의 동의를 받아 위원장을 포함한 5인 이상의 추진위원회를 구성하여 시장·군수등의 승인을 받아야 한다.',
      },
    ],
    relatedNews: [
      {
        title: '마포구 재개발 추진위 구성 승인...본격 추진',
        source: '아시아경제',
        date: '2026-01-15',
        url: '#',
      },
    ],
  },
  {
    id: '8',
    question: '조합 임원 해임 절차는?',
    keywords: ['임원', '해임', '조합장', '이사', '감사', '해임청구'],
    category: 'procedure',
    answer:
      '조합원 10분의 1 이상의 발의 → 총회 소집 요구 → 총회에서 조합원 과반수 출석 + 출석 과반수 찬성으로 해임',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제43조',
        title: '조합 임원의 해임',
        content:
          '① 조합원은 조합 임원을 해임하려면 조합원 10분의 1 이상의 발의로 소집된 총회에서 조합원 과반수의 출석과 출석 조합원 과반수의 동의를 받아야 한다.',
      },
    ],
    relatedNews: [
      {
        title: '재건축 조합장 해임 총회 개최...찬반 팽팽',
        source: '한국일보',
        date: '2026-03-20',
        url: '#',
      },
    ],
  },
  {
    id: '9',
    question: '소규모재건축 요건은?',
    keywords: ['소규모', '재건축', '자율주택', '가로주택', '요건'],
    category: 'law',
    answer:
      '소규모재건축: 면적 1만㎡ 미만, 노후·불량건축물 2/3 이상\n가로주택정비: 가로구역 내 1만㎡ 미만\n자율주택정비: 단독주택 10호 미만 또는 연립주택 20세대 미만',
    lawRefs: [
      {
        law: '빈집 및 소규모주택 정비에 관한 특례법',
        article: '제2조',
        title: '정의',
        content:
          '소규모재건축사업: 정비기반시설이 양호한 지역에서 소규모로 공동주택을 재건축하는 사업',
      },
    ],
    relatedNews: [
      {
        title: '소규모재건축 활성화...정부 규제 완화 추진',
        source: '조선일보',
        date: '2026-02-05',
        url: '#',
      },
    ],
  },
  {
    id: '10',
    question: '모아주택(모아타운) 사업 조건은?',
    keywords: ['모아주택', '모아타운', '소규모', '특례'],
    category: 'law',
    answer:
      '모아주택: 기존 주택을 활용한 소규모 주택정비사업으로, 주택 소유자 2/3 이상 동의 필요. 서울시 조례에 따라 5만㎡ 이하 구역에서 시행.',
    lawRefs: [
      {
        law: '빈집 및 소규모주택 정비에 관한 특례법',
        article: '제2조',
        title: '정의',
        content:
          '모아주택정비사업: 가로구역에서 종전의 가로를 유지하면서 소규모로 주거환경을 개선하는 사업',
      },
    ],
    relatedNews: [
      {
        title: '서울시 모아타운 2차 선정지 발표...15곳 추가',
        source: '연합뉴스',
        date: '2026-03-01',
        url: '#',
      },
    ],
  },
  {
    id: '11',
    question: '이주비 지급 기준은?',
    keywords: ['이주비', '이주', '보상', '세입자', '주거이전비'],
    category: 'procedure',
    answer:
      '주거이전비: 세입자에게 2개월분 주거비 지급\n이사비: 가구당 정액 지급\n이주정착금: 관리처분계획에 따라 산정',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제81조',
        title: '이주대책의 수립 등',
        content: '사업시행자는 주거이전비를 세입자에게 지급하여야 한다.',
      },
    ],
    relatedNews: [
      {
        title: '재개발 이주비 분쟁 "보상 기준 명확히 해야"',
        source: '머니투데이',
        date: '2026-01-28',
        url: '#',
      },
    ],
  },
  {
    id: '12',
    question: '정비사업전문관리업 등록 요건은?',
    keywords: ['전문관리업', '등록', '자격', '요건', '관리업'],
    category: 'law',
    answer:
      '자본금 5억원 이상, 기술인력 5인 이상 (건축사, 감정평가사, 법무사 등), 시·도지사에게 등록',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제102조',
        title: '정비사업전문관리업의 등록',
        content:
          '정비사업전문관리업을 하려는 자는 시·도지사에게 등록하여야 한다.',
      },
    ],
    relatedNews: [],
  },
  {
    id: '13',
    question: '정비구역 해제 조건은?',
    keywords: ['정비구역', '해제', '일몰', '기간', '지정해제'],
    category: 'law',
    answer:
      '정비구역 지정·고시 후 3년 이내 조합설립 미인가 시 자동 해제. 토지등소유자 30% 이상이 해제 요청 가능.',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제21조',
        title: '정비구역 등의 해제',
        content:
          '정비구역 지정·고시일부터 3년이 되는 날까지 조합설립인가를 신청하지 아니하는 경우 해당 정비구역의 지정이 해제된 것으로 본다.',
      },
    ],
    relatedNews: [
      {
        title: '정비구역 일몰제 적용...전국 300곳 해제 위기',
        source: '동아일보',
        date: '2026-02-20',
        url: '#',
      },
    ],
  },
  {
    id: '14',
    question: '용적률 인센티브 조건은?',
    keywords: ['용적률', '인센티브', '완화', '기부채납', '공공기여'],
    category: 'law',
    answer:
      '기부채납 비율에 따라 법정 용적률의 120%까지 완화 가능. 임대주택 의무 비율 충족 시 추가 인센티브.',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제54조',
        title: '용적률에 관한 특례',
        content:
          '정비구역에서 정비사업을 시행하는 경우 국토의 계획 및 이용에 관한 법률에 따른 용적률의 상한까지 건축할 수 있다.',
      },
    ],
    relatedNews: [
      {
        title: '서울시 재개발 용적률 완화안 확정...최대 500%',
        source: '중앙일보',
        date: '2026-03-15',
        url: '#',
      },
    ],
  },
  {
    id: '15',
    question: '감정평가 방법과 비용 부담은?',
    keywords: ['감정평가', '비용', '평가', '종전자산', '종후자산'],
    category: 'procedure',
    answer:
      '감정평가업자 2인 이상 선정. 비용은 사업비에서 충당. 종전자산 평가 시점은 사업시행인가 고시일 기준.',
    lawRefs: [
      {
        law: '도시정비법',
        article: '제74조 제4항',
        title: '관리처분계획의 인가',
        content:
          '사업시행자는 관리처분계획을 수립하기 위하여 감정평가업자 2인 이상에게 종전의 토지 또는 건축물의 가격을 평가하게 하여야 한다.',
      },
    ],
    relatedNews: [],
  },
]

const POPULAR_TAGS = [
  '대의원 출마',
  '동의율',
  '총회 의결',
  '관리처분',
  '추진위원회',
  '조합장 해임',
  '이주비',
  '소규모재건축',
  '용적률',
  '정비구역 해제',
]

/* ------------------------------------------------------------------ */
/* Category config                                                       */
/* ------------------------------------------------------------------ */

type FilterCategory = 'all' | Category

const CATEGORY_FILTERS: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'procedure', label: '절차' },
  { value: 'law', label: '법령' },
  { value: 'loan', label: '대출' },
  { value: 'tax', label: '세금' },
]

const CATEGORY_BADGE: Record<Category, { variant: 'primary' | 'success' | 'info' | 'warning'; label: string }> = {
  procedure: { variant: 'primary', label: '절차' },
  law: { variant: 'success', label: '법령' },
  loan: { variant: 'info', label: '대출' },
  tax: { variant: 'warning', label: '세금' },
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url)
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function formatKoreanDate(pubDate: string): string {
  try {
    const d = new Date(pubDate)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return pubDate
  }
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function LawRefBlock({ lawRef }: { lawRef: LawRef }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="border-l-4 border-primary-600 bg-neutral-50 rounded-r-lg overflow-hidden"
      aria-label={`${lawRef.law} ${lawRef.article}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-neutral-100 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          <code className="shrink-0 text-xs font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
            {lawRef.article}
          </code>
          <span className="text-sm font-medium text-neutral-800 truncate">
            {lawRef.law} ({lawRef.title})
          </span>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-neutral-400 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line font-mono">
            {lawRef.content}
          </p>
        </div>
      )}
    </div>
  )
}

function NewsItemRow({ news }: { news: NewsItem }) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-neutral-50 transition-colors group"
      aria-label={`${news.title} - ${news.source} (새 탭에서 열기)`}
    >
      <Newspaper
        size={14}
        className="shrink-0 mt-0.5 text-neutral-400 group-hover:text-primary-600 transition-colors"
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-800 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
          {news.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
            {news.source}
          </span>
          <span className="text-xs text-neutral-400 font-mono">{news.date}</span>
        </div>
      </div>
      <ExternalLink
        size={13}
        className="shrink-0 mt-0.5 text-neutral-300 group-hover:text-primary-500 transition-colors"
        aria-hidden
      />
    </a>
  )
}

function FaqCard({ item }: { item: FaqItem }) {
  const [answerExpanded, setAnswerExpanded] = useState(false)
  const categoryInfo = CATEGORY_BADGE[item.category]
  const isLong = item.answer.length > 80

  return (
    <article
      className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
      aria-labelledby={`faq-title-${item.id}`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>
        </div>
        <h2
          id={`faq-title-${item.id}`}
          className="text-base font-semibold text-neutral-900 leading-snug"
        >
          {item.question}
        </h2>
      </div>

      {/* Answer */}
      <div className="px-5 pb-4">
        <div
          className={cn(
            'text-sm text-neutral-600 leading-relaxed whitespace-pre-line transition-all duration-200',
            !answerExpanded && isLong && 'line-clamp-3'
          )}
        >
          {item.answer}
        </div>
        {isLong && (
          <button
            type="button"
            onClick={() => setAnswerExpanded((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            aria-expanded={answerExpanded}
            aria-controls={`faq-answer-${item.id}`}
          >
            <ChevronDown
              size={13}
              className={cn('transition-transform duration-200', answerExpanded && 'rotate-180')}
              aria-hidden
            />
            {answerExpanded ? '접기' : '더 보기'}
          </button>
        )}
      </div>

      {/* Law refs */}
      {item.lawRefs.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={13} className="text-neutral-400" aria-hidden />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              관련 법령
            </span>
          </div>
          <div className="space-y-2">
            {item.lawRefs.map((ref, idx) => (
              <LawRefBlock key={idx} lawRef={ref} />
            ))}
          </div>
        </div>
      )}

      {/* Related news */}
      {item.relatedNews.length > 0 && (
        <div className="px-5 pb-5 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Newspaper size={13} className="text-neutral-400" aria-hidden />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              관련 뉴스
            </span>
          </div>
          <div>
            {item.relatedNews.map((news, idx) => (
              <NewsItemRow key={idx} news={news} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Live News Section                                                    */
/* ------------------------------------------------------------------ */

function LiveNewsSkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3 px-3 animate-pulse" aria-hidden>
      <div className="w-3.5 h-3.5 rounded bg-neutral-200 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-neutral-200 rounded w-4/5" />
        <div className="h-3 bg-neutral-100 rounded w-2/5" />
      </div>
    </div>
  )
}

function LiveNewsSection({
  items,
  loading,
  query,
}: {
  items: LiveNewsItem[]
  loading: boolean
  query: string
}) {
  const searchLabel = query.trim() ? `"${query.trim()}" 관련` : '정비사업'

  return (
    <section
      aria-labelledby="live-news-heading"
      className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-primary-600" aria-hidden />
          <h2
            id="live-news-heading"
            className="text-sm font-semibold text-neutral-800"
          >
            실시간 관련 뉴스
          </h2>
          <span className="text-xs text-neutral-400 font-medium">
            {searchLabel} · 네이버 뉴스
          </span>
        </div>
        {loading && (
          <RefreshCw
            size={13}
            className="text-neutral-400 animate-spin"
            aria-label="뉴스 불러오는 중"
          />
        )}
      </div>

      <div role="feed" aria-label="실시간 뉴스 목록" aria-busy={loading}>
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <LiveNewsSkeletonRow key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Newspaper size={32} className="text-neutral-200 mb-3" strokeWidth={1} aria-hidden />
            <p className="text-sm text-neutral-500">관련 뉴스를 불러올 수 없습니다</p>
            <p className="text-xs text-neutral-400 mt-1">API 키 설정을 확인하거나 잠시 후 다시 시도하세요</p>
          </div>
        ) : (
          <div>
            {items.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.title} (새 탭에서 열기)`}
                className="flex items-start gap-3 py-3 px-5 hover:bg-neutral-50 transition-colors group border-b border-neutral-50 last:border-b-0"
              >
                <Newspaper
                  size={14}
                  className="shrink-0 mt-0.5 text-neutral-400 group-hover:text-primary-600 transition-colors"
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {extractDomain(item.link)}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {formatKoreanDate(item.pubDate)}
                    </span>
                  </div>
                </div>
                <ExternalLink
                  size={13}
                  className="shrink-0 mt-0.5 text-neutral-300 group-hover:text-primary-500 transition-colors"
                  aria-hidden
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Empty / Loading states                                               */
/* ------------------------------------------------------------------ */

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Search size={48} className="text-neutral-200 mb-4" strokeWidth={1} aria-hidden />
      <p className="text-base font-medium text-neutral-500">
        &ldquo;{query}&rdquo;에 해당하는 항목이 없습니다
      </p>
      <p className="text-sm text-neutral-400 mt-1">
        다른 키워드로 검색하거나 아래 인기 검색어를 눌러보세요
      </p>
    </div>
  )
}

function CategoryGroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-sm font-bold text-neutral-700">{label}</span>
      <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full font-mono">
        {count}건
      </span>
      <div className="flex-1 h-px bg-neutral-100" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function LawSmartSearchPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')

  // Live news state
  const [newsItems, setNewsItems] = useState<LiveNewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTagClick = useCallback((tag: string) => {
    setQuery(tag)
    setActiveCategory('all')
  }, [])

  const handleClearQuery = useCallback(() => {
    setQuery('')
  }, [])

  // Fetch live news — debounced 600ms when query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const searchQuery = query.trim() ? `${query.trim()} 정비사업` : '재개발 정비사업'
      setNewsLoading(true)

      fetch(`/api/news?query=${encodeURIComponent(searchQuery)}&display=5&sort=date`)
        .then((res) => res.json())
        .then((data: { items?: LiveNewsItem[] }) => {
          setNewsItems(data.items ?? [])
          setNewsLoading(false)
        })
        .catch(() => {
          setNewsItems([])
          setNewsLoading(false)
        })
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Fast filter — runs on every keystroke via useMemo
  const filteredItems = useMemo<FaqItem[]>(() => {
    const q = query.trim().toLowerCase()
    let items = FAQ_DATA

    // Category filter
    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory)
    }

    // Text search filter
    if (q) {
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
          item.lawRefs.some(
            (ref) =>
              ref.law.toLowerCase().includes(q) ||
              ref.article.toLowerCase().includes(q) ||
              ref.title.toLowerCase().includes(q)
          )
      )
    }

    return items
  }, [query, activeCategory])

  // Group by category when no search query
  const groupedItems = useMemo(() => {
    if (query.trim()) return null
    const groups: Partial<Record<Category, FaqItem[]>> = {}
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category]!.push(item)
    })
    return groups
  }, [query, filteredItems])

  const categoryOrder: Category[] = ['procedure', 'law', 'loan', 'tax']
  const categoryLabels: Record<Category, string> = {
    procedure: '절차',
    law: '법령',
    loan: '대출',
    tax: '세금',
  }

  return (
    <div className="flex flex-col min-h-full bg-neutral-50">
      {/* ── Hero search area ── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-8 md:px-10">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-primary-600" aria-hidden />
            <h1 className="text-xl font-bold text-neutral-900">법령 스마트 검색</h1>
          </div>
          <p className="text-sm text-neutral-500 mb-5">
            궁금한 상황을 입력하시면 관련 법령을 바로 찾아드립니다
          </p>

          {/* Search input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 대의원 출마조건이 어떻게 되나요?"
              className="w-full pl-11 pr-12 py-3.5 text-sm border-2 border-neutral-200 rounded-xl bg-white placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors"
              aria-label="법령 스마트 검색 입력"
              aria-describedby="search-hint"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="검색어 지우기"
              >
                <X size={15} aria-hidden />
              </button>
            )}
          </div>
          <p id="search-hint" className="sr-only">
            검색어를 입력하면 관련 법령과 절차가 실시간으로 표시됩니다
          </p>

          {/* Popular tags */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 mr-1">
                <Tag size={12} className="text-neutral-400" aria-hidden />
                <span className="text-xs text-neutral-400 font-medium">인기 검색어</span>
              </div>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-150',
                    query === tag
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-400 hover:text-primary-600'
                  )}
                  aria-pressed={query === tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category filter + results ── */}
      <div className="flex-1 px-6 py-6 md:px-10 max-w-5xl w-full mx-auto">
        {/* Category filter pills */}
        <div
          className="flex items-center gap-2 mb-6 flex-wrap"
          role="group"
          aria-label="카테고리 필터"
        >
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150',
                activeCategory === cat.value
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-400 hover:text-primary-600'
              )}
              aria-pressed={activeCategory === cat.value}
            >
              {cat.label}
              {cat.value !== 'all' && (
                <span
                  className={cn(
                    'ml-1.5 text-xs font-mono',
                    activeCategory === cat.value ? 'text-white/80' : 'text-neutral-400'
                  )}
                >
                  {FAQ_DATA.filter((i) => i.category === cat.value).length}
                </span>
              )}
            </button>
          ))}

          {/* Result count */}
          {query && (
            <span className="ml-auto text-sm text-neutral-500">
              <span className="font-semibold text-neutral-800">{filteredItems.length}건</span> 검색됨
            </span>
          )}
        </div>

        {/* Results */}
        {filteredItems.length === 0 ? (
          <EmptySearchState query={query} />
        ) : query.trim() ? (
          /* ── Search mode: flat list ── */
          <section aria-label="검색 결과">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <FaqCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : (
          /* ── Browse mode: grouped by category ── */
          <div className="space-y-10" aria-label="자주 묻는 상황">
            {categoryOrder.map((cat) => {
              const items = groupedItems?.[cat]
              if (!items || items.length === 0) return null
              return (
                <section key={cat} aria-labelledby={`group-${cat}`}>
                  <CategoryGroupHeader
                    label={categoryLabels[cat]}
                    count={items.length}
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {items.map((item) => (
                      <FaqCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* ── Live news section (always visible at bottom) ── */}
        <div className="mt-10">
          <LiveNewsSection
            items={newsItems}
            loading={newsLoading}
            query={query}
          />
        </div>
      </div>
    </div>
  )
}

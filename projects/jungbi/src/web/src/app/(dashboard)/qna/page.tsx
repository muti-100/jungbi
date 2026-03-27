'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Eye,
  MessageCircle,
  CheckCircle2,
  ChevronLeft,
  Star,
  BadgeCheck,
  Send,
  User,
  Calendar,
  ThumbsUp,
  Phone,
  FileSignature,
} from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type QnaCategory = 'all' | 'loan' | 'tax' | 'procedure' | 'law' | 'etc'
type AuthorType = 'general' | 'lawyer'

interface QnaItem {
  id: string
  category: Exclude<QnaCategory, 'all'>
  title: string
  content: string
  authorName: string
  authorType: AuthorType
  date: string
  views: number
  answers: QnaAnswer[]
  resolved: boolean
}

interface QnaAnswer {
  id: string
  authorName: string
  authorType: AuthorType
  firm?: string
  content: string
  date: string
  isAccepted: boolean
  opinionFee?: string
  likes: number
}

interface Lawyer {
  id: string
  name: string
  firm: string
  specialties: string[]
  rating: number
  consultFee: string
  opinionFee: string
  reviewCount: number
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                             */
/* ------------------------------------------------------------------ */

const QNA_DATA: QnaItem[] = [
  {
    id: 'q1',
    category: 'loan',
    title: '투기과열지구 1주택자인데 추가 주택 담보대출 가능한가요?',
    content:
      '현재 서울 강남구에 아파트 1채를 보유하고 있습니다. 추가로 경기도 성남시 분당구에 주택을 매입하려고 하는데, 투기과열지구 지정 여부와 LTV 규제 적용 여부가 어떻게 되는지 궁금합니다. 현재 소득은 연 7,000만원이며 기존 대출은 없는 상태입니다.',
    authorName: '박민준',
    authorType: 'general',
    date: '2026-03-25',
    views: 234,
    resolved: true,
    answers: [
      {
        id: 'a1-1',
        authorName: '김법률',
        authorType: 'lawyer',
        firm: '법무법인 정의',
        content:
          '투기과열지구 내 2주택자의 경우 LTV 0%가 원칙적으로 적용됩니다. 다만, 성남시 분당구가 현재 투기과열지구로 지정되어 있는지 확인이 필요하며, 비규제지역이라면 수도권 기준 LTV 50%까지 가능합니다. DSR 40% 규제 역시 충족 여부를 금융기관에서 별도로 심사하게 됩니다. 현재 소득 수준을 고려하면 충분히 가능할 수 있으나, 반드시 사전 상담을 권드립니다.',
        date: '2026-03-25',
        isAccepted: true,
        opinionFee: '법률 의견서 30만원',
        likes: 12,
      },
      {
        id: 'a1-2',
        authorName: '이정비',
        authorType: 'lawyer',
        firm: '법무법인 도시',
        content:
          '분당구는 조정대상지역에 해당하므로 2주택자 기준 LTV 50%가 적용됩니다. DSR 40% 기준도 충족하신다면 대출이 가능합니다.',
        date: '2026-03-26',
        isAccepted: false,
        likes: 7,
      },
      {
        id: 'a1-3',
        authorName: '최재훈',
        authorType: 'general',
        content: '저도 비슷한 상황인데 은행에서 거절당했습니다. 꼭 사전 심사 받아보세요.',
        date: '2026-03-26',
        isAccepted: false,
        likes: 2,
      },
    ],
  },
  {
    id: 'q2',
    category: 'tax',
    title: '부모님 아파트 증여 시 취득세 중과 여부',
    content:
      '부모님이 보유한 아파트(공시가격 4억원)를 저에게 증여하려 합니다. 현재 저는 무주택자이며, 증여 후 이 아파트가 1주택이 됩니다. 이 경우 취득세가 중과되는지, 그리고 증여세 공제는 얼마나 받을 수 있는지 알고 싶습니다.',
    authorName: '이수진',
    authorType: 'general',
    date: '2026-03-24',
    views: 189,
    resolved: false,
    answers: [
      {
        id: 'a2-1',
        authorName: '김법률',
        authorType: 'lawyer',
        firm: '법무법인 정의',
        content:
          '증여로 인한 취득세는 3.5%가 적용됩니다 (매매와 다름). 무주택자가 직계존속으로부터 증여받는 경우도 동일하게 3.5%가 원칙입니다. 증여세의 경우 직계존비속 공제 5,000만원을 받으실 수 있으며, 10년 내 추가 증여가 없었다면 (4억 - 5천만 = 3억5천만원)에 대해 누진 세율 적용됩니다.',
        date: '2026-03-24',
        isAccepted: false,
        opinionFee: '법률 의견서 30만원',
        likes: 8,
      },
      {
        id: 'a2-2',
        authorName: '홍길동',
        authorType: 'general',
        content: '세무사 상담도 함께 받아보시길 권합니다. 증여세와 취득세 합산하면 꽤 됩니다.',
        date: '2026-03-25',
        isAccepted: false,
        likes: 3,
      },
    ],
  },
  {
    id: 'q3',
    category: 'procedure',
    title: '추진위원회에서 조합설립까지 필요한 동의율이 어떻게 되나요?',
    content:
      '재개발구역으로 지정된 지역에 거주하고 있습니다. 현재 주민들이 추진위원회를 구성하는 단계인데, 추진위원회 구성부터 조합 설립인가까지 각 단계별로 필요한 동의율이 궁금합니다. 특히 토지 소유자 기준인지, 세대 수 기준인지도 헷갈립니다.',
    authorName: '정태양',
    authorType: 'general',
    date: '2026-03-23',
    views: 312,
    resolved: true,
    answers: [
      {
        id: 'a3-1',
        authorName: '이정비',
        authorType: 'lawyer',
        firm: '법무법인 도시',
        content:
          '도시정비법 기준으로 설명드리면: 1) 추진위원회 구성: 토지등소유자 과반수(50% 초과) 동의 필요. 2) 조합설립인가: 토지 또는 건축물 소유자 및 지상권자의 3/4 이상 + 토지면적 1/2 이상 소유자 동의 필요. 세대 수가 아니라 소유자 기준임을 꼭 확인하세요. 단, 재건축의 경우 구분소유자 기준이 달라질 수 있습니다.',
        date: '2026-03-23',
        isAccepted: true,
        opinionFee: '법률 의견서 20만원',
        likes: 18,
      },
      {
        id: 'a3-2',
        authorName: '박소영',
        authorType: 'general',
        content: '저희 구역도 비슷한 단계인데 정비사 선정 전에 조합설립부터 추진 중입니다. 도움이 됐습니다.',
        date: '2026-03-24',
        isAccepted: false,
        likes: 4,
      },
      {
        id: 'a3-3',
        authorName: '최민수',
        authorType: 'general',
        content: '추진위 구성 전에 법무사나 변호사에게 자문 받는 게 좋습니다.',
        date: '2026-03-25',
        isAccepted: false,
        likes: 2,
      },
      {
        id: 'a3-4',
        authorName: '이수연',
        authorType: 'general',
        content: '도시정비법 제35조 확인해 보세요. 자세히 나와 있습니다.',
        date: '2026-03-26',
        isAccepted: false,
        likes: 1,
      },
      {
        id: 'a3-5',
        authorName: '김대한',
        authorType: 'general',
        content: '동의서 날짜 기준도 중요합니다. 인가 신청일 기준으로 효력이 있어야 합니다.',
        date: '2026-03-27',
        isAccepted: false,
        likes: 3,
      },
    ],
  },
  {
    id: 'q4',
    category: 'law',
    title: '2026년 개정 도시정비법 소규모재건축 변경 사항',
    content:
      '올해 초 도시정비법이 개정됐다고 들었는데, 소규모 재건축에 관한 변경 사항이 어떻게 되는지 정리해 주실 수 있나요? 특히 동의율 완화나 절차 간소화 부분이 있다면 알고 싶습니다.',
    authorName: '강동원',
    authorType: 'general',
    date: '2026-03-22',
    views: 156,
    resolved: false,
    answers: [
      {
        id: 'a4-1',
        authorName: '김법률',
        authorType: 'lawyer',
        firm: '법무법인 정의',
        content:
          '2026년 1월 개정된 도시정비법(제19234호)의 주요 변경 사항으로는: 1) 소규모재건축 사업시행자 요건 완화(단지 규모 조정), 2) 추진위원회 없이 조합설립 직접 가능 조항 신설(200세대 미만), 3) 사업시행계획인가 처리기간 60일→45일 단축이 있습니다. 동의율 자체는 변경되지 않았습니다.',
        date: '2026-03-22',
        isAccepted: false,
        opinionFee: '법률 의견서 30만원',
        likes: 9,
      },
    ],
  },
  {
    id: 'q5',
    category: 'tax',
    title: '재개발 입주권 양도 시 비과세 요건',
    content:
      '재개발구역 내 주택을 보유하고 있습니다. 관리처분인가 이후 입주권 상태에서 매도할 예정인데, 1세대 1주택 비과세 요건을 충족하는지 알고 싶습니다. 기존 주택은 2년 이상 보유했습니다.',
    authorName: '윤서연',
    authorType: 'general',
    date: '2026-03-21',
    views: 267,
    resolved: true,
    answers: [
      {
        id: 'a5-1',
        authorName: '이정비',
        authorType: 'lawyer',
        firm: '법무법인 도시',
        content:
          '재개발 입주권은 소득세법상 주택으로 보지 않아 1세대 1주택 비과세가 원칙적으로 적용되지 않습니다. 다만, 소득세법 제89조 제2항에 따라 관리처분인가 전에 기존 주택이 비과세 요건(2년 보유·거주)을 갖춘 경우에는 비과세 특례가 적용됩니다. 2년 보유만으로는 부족하고, 2017년 8월 이후 취득한 조정대상지역 주택이라면 거주 요건(2년)도 충족해야 합니다.',
        date: '2026-03-21',
        isAccepted: true,
        opinionFee: '법률 의견서 20만원',
        likes: 15,
      },
      {
        id: 'a5-2',
        authorName: '박준영',
        authorType: 'general',
        content: '저도 동일한 케이스로 비과세 받았습니다. 거주 요건 꼭 확인하세요.',
        date: '2026-03-22',
        isAccepted: false,
        likes: 5,
      },
      {
        id: 'a5-3',
        authorName: '김유리',
        authorType: 'general',
        content: '인가일 기준 타이밍도 중요하니 세무사 상담 필수입니다.',
        date: '2026-03-23',
        isAccepted: false,
        likes: 4,
      },
      {
        id: 'a5-4',
        authorName: '이한솔',
        authorType: 'general',
        content: '소득세법 시행령도 같이 확인해 보세요.',
        date: '2026-03-24',
        isAccepted: false,
        likes: 2,
      },
    ],
  },
]

const LAWYERS: Lawyer[] = [
  {
    id: 'l1',
    name: '김법률',
    firm: '법무법인 정의',
    specialties: ['도시정비 전문', '재개발', '재건축'],
    rating: 4.8,
    consultFee: '5만원',
    opinionFee: '30만원',
    reviewCount: 127,
  },
  {
    id: 'l2',
    name: '이정비',
    firm: '법무법인 도시',
    specialties: ['재개발/재건축', '입주권 양도', '조합분쟁'],
    rating: 4.6,
    consultFee: '3만원',
    opinionFee: '20만원',
    reviewCount: 89,
  },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

const CATEGORY_CONFIG: Record<
  Exclude<QnaCategory, 'all'>,
  { label: string; variant: BadgeVariant }
> = {
  loan: { label: '대출', variant: 'info' },
  tax: { label: '세금', variant: 'success' },
  procedure: { label: '절차', variant: 'primary' },
  law: { label: '법령', variant: 'warning' },
  etc: { label: '기타', variant: 'neutral' },
}

const FILTER_TABS: { key: QnaCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'loan', label: '대출' },
  { key: 'tax', label: '세금' },
  { key: 'procedure', label: '절차' },
  { key: 'law', label: '법령' },
  { key: 'etc', label: '기타' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star size={12} className="text-warning-500 fill-warning-400" />
      <span className="text-xs font-medium text-neutral-700">{rating.toFixed(1)}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function QnaListCard({
  item,
  onClick,
  isSelected,
}: {
  item: QnaItem
  onClick: () => void
  isSelected: boolean
}) {
  const { label, variant } = CATEGORY_CONFIG[item.category]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'border-primary-400 bg-primary-50 shadow-sm'
          : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <Badge variant={variant}>{label}</Badge>
        {item.resolved && (
          <Badge variant="success">
            <CheckCircle2 size={10} />
            해결됨
          </Badge>
        )}
      </div>
      <p className="text-sm font-medium text-neutral-800 leading-snug line-clamp-2 mb-2.5">
        {item.title}
      </p>
      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <span className="flex items-center gap-1">
          <User size={11} />
          {item.authorName}
          {item.authorType === 'lawyer' && (
            <BadgeCheck size={11} className="text-primary-500" />
          )}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {item.date}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Eye size={11} />
          {item.views}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={11} />
          {item.answers.length}
        </span>
      </div>
    </button>
  )
}

function AnswerCard({ answer }: { answer: QnaAnswer }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        answer.isAccepted
          ? 'border-success-300 bg-success-50'
          : 'border-neutral-200 bg-white'
      }`}
      aria-label={answer.isAccepted ? '채택된 답변' : '답변'}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User size={14} className="text-primary-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-neutral-800">{answer.authorName}</span>
              {answer.authorType === 'lawyer' && (
                <>
                  <BadgeCheck size={14} className="text-primary-500" />
                  <Badge variant="primary">변호사</Badge>
                </>
              )}
              {answer.firm && (
                <span className="text-xs text-neutral-500">{answer.firm}</span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{answer.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {answer.isAccepted && (
            <Badge variant="success">
              <CheckCircle2 size={10} />
              채택됨
            </Badge>
          )}
          {answer.opinionFee && (
            <Badge variant="primary">
              <FileSignature size={10} />
              법률 의견서
            </Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
        {answer.content}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-primary-600 transition-colors"
          aria-label={`도움이 됐어요 ${answer.likes}명`}
        >
          <ThumbsUp size={13} />
          <span>도움이 됐어요 {answer.likes}</span>
        </button>
        {answer.opinionFee && (
          <span className="text-xs text-primary-600 font-medium">{answer.opinionFee}</span>
        )}
      </div>
    </div>
  )
}

function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
          <User size={18} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-neutral-800">{lawyer.name}</span>
            <BadgeCheck size={14} className="text-primary-500" />
          </div>
          <p className="text-xs text-neutral-500">{lawyer.firm}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={lawyer.rating} />
            <span className="text-xs text-neutral-400">({lawyer.reviewCount}건)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {lawyer.specialties.map((s) => (
          <Badge key={s} variant="primary" className="text-xs">{s}</Badge>
        ))}
      </div>

      <div className="bg-neutral-50 rounded-lg p-3 mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 flex items-center gap-1">
            <Phone size={11} />
            상담
          </span>
          <span className="font-semibold text-neutral-800">{lawyer.consultFee}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 flex items-center gap-1">
            <FileSignature size={11} />
            의견서
          </span>
          <span className="font-semibold text-neutral-800">{lawyer.opinionFee}</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        aria-label={`${lawyer.name} 변호사 의견서 요청`}
      >
        의견서 요청
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function QnaPage() {
  const [activeCategory, setActiveCategory] = useState<QnaCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [answerDraft, setAnswerDraft] = useState('')

  const filteredItems = useMemo(() => {
    return QNA_DATA.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [activeCategory, searchQuery])

  const selectedItem = selectedId ? QNA_DATA.find((q) => q.id === selectedId) ?? null : null

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-5 shrink-0">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 rounded-lg bg-warning-100">
            <MessageCircle size={22} className="text-warning-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Q&A 게시판</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              전문가와 함께하는 부동산 정비 Q&A
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              placeholder="질문 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Q&A 검색"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="카테고리 필터">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeCategory === tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body — 3-column layout */}
      <div className="flex-1 overflow-hidden flex">

        {/* Left: Q&A list */}
        <aside
          className={`flex flex-col border-r border-neutral-200 bg-white overflow-y-auto ${
            selectedItem ? 'hidden lg:flex lg:w-80 xl:w-96 shrink-0' : 'w-full lg:w-80 xl:w-96 shrink-0'
          }`}
          aria-label="Q&A 목록"
        >
          <div className="p-4 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <MessageCircle size={40} className="mx-auto mb-3 text-neutral-300" strokeWidth={1} />
                <p className="text-sm font-medium text-neutral-500">질문이 없습니다</p>
                <p className="text-xs text-neutral-400 mt-1">다른 키워드로 검색해 보세요</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <QnaListCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Center: Q&A detail */}
        {selectedItem ? (
          <main
            className="flex-1 flex flex-col overflow-hidden bg-white"
            aria-label="질문 상세"
          >
            {/* Detail header */}
            <div className="border-b border-neutral-100 px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-3 lg:hidden"
                aria-label="목록으로 돌아가기"
              >
                <ChevronLeft size={15} />
                목록으로
              </button>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={CATEGORY_CONFIG[selectedItem.category].variant}>
                  {CATEGORY_CONFIG[selectedItem.category].label}
                </Badge>
                {selectedItem.resolved && (
                  <Badge variant="success">
                    <CheckCircle2 size={10} />
                    해결됨
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">{selectedItem.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {selectedItem.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {selectedItem.date}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  조회 {selectedItem.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  답변 {selectedItem.answers.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Question content */}
              <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-5">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {selectedItem.content}
                </p>
              </div>

              {/* Answers */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                  답변 {selectedItem.answers.length}개
                </h3>
                <div className="space-y-3">
                  {selectedItem.answers.map((answer) => (
                    <AnswerCard key={answer.id} answer={answer} />
                  ))}
                </div>
              </div>

              {/* Answer form */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <MessageCircle size={14} className="text-primary-500" />
                  답변하기
                </h3>
                <textarea
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  aria-label="답변 입력"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    disabled={!answerDraft.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="답변 등록"
                  >
                    <Send size={14} />
                    답변 등록
                  </button>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-white text-center p-12">
            <MessageCircle size={48} className="text-neutral-300 mb-4" strokeWidth={1} />
            <p className="text-base font-medium text-neutral-500">질문을 선택하세요</p>
            <p className="text-sm text-neutral-400 mt-1">
              좌측 목록에서 질문을 클릭하면 상세 내용을 확인할 수 있습니다
            </p>
          </div>
        )}

        {/* Right: Lawyer sidebar */}
        <aside
          className="hidden xl:flex xl:w-72 shrink-0 flex-col border-l border-neutral-200 bg-neutral-50 overflow-y-auto"
          aria-label="전문가 변호사 목록"
        >
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                <BadgeCheck size={15} className="text-primary-500" />
                전문가 답변
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                검증된 변호사에게 법률 의견서를 요청하세요
              </p>
            </div>

            <div className="space-y-4">
              {LAWYERS.map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>

            <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-xs text-primary-700">
                법률 의견서는 법적 효력이 있는 전문가 의견으로,
                분쟁 및 계약 시 활용할 수 있습니다.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

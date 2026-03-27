'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Building2,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type ProjectType = 'redevelopment' | 'reconstruction' | 'small_scale' | 'moa'
type ProgressStage =
  | '기본계획 수립'
  | '정비구역 지정'
  | '추진위원회 구성'
  | '조합설립인가'
  | '사업시행계획인가'
  | '관리처분계획인가'
  | '이주 및 철거'
  | '착공 및 시공'
  | '준공인가'
  | '이전고시 및 청산'

interface Case {
  id: string
  name: string
  region: string
  district: string
  projectType: ProjectType
  currentStage: ProgressStage
  startYear: number
  durationMonths: number
  memberCount: number
  areaM2: number
  floors: number
  insight: string
  tags: string[]
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                             */
/* ------------------------------------------------------------------ */

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  redevelopment: '재개발',
  reconstruction: '재건축',
  small_scale: '소규모정비',
  moa: '모아주택',
}

const PROJECT_TYPE_BADGE: Record<ProjectType, 'primary' | 'success' | 'warning' | 'info'> = {
  redevelopment: 'primary',
  reconstruction: 'success',
  small_scale: 'warning',
  moa: 'info',
}

const STAGE_OPTIONS: ProgressStage[] = [
  '기본계획 수립',
  '정비구역 지정',
  '추진위원회 구성',
  '조합설립인가',
  '사업시행계획인가',
  '관리처분계획인가',
  '이주 및 철거',
  '착공 및 시공',
  '준공인가',
  '이전고시 및 청산',
]

const REGION_OPTIONS = ['서울특별시', '경기도', '부산광역시', '인천광역시', '대구광역시', '광주광역시']

const casesData: Case[] = [
  {
    id: '1',
    name: '성동구 XX구역 재개발',
    region: '서울특별시',
    district: '성동구',
    projectType: 'redevelopment',
    currentStage: '사업시행계획인가',
    startYear: 2018,
    durationMonths: 98,
    memberCount: 240,
    areaM2: 45200,
    floors: 35,
    insight: '문화재 지표조사로 사업시행인가 8개월 지연. 이주비 분쟁은 법원 조정으로 해결. 사업시행인가까지 평균 14개월 소요.',
    tags: ['문화재조사지연', '이주비분쟁', '분양가상한제'],
  },
  {
    id: '2',
    name: '마포구 YY구역 재건축',
    region: '서울특별시',
    district: '마포구',
    projectType: 'reconstruction',
    currentStage: '관리처분계획인가',
    startYear: 2015,
    durationMonths: 132,
    memberCount: 185,
    areaM2: 32800,
    floors: 29,
    insight: '안전진단 B등급 판정 후 재심의 없이 통과. 조합설립동의율 82% 달성. 조합장 해임 소송 1건 기각.',
    tags: ['안전진단B등급', '용적률270%', '조합장해임소송기각'],
  },
  {
    id: '3',
    name: '부산 해운대구 ZZ구역 재개발',
    region: '부산광역시',
    district: '해운대구',
    projectType: 'redevelopment',
    currentStage: '조합설립인가',
    startYear: 2021,
    durationMonths: 36,
    memberCount: 310,
    areaM2: 68000,
    floors: 42,
    insight: '조합설립인가 동의율 77.3% (토지면적 기준). 주민대표회의 구성 후 추진위 전환에 8개월.',
    tags: ['항만배후지역', '높이제한완화'],
  },
  {
    id: '4',
    name: '인천 연수구 AA구역 소규모정비',
    region: '인천광역시',
    district: '연수구',
    projectType: 'small_scale',
    currentStage: '준공인가',
    startYear: 2020,
    durationMonths: 60,
    memberCount: 48,
    areaM2: 8400,
    floors: 15,
    insight: '소규모 재개발 특례 적용으로 절차 간소화. 전체 사업기간 5년으로 일반 재개발 대비 45% 단축.',
    tags: ['소규모특례', '빠른인허가'],
  },
  {
    id: '5',
    name: '서울 강남구 BB아파트 재건축',
    region: '서울특별시',
    district: '강남구',
    projectType: 'reconstruction',
    currentStage: '이전고시 및 청산',
    startYear: 2009,
    durationMonths: 204,
    memberCount: 520,
    areaM2: 125000,
    floors: 49,
    insight: '개포지구 종합정비계획 연계. 기부채납 9% 적용, 용적률 인센티브 300% 확보.',
    tags: ['종합정비계획', '기부채납9%', '용적률300%'],
  },
  {
    id: '6',
    name: '서울 은평구 CC구역 모아주택',
    region: '서울특별시',
    district: '은평구',
    projectType: 'moa',
    currentStage: '사업시행계획인가',
    startYear: 2023,
    durationMonths: 18,
    memberCount: 32,
    areaM2: 4200,
    floors: 12,
    insight: '모아주택 1호 사례. 개별 필지 통합 후 공동개발. 사업기간 대폭 단축 예상.',
    tags: ['모아주택1호', '공동개발', '서울시지원'],
  },
]

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors"
        aria-label={`${label} 필터 제거`}
      >
        <X size={9} />
      </button>
    </span>
  )
}

function CaseCard({ c, onClick }: { c: Case; onClick: () => void }) {
  const durationYears = Math.floor(c.durationMonths / 12)
  const durationRemMonths = c.durationMonths % 12

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-neutral-200 p-5 hover:border-primary-300 hover:shadow-md transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary-600"
      aria-label={`${c.name} 사례 상세 보기`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant={PROJECT_TYPE_BADGE[c.projectType]}>
              {PROJECT_TYPE_LABELS[c.projectType]}
            </Badge>
            <Badge variant="neutral">{c.currentStage}</Badge>
          </div>
          <h3 className="text-base font-bold text-neutral-900 mt-1.5">{c.name}</h3>
        </div>
        <ChevronRight size={18} className="text-neutral-400 shrink-0 mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin size={12} className="shrink-0" strokeWidth={1.5} />
          {c.region.replace('특별시', '').replace('광역시', '')} {c.district}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Users size={12} className="shrink-0" strokeWidth={1.5} />
          조합원 {c.memberCount.toLocaleString()}세대
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Clock size={12} className="shrink-0" strokeWidth={1.5} />
          사업기간 {durationYears}년{durationRemMonths > 0 ? ` ${durationRemMonths}개월` : ''}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Building2 size={12} className="shrink-0" strokeWidth={1.5} />
          {c.floors}층 / {(c.areaM2 / 1000).toFixed(1)}천m²
        </div>
      </div>

      <p className="text-xs text-primary-700 bg-primary-50 px-3 py-2 rounded-lg leading-relaxed mb-3">
        {c.insight}
      </p>

      {c.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {c.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-500 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

interface CaseDetailPanelProps {
  c: Case
  onClose: () => void
}

function CaseDetailPanel({ c, onClose }: CaseDetailPanelProps) {
  const durationYears = Math.floor(c.durationMonths / 12)
  const durationRemMonths = c.durationMonths % 12

  return (
    <aside
      className="w-[380px] shrink-0 bg-white border-l border-neutral-200 flex flex-col overflow-hidden"
      role="complementary"
      aria-label={`${c.name} 상세 정보`}
    >
      <div className="flex items-start justify-between p-5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={PROJECT_TYPE_BADGE[c.projectType]}>
              {PROJECT_TYPE_LABELS[c.projectType]}
            </Badge>
          </div>
          <h2 className="font-bold text-neutral-900 text-base">{c.name}</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {c.region} {c.district}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="패널 닫기"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '현재 단계', value: c.currentStage },
            { label: '사업 시작', value: `${c.startYear}년` },
            { label: '진행 기간', value: `${durationYears}년${durationRemMonths > 0 ? ` ${durationRemMonths}개월` : ''}` },
            { label: '조합원', value: `${c.memberCount.toLocaleString()}세대` },
            { label: '대지 면적', value: `${(c.areaM2 / 1000).toFixed(1)}천m²` },
            { label: '최고 층수', value: `${c.floors}층` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-neutral-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            핵심 인사이트
          </h3>
          <p className="text-sm text-primary-700 bg-primary-50 px-3 py-3 rounded-lg leading-relaxed">
            {c.insight}
          </p>
        </div>

        {/* Tags */}
        {c.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              특이 사항
            </h3>
            <div className="flex flex-wrap gap-2">
              {c.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs bg-neutral-100 text-neutral-600 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similar stages */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            절차 단계 현황
          </h3>
          <ol className="space-y-1" aria-label="절차 단계 목록">
            {STAGE_OPTIONS.map((stage) => {
              const stageIndex = STAGE_OPTIONS.indexOf(stage)
              const currentIndex = STAGE_OPTIONS.indexOf(c.currentStage)
              const isDone = stageIndex < currentIndex
              const isCurrent = stageIndex === currentIndex
              return (
                <li
                  key={stage}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${
                    isCurrent
                      ? 'bg-primary-50 font-semibold text-primary-800'
                      : isDone
                      ? 'text-success-700'
                      : 'text-neutral-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isCurrent ? 'bg-primary-600' : isDone ? 'bg-success-500' : 'bg-neutral-200'
                    }`}
                    aria-hidden
                  />
                  {stage}
                  {isCurrent && (
                    <Badge variant="primary" className="ml-auto">현재</Badge>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-100 flex gap-2">
        <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          <BookOpen size={14} strokeWidth={1.5} />
          관련 법령
        </button>
        <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
          <ExternalLink size={14} strokeWidth={1.5} />
          내 사업에 적용
        </button>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ProjectType | ''>('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedStage, setSelectedStage] = useState<ProgressStage | ''>('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  const activeFilters: { label: string; clear: () => void }[] = []
  if (selectedType) activeFilters.push({ label: PROJECT_TYPE_LABELS[selectedType], clear: () => setSelectedType('') })
  if (selectedRegion) activeFilters.push({ label: selectedRegion.replace('특별시', '').replace('광역시', '').replace('도', ''), clear: () => setSelectedRegion('') })
  if (selectedStage) activeFilters.push({ label: selectedStage, clear: () => setSelectedStage('') })

  const filteredCases = useMemo(() => {
    return casesData.filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.insight.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        if (!matches) return false
      }
      if (selectedType && c.projectType !== selectedType) return false
      if (selectedRegion && !c.region.includes(selectedRegion.replace('특별시', '').replace('광역시', '').replace('도', ''))) return false
      if (selectedStage && c.currentStage !== selectedStage) return false
      return true
    })
  }, [searchQuery, selectedType, selectedRegion, selectedStage])

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 6rem)' }}>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">사례 검색</h1>
            <span className="text-sm text-neutral-400">{filteredCases.length}건</span>
          </div>

          {/* Search + Filter toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                strokeWidth={1.5}
              />
              <input
                type="search"
                placeholder="사례명, 지역, 태그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                aria-label="사례 검색"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || activeFilters.length > 0
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={15} strokeWidth={1.5} />
              필터{activeFilters.length > 0 && ` (${activeFilters.length})`}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">사업 유형</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ProjectType | '')}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  aria-label="사업 유형 필터"
                >
                  <option value="">전체</option>
                  {(Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">지역</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  aria-label="지역 필터"
                >
                  <option value="">전체</option>
                  {REGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">현재 단계</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value as ProgressStage | '')}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  aria-label="절차 단계 필터"
                >
                  <option value="">전체</option>
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-neutral-400">적용된 필터:</span>
              {activeFilters.map((f) => (
                <FilterBadge key={f.label} label={f.label} onRemove={f.clear} />
              ))}
              <button
                onClick={() => { setSelectedType(''); setSelectedRegion(''); setSelectedStage('') }}
                className="text-xs text-neutral-400 hover:text-neutral-600 underline"
              >
                전체 초기화
              </button>
            </div>
          )}
        </div>

        {/* Case list */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search size={48} className="text-neutral-200 mb-4" strokeWidth={1} />
              <p className="text-base font-medium text-neutral-500">검색 결과가 없습니다</p>
              <p className="text-sm text-neutral-400 mt-1">다른 검색어나 필터를 사용해 보세요</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedType(''); setSelectedRegion(''); setSelectedStage('') }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredCases.map((c) => (
                <CaseCard
                  key={c.id}
                  c={c}
                  onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedCase && (
        <CaseDetailPanel c={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  )
}

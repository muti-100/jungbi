'use client'

import { useState, useMemo } from 'react'
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Ruler,
  CalendarDays,
  HardHat,
  Database,
} from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

type ProjectType = '재개발' | '재건축' | '소규모정비' | '모아주택'
type ProjectStage = '준비위' | '추진위' | '조합설립' | '사업시행' | '관리처분' | '착공' | '준공'
type ProjectStatus = 'active' | 'completed' | 'preparing'

interface Project {
  id: string
  name: string
  district: string
  type: ProjectType
  stage: ProjectStage
  stageLabel: string
  area: string
  households: number
  unionEstablished: string | null
  constructor: string | null
  status: ProjectStatus
}

interface District {
  name: string
  x: number   // percent from left
  y: number   // percent from top
  projects: number
}

// ── Static data ────────────────────────────────────────────────────────────────

const seoulDistricts: District[] = [
  { name: '도봉구', x: 55, y: 5,  projects: 8  },
  { name: '노원구', x: 70, y: 5,  projects: 12 },
  { name: '강북구', x: 45, y: 15, projects: 6  },
  { name: '성북구', x: 55, y: 20, projects: 9  },
  { name: '중랑구', x: 70, y: 20, projects: 7  },
  { name: '동대문구', x: 60, y: 30, projects: 11 },
  { name: '광진구', x: 72, y: 32, projects: 5  },
  { name: '성동구', x: 58, y: 38, projects: 14 },
  { name: '종로구', x: 45, y: 28, projects: 4  },
  { name: '중구',   x: 50, y: 35, projects: 3  },
  { name: '용산구', x: 45, y: 42, projects: 8  },
  { name: '강남구', x: 62, y: 55, projects: 18 },
  { name: '서초구', x: 50, y: 55, projects: 15 },
  { name: '송파구', x: 75, y: 50, projects: 13 },
  { name: '강동구', x: 82, y: 40, projects: 10 },
  { name: '마포구', x: 30, y: 32, projects: 16 },
  { name: '서대문구', x: 35, y: 25, projects: 7 },
  { name: '은평구', x: 30, y: 15, projects: 11 },
  { name: '양천구', x: 18, y: 45, projects: 9  },
  { name: '강서구', x: 8,  y: 40, projects: 6  },
  { name: '구로구', x: 20, y: 55, projects: 8  },
  { name: '금천구', x: 30, y: 60, projects: 5  },
  { name: '영등포구', x: 30, y: 45, projects: 12 },
  { name: '동작구', x: 40, y: 52, projects: 7  },
  { name: '관악구', x: 38, y: 62, projects: 10 },
]

/** Dominant type per district based on demo data (simplified) */
const districtDominantType: Record<string, 'redevelop' | 'rebuild' | 'mixed'> = {
  '강남구': 'rebuild', '서초구': 'rebuild', '송파구': 'rebuild', '강동구': 'rebuild',
  '용산구': 'redevelop', '마포구': 'redevelop', '성동구': 'redevelop',
  '동작구': 'redevelop', '관악구': 'redevelop',
}
function dominantColor(name: string) {
  const t = districtDominantType[name]
  if (t === 'rebuild')   return { bg: 'bg-info-600',    hover: 'hover:bg-info-500',    text: 'text-white' }
  if (t === 'redevelop') return { bg: 'bg-primary-600', hover: 'hover:bg-primary-500', text: 'text-white' }
  return                        { bg: 'bg-warning-500', hover: 'hover:bg-warning-400', text: 'text-white' }
}

const demoProjects: Project[] = [
  {
    id: '1',
    name: '한남3구역',
    district: '용산구',
    type: '재개발',
    stage: '관리처분',
    stageLabel: '관리처분계획인가',
    area: '109,520㎡',
    households: 5816,
    unionEstablished: '2019-08-15',
    constructor: '현대건설 컨소시엄',
    status: 'active',
  },
  {
    id: '2',
    name: '둔촌주공',
    district: '강동구',
    type: '재건축',
    stage: '착공',
    stageLabel: '착공 및 시공',
    area: '569,842㎡',
    households: 12100,
    unionEstablished: '2015-02-10',
    constructor: 'HDC현대산업개발 컨소시엄',
    status: 'active',
  },
  {
    id: '3',
    name: '신반포3차',
    district: '서초구',
    type: '재건축',
    stage: '추진위',
    stageLabel: '추진위원회 승인',
    area: '42,800㎡',
    households: 1490,
    unionEstablished: null,
    constructor: null,
    status: 'active',
  },
  {
    id: '4',
    name: '왕십리뉴타운 4구역',
    district: '성동구',
    type: '재개발',
    stage: '준공',
    stageLabel: '준공인가',
    area: '68,200㎡',
    households: 2847,
    unionEstablished: '2012-04-20',
    constructor: '대림산업',
    status: 'completed',
  },
  {
    id: '5',
    name: '흑석3구역',
    district: '동작구',
    type: '재개발',
    stage: '사업시행',
    stageLabel: '사업시행계획인가',
    area: '95,100㎡',
    households: 3200,
    unionEstablished: '2020-01-15',
    constructor: '롯데건설',
    status: 'active',
  },
  {
    id: '6',
    name: '개포주공1단지',
    district: '강남구',
    type: '재건축',
    stage: '착공',
    stageLabel: '착공 및 시공',
    area: '370,000㎡',
    households: 6800,
    unionEstablished: '2016-09-05',
    constructor: '삼성물산·현대건설',
    status: 'active',
  },
  {
    id: '7',
    name: '마포로5구역',
    district: '마포구',
    type: '재개발',
    stage: '조합설립',
    stageLabel: '조합설립인가',
    area: '56,300㎡',
    households: 1890,
    unionEstablished: '2023-07-10',
    constructor: null,
    status: 'active',
  },
  {
    id: '8',
    name: '노원구 상계5동',
    district: '노원구',
    type: '소규모정비',
    stage: '준비위',
    stageLabel: '준비위원회 구성',
    area: '8,500㎡',
    households: 120,
    unionEstablished: null,
    constructor: null,
    status: 'preparing',
  },
]

// ── Badge helpers ──────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<ProjectType, BadgeVariant> = {
  '재개발': 'primary',
  '재건축': 'info',
  '소규모정비': 'success',
  '모아주택': 'warning',
}

const STAGE_BADGE: Record<ProjectStage, BadgeVariant> = {
  '준비위': 'neutral',
  '추진위': 'warning',
  '조합설립': 'primary',
  '사업시행': 'info',
  '관리처분': 'warning',
  '착공': 'success',
  '준공': 'success',
}

// ── Filter bar constants ───────────────────────────────────────────────────────

const TYPE_FILTERS: Array<{ label: string; value: ProjectType | '전체' }> = [
  { label: '전체', value: '전체' },
  { label: '재개발', value: '재개발' },
  { label: '재건축', value: '재건축' },
  { label: '소규모정비', value: '소규모정비' },
  { label: '모아주택', value: '모아주택' },
]

const STAGE_FILTERS: Array<{ label: string; value: ProjectStage | '전체 단계' }> = [
  { label: '전체 단계', value: '전체 단계' },
  { label: '준비위', value: '준비위' },
  { label: '추진위', value: '추진위' },
  { label: '조합설립', value: '조합설립' },
  { label: '사업시행', value: '사업시행' },
  { label: '관리처분', value: '관리처분' },
  { label: '착공', value: '착공' },
  { label: '준공', value: '준공' },
]

// ── Project card ───────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      className={cn(
        'bg-white rounded-lg border shadow-sm overflow-hidden transition-shadow hover:shadow-md',
        project.status === 'completed' ? 'border-success-200' : 'border-neutral-200'
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge variant={TYPE_BADGE[project.type]}>{project.type}</Badge>
              <Badge variant={STAGE_BADGE[project.stage]}>{project.stage}</Badge>
              {project.status === 'completed' && (
                <Badge variant="success">완료</Badge>
              )}
            </div>
            <p className="font-semibold text-neutral-800 truncate">{project.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{project.district} · {project.stageLabel}</p>
          </div>
          {expanded
            ? <ChevronUp size={16} className="text-neutral-400 mt-1 shrink-0" aria-hidden />
            : <ChevronDown size={16} className="text-neutral-400 mt-1 shrink-0" aria-hidden />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-100 pt-3 space-y-2">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Ruler size={12} className="text-neutral-400 shrink-0" aria-hidden />
              <dt className="text-neutral-500">면적</dt>
              <dd className="font-medium text-neutral-700 ml-auto">{project.area}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-neutral-400 shrink-0" aria-hidden />
              <dt className="text-neutral-500">세대수</dt>
              <dd className="font-medium text-neutral-700 ml-auto">
                {project.households.toLocaleString()}세대
              </dd>
            </div>
            {project.unionEstablished && (
              <div className="flex items-center gap-1.5 col-span-2">
                <CalendarDays size={12} className="text-neutral-400 shrink-0" aria-hidden />
                <dt className="text-neutral-500">조합설립</dt>
                <dd className="font-medium text-neutral-700 ml-1">{project.unionEstablished}</dd>
              </div>
            )}
            {project.constructor && (
              <div className="flex items-start gap-1.5 col-span-2">
                <HardHat size={12} className="text-neutral-400 shrink-0 mt-0.5" aria-hidden />
                <dt className="text-neutral-500 shrink-0">시공사</dt>
                <dd className="font-medium text-neutral-700 ml-1 break-words">{project.constructor}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </article>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ZoneMapPage() {
  const [typeFilter, setTypeFilter] = useState<ProjectType | '전체'>('전체')
  const [stageFilter, setStageFilter] = useState<ProjectStage | '전체 단계'>('전체 단계')
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return demoProjects.filter((p) => {
      if (typeFilter !== '전체' && p.type !== typeFilter) return false
      if (stageFilter !== '전체 단계' && p.stage !== stageFilter) return false
      if (selectedDistrict && p.district !== selectedDistrict) return false
      return true
    })
  }, [typeFilter, stageFilter, selectedDistrict])

  function handleDistrictClick(name: string) {
    setSelectedDistrict((prev) => (prev === name ? null : name))
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page header */}
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">전국 정비구역 현황</h1>
            <p className="mt-1 text-sm text-neutral-500">
              재개발·재건축·소규모정비 사업 현황을 지도에서 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2">
            <Database size={12} aria-hidden />
            출처: 클린업시스템 (cleanup.go.kr), 서울시 정비사업 정보몽땅
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <section aria-label="필터">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Type filters */}
          <div role="group" aria-label="사업 유형 필터" className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value as ProjectType | '전체')}
                aria-pressed={typeFilter === f.value}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  typeFilter === f.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-400 hover:text-primary-600'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-neutral-300 hidden sm:inline" aria-hidden>|</span>

          {/* Stage filters */}
          <div role="group" aria-label="단계 필터" className="flex flex-wrap gap-1.5">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStageFilter(f.value as ProjectStage | '전체 단계')}
                aria-pressed={stageFilter === f.value}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  stageFilter === f.value
                    ? 'bg-neutral-800 text-white border-neutral-800'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500 hover:text-neutral-800'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Region dropdown (decorative) */}
          <div className="ml-auto">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:border-neutral-400 transition-colors"
              aria-label="지역 선택"
            >
              서울특별시
              <ChevronDown size={12} aria-hidden />
            </button>
          </div>
        </div>
      </section>

      {/* Map + List */}
      <section aria-labelledby="map-section-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <h2 id="map-section-heading" className="sr-only">정비구역 지도 및 목록</h2>

        {/* Left: Map */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-neutral-700">서울특별시 정비구역 분포</p>
              {selectedDistrict && (
                <button
                  type="button"
                  onClick={() => setSelectedDistrict(null)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  선택 해제 ({selectedDistrict})
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary-600 inline-block" aria-hidden />
                재개발 중심
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-info-600 inline-block" aria-hidden />
                재건축 중심
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-warning-500 inline-block" aria-hidden />
                혼합
              </div>
              <div className="flex items-center gap-1.5 ml-auto text-neutral-400">
                버블 크기 = 사업 건수
              </div>
            </div>

            {/* Map container */}
            <div
              role="application"
              aria-label="서울시 구별 정비구역 현황 지도"
              className="relative w-full bg-gradient-to-br from-neutral-50 to-blue-50 rounded-lg border border-neutral-200 overflow-hidden"
              style={{ paddingBottom: '75%' }}
            >
              {/* Background grid lines */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                aria-hidden
              >
                <defs>
                  <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse" x="0" y="0">
                    <path d="M 0 0 L 100 0 M 0 0 L 0 100" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Han River indicator */}
              <div
                className="absolute rounded-full bg-blue-200/70 border border-blue-300"
                style={{ left: '20%', top: '44%', width: '62%', height: '8%', transform: 'rotate(-3deg)' }}
                aria-label="한강"
              />
              <span className="absolute text-[10px] text-blue-500 font-medium" style={{ left: '46%', top: '45%' }}>
                한강
              </span>

              {/* District bubbles */}
              {seoulDistricts.map((d) => {
                const size = Math.max(28, Math.min(56, 20 + d.projects * 2))
                const colors = dominantColor(d.name)
                const isSelected = selectedDistrict === d.name
                const isHovered = hoveredDistrict === d.name

                return (
                  <div
                    key={d.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`${d.name}: 정비사업 ${d.projects}건`}
                    aria-pressed={isSelected}
                    onClick={() => handleDistrictClick(d.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleDistrictClick(d.name)
                      }
                    }}
                    onMouseEnter={() => setHoveredDistrict(d.name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onFocus={() => setHoveredDistrict(d.name)}
                    onBlur={() => setHoveredDistrict(null)}
                    className={cn(
                      'absolute flex items-center justify-center rounded-full cursor-pointer transition-all duration-150',
                      colors.bg,
                      colors.hover,
                      colors.text,
                      isSelected && 'ring-4 ring-white ring-offset-1 scale-110 shadow-lg',
                      !isSelected && (isHovered ? 'scale-110 shadow-md' : 'shadow-sm')
                    )}
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      width: size,
                      height: size,
                      transform: `translate(-50%, -50%) ${isSelected || isHovered ? 'scale(1.1)' : ''}`,
                    }}
                  >
                    <span className="text-[9px] font-bold leading-tight text-center px-0.5">
                      {d.projects}
                    </span>

                    {/* Tooltip */}
                    {(isHovered || isSelected) && (
                      <div
                        className="absolute z-20 bg-neutral-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap pointer-events-none shadow-lg"
                        style={{ bottom: '110%', left: '50%', transform: 'translateX(-50%)' }}
                        role="tooltip"
                      >
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-neutral-300">정비사업 {d.projects}건</p>
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"
                          aria-hidden
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* District name labels (small, below bubble) */}
              {seoulDistricts.map((d) => (
                <span
                  key={d.name + '-label'}
                  className="absolute text-[8px] text-neutral-500 font-medium text-center pointer-events-none leading-tight"
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    transform: 'translate(-50%, 22px)',
                    width: 52,
                    marginLeft: -26,
                  }}
                  aria-hidden
                >
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Project list */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm h-full flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-800 text-sm">
                {selectedDistrict ? `${selectedDistrict}` : '전체'} 정비사업 현황
                <span className="ml-1.5 text-neutral-500 font-normal">
                  (총 {filteredProjects.length}건)
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 520 }}>
              {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin size={32} className="text-neutral-300 mb-3" aria-hidden />
                  <p className="text-sm text-neutral-500 font-medium">해당 조건의 사업이 없습니다</p>
                  <p className="text-xs text-neutral-400 mt-1">필터를 변경하거나 구역 선택을 해제하세요</p>
                </div>
              ) : (
                filteredProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KPI summary */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="text-base font-semibold text-neutral-700 mb-3">
          전국 정비사업 현황 요약
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Building2}
            label="전체 정비구역"
            value="287건"
            description="전국 재개발·재건축·소규모정비 합계"
          />
          <KpiCard
            icon={Building2}
            label="재개발"
            value="142건"
            description="전체 중 49.5%"
            positive
          />
          <KpiCard
            icon={Building2}
            label="재건축"
            value="98건"
            description="전체 중 34.1%"
          />
          <KpiCard
            icon={Building2}
            label="소규모정비·모아주택"
            value="47건"
            description="전체 중 16.4%"
          />
        </div>
      </section>

      {/* Data source notice */}
      <section aria-labelledby="datasource-heading">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <h2
            id="datasource-heading"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-3"
          >
            <Database size={14} aria-hidden />
            데이터 출처
          </h2>
          <ul className="space-y-1 text-xs text-neutral-500">
            <li className="flex items-start gap-2">
              <span aria-hidden className="text-neutral-400 mt-0.5">·</span>
              서울시 정비사업 정보몽땅{' '}
              <a
                href="https://cleanup.seoul.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                cleanup.seoul.go.kr
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden className="text-neutral-400 mt-0.5">·</span>
              국토교통부 클린업시스템{' '}
              <a
                href="https://www.cleanup.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                www.cleanup.go.kr
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden className="text-neutral-400 mt-0.5">·</span>
              각 시·도 자치법규정보시스템
            </li>
          </ul>
          <p className="text-xs text-neutral-400 mt-3 border-t border-neutral-200 pt-2">
            최종 업데이트: 2026-03-27
          </p>
        </div>
      </section>
    </main>
  )
}

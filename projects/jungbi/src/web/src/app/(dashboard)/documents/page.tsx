'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  FileText,
  Download,
  CheckCircle2,
  Circle,
  ChevronRight,
  Info,
  Scale,
  Building2,
  FileCheck,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

// ── Types ──────────────────────────────────────────────────────────────────────

interface StageDocument {
  id: string
  name: string
  description: string
  required: boolean
  format: string
  agency: string
  legalBasis?: string
  template?: boolean
}

interface Stage {
  id: string
  name: string
  fullName: string
  iconName: string
  documents: StageDocument[]
}

// ── Data ───────────────────────────────────────────────────────────────────────

const STAGES: Stage[] = [
  {
    id: 'prep',
    name: '준비위/추진위',
    fullName: '추진위원회 구성 및 승인',
    iconName: 'ClipboardList',
    documents: [
      { id: 'p1', name: '추진위원회 구성 동의서', description: '토지등소유자 과반수 동의', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제31조', template: true },
      { id: 'p2', name: '추진위원장 선임 동의서', description: '위원장 포함 5인 이상 추진위원 선임', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제31조', template: true },
      { id: 'p3', name: '추진위원회 운영규정', description: '추진위 운영에 관한 규정', required: true, format: 'HWP', agency: '시장·군수', template: true },
      { id: 'p4', name: '토지등소유자 명부', description: '정비구역 내 전체 토지·건물 소유자 목록', required: true, format: 'Excel', agency: '시장·군수', template: true },
      { id: 'p5', name: '토지·건물 등기사항증명서', description: '각 필지별 등기부등본', required: true, format: 'PDF', agency: '법원 등기소' },
      { id: 'p6', name: '정비구역 지정 공람 공고문', description: '주민 공람 14일 이상', required: false, format: 'HWP', agency: '시장·군수' },
    ],
  },
  {
    id: 'union',
    name: '조합설립',
    fullName: '조합설립인가',
    iconName: 'Building2',
    documents: [
      { id: 'u1', name: '조합설립인가 신청서', description: '조합 설립을 위한 공식 신청', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제35조', template: true },
      { id: 'u2', name: '정관', description: '조합 운영의 기본 규약', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제40조', template: true },
      { id: 'u3', name: '조합원 명부', description: '토지등소유자 및 동의 현황', required: true, format: 'Excel', agency: '시장·군수', template: true },
      { id: 'u4', name: '동의서 (토지등소유자 3/4 이상)', description: '토지면적 1/2 이상 소유자 동의', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제35조', template: true },
      { id: 'u5', name: '사업비 개략 추산서', description: '정비사업에 필요한 비용 추산', required: true, format: 'Excel', agency: '시장·군수', template: true },
      { id: 'u6', name: '조합 임원 선임 동의서', description: '조합장, 이사, 감사 선임', required: true, format: 'HWP', agency: '시장·군수', template: true },
      { id: 'u7', name: '창립총회 의사록', description: '조합 설립을 위한 창립총회 기록', required: true, format: 'HWP', agency: '내부 보관' },
      { id: 'u8', name: '인감증명서 (조합장)', description: '조합장 인감 등록', required: true, format: 'PDF', agency: '시·구청' },
    ],
  },
  {
    id: 'implementation',
    name: '사업시행인가',
    fullName: '사업시행계획인가',
    iconName: 'FileCheck',
    documents: [
      { id: 'i1', name: '사업시행계획서', description: '정비사업의 시행에 관한 계획서', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제50조', template: true },
      { id: 'i2', name: '설계도서', description: '건축 설계 도면 일체', required: true, format: 'CAD/PDF', agency: '시장·군수' },
      { id: 'i3', name: '환경영향평가서', description: '사업으로 인한 환경 영향 평가', required: true, format: 'PDF', agency: '환경부/시·도' },
      { id: 'i4', name: '교통영향평가서', description: '교통에 미치는 영향 분석', required: true, format: 'PDF', agency: '국토교통부/시·도' },
      { id: 'i5', name: '토지·건물 조서', description: '정비구역 내 모든 토지·건물 현황', required: true, format: 'Excel', agency: '시장·군수', template: true },
      { id: 'i6', name: '정비기반시설 설치계획서', description: '도로, 상하수도 등 기반시설 계획', required: true, format: 'HWP', agency: '시장·군수' },
      { id: 'i7', name: '총회 의결서 (사업시행계획)', description: '조합원 2/3 이상 찬성 의결', required: true, format: 'HWP', agency: '내부 보관', legalBasis: '도시정비법 제45조' },
      { id: 'i8', name: '시공사 선정 관련 서류', description: '입찰 결과, 계약서 등', required: false, format: 'PDF', agency: '내부 보관' },
    ],
  },
  {
    id: 'disposal',
    name: '관리처분인가',
    fullName: '관리처분계획인가',
    iconName: 'Scale',
    documents: [
      { id: 'd1', name: '관리처분계획서', description: '분양설계, 권리가액 등 종합 계획', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제74조', template: true },
      { id: 'd2', name: '감정평가서 (2인 이상)', description: '종전자산 감정평가 (감정평가법인 2곳)', required: true, format: 'PDF', agency: '시장·군수', legalBasis: '도시정비법 제74조 제4항' },
      { id: 'd3', name: '분양신청서 및 결과', description: '조합원 분양신청 현황 (30~60일)', required: true, format: 'Excel', agency: '시장·군수', legalBasis: '도시정비법 제72조', template: true },
      { id: 'd4', name: '세입자 손실보상 계획서', description: '세입자 주거이전비, 이사비 등', required: true, format: 'HWP', agency: '시장·군수' },
      { id: 'd5', name: '총회 의결서 (관리처분계획)', description: '조합원 2/3 이상 찬성 의결', required: true, format: 'HWP', agency: '내부 보관', legalBasis: '도시정비법 제45조' },
      { id: 'd6', name: '권리변환계획서', description: '종전 권리와 종후 권리 대응 관계', required: true, format: 'Excel', agency: '시장·군수', template: true },
      { id: 'd7', name: '일반분양 계획서', description: '일반분양 세대수, 면적, 가격 계획', required: false, format: 'HWP', agency: '시장·군수' },
    ],
  },
  {
    id: 'construction',
    name: '착공',
    fullName: '착공 및 시공',
    iconName: 'Building2',
    documents: [
      { id: 'c1', name: '착공신고서', description: '건축 착공 신고', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '건축법 제21조' },
      { id: 'c2', name: '건축허가서', description: '건축물 건축 허가', required: true, format: 'PDF', agency: '시장·군수' },
      { id: 'c3', name: '시공계약서', description: '시공사와의 공사도급계약', required: true, format: 'PDF', agency: '내부 보관' },
      { id: 'c4', name: '이주완료 확인서', description: '기존 거주자 이주 완료 확인', required: true, format: 'HWP', agency: '시장·군수' },
      { id: 'c5', name: '철거허가서', description: '기존 건축물 철거 허가', required: true, format: 'PDF', agency: '시장·군수' },
      { id: 'c6', name: '안전관리계획서', description: '시공 중 안전 관리 계획', required: true, format: 'PDF', agency: '시장·군수' },
    ],
  },
  {
    id: 'completion',
    name: '준공',
    fullName: '준공인가 및 이전고시',
    iconName: 'FileCheck',
    documents: [
      { id: 'f1', name: '준공인가 신청서', description: '건축물 준공 인가 신청', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제83조' },
      { id: 'f2', name: '준공검사 조서', description: '건축물 검사 결과 보고', required: true, format: 'PDF', agency: '시장·군수' },
      { id: 'f3', name: '이전고시 신청서', description: '소유권 이전 등기를 위한 고시 신청', required: true, format: 'HWP', agency: '시장·군수', legalBasis: '도시정비법 제86조' },
      { id: 'f4', name: '청산금 산정 내역서', description: '조합원별 청산금(추가분담금/환급금) 산정', required: true, format: 'Excel', agency: '조합', template: true },
      { id: 'f5', name: '조합 해산 결의서', description: '조합 해산을 위한 총회 의결', required: true, format: 'HWP', agency: '시장·군수' },
      { id: 'f6', name: '하자보수 보증서', description: '시공사 하자보수 보증 확인', required: true, format: 'PDF', agency: '시공사' },
    ],
  },
]

// ── Format badge ───────────────────────────────────────────────────────────────

function FormatBadge({ format }: { format: string }) {
  const upper = format.toUpperCase()
  const classes = upper.startsWith('HWP')
    ? 'bg-blue-100 text-blue-700'
    : upper.startsWith('EXCEL')
    ? 'bg-green-100 text-green-700'
    : upper.startsWith('PDF')
    ? 'bg-red-100 text-red-700'
    : upper.startsWith('CAD')
    ? 'bg-purple-100 text-purple-700'
    : 'bg-neutral-100 text-neutral-600'

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', classes)}>
      {format}
    </span>
  )
}

// ── Stage icon ─────────────────────────────────────────────────────────────────

function StageIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { size, 'aria-hidden': true as const }
  switch (name) {
    case 'Scale':        return <Scale {...props} />
    case 'Building2':    return <Building2 {...props} />
    case 'FileCheck':    return <FileCheck {...props} />
    case 'ClipboardList': return <ClipboardList {...props} />
    default:             return <FileText {...props} />
  }
}

// ── Document row ───────────────────────────────────────────────────────────────

interface DocRowProps {
  doc: StageDocument
  index: number
  onDownload: (name: string) => void
}

function DocRow({ doc, index, onDownload }: DocRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-4 border-b border-neutral-100 last:border-b-0',
        index % 2 === 1 ? 'bg-neutral-50' : 'bg-white'
      )}
    >
      {/* Left: required badge */}
      <div className="shrink-0 pt-0.5">
        {doc.required ? (
          <Badge variant="danger">필수</Badge>
        ) : (
          <Badge variant="neutral">선택</Badge>
        )}
      </div>

      {/* Center: name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {doc.required ? (
            <CheckCircle2 size={14} className="text-success-500 shrink-0" aria-hidden />
          ) : (
            <Circle size={14} className="text-neutral-300 shrink-0" aria-hidden />
          )}
          <span className="font-semibold text-neutral-800 text-base">{doc.name}</span>
          <FormatBadge format={doc.format} />
        </div>

        <p className="text-sm text-neutral-500 mb-2 leading-relaxed">{doc.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
          <span>
            <span className="text-neutral-400">제출처</span>
            {' '}
            <span className="text-neutral-600 font-medium">{doc.agency}</span>
          </span>
          {doc.legalBasis && (
            <span className="flex items-center gap-1">
              <Scale size={11} className="text-primary-400 shrink-0" aria-hidden />
              <span className="text-primary-600 font-medium">{doc.legalBasis}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: download */}
      <div className="shrink-0 self-start sm:self-center">
        {doc.template ? (
          <button
            type="button"
            onClick={() => onDownload(doc.name)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold',
              'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200',
              'transition-colors duration-150 border border-primary-200'
            )}
            aria-label={`${doc.name} 표준양식 다운로드`}
          >
            <Download size={13} aria-hidden />
            다운로드
          </button>
        ) : (
          <span className="text-xs text-neutral-300 px-3 py-1.5 inline-block">—</span>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [activeStageId, setActiveStageId] = useState<string>(STAGES[0].id)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeStage = STAGES.find((s) => s.id === activeStageId) ?? STAGES[0]
  const activeIndex = STAGES.findIndex((s) => s.id === activeStageId)

  const requiredCount = activeStage.documents.filter((d) => d.required).length
  const optionalCount = activeStage.documents.filter((d) => !d.required).length
  const templateCount = activeStage.documents.filter((d) => d.template).length

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const handleDownload = useCallback((name: string) => {
    showToast(`${name} 양식 다운로드가 시작됩니다`)
  }, [showToast])

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-primary-100">
            <FileText size={22} className="text-primary-600" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">절차별 필수 서류</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              정비사업 각 단계에서 필요한 서류를 한눈에 확인하고 표준 양식을 다운로드하세요
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* ── Stage timeline ── */}
        <section aria-label="단계 선택">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 overflow-x-auto">
            <div className="flex items-start gap-1 min-w-max">
              {STAGES.map((stage, idx) => {
                const isActive = stage.id === activeStageId
                const isCompleted = idx < activeIndex

                return (
                  <div key={stage.id} className="flex items-start">
                    {/* Stage pill + label */}
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveStageId(stage.id)}
                        aria-pressed={isActive}
                        aria-label={`${stage.name} 단계 선택`}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200',
                          isActive
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                            : isCompleted
                            ? 'bg-success-100 text-success-700 hover:bg-success-200'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        )}
                      >
                        {stage.name}
                      </button>
                      <span
                        className={cn(
                          'text-[10px] text-center leading-tight max-w-[80px]',
                          isActive ? 'text-primary-600 font-medium' : 'text-neutral-400'
                        )}
                      >
                        {stage.fullName}
                      </span>
                    </div>

                    {/* Arrow connector */}
                    {idx < STAGES.length - 1 && (
                      <div className="flex items-center mt-1.5 mx-0.5">
                        <ChevronRight
                          size={16}
                          aria-hidden
                          className={cn(
                            idx < activeIndex
                              ? 'text-success-400'
                              : 'text-neutral-300'
                          )}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Active stage header + stats ── */}
        <section aria-labelledby="stage-heading">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

            {/* Stage header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 bg-primary-50">
              <div className="p-2 rounded-lg bg-primary-100">
                <StageIcon name={activeStage.iconName} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="stage-heading" className="font-bold text-neutral-900 text-base">
                  {activeStage.fullName}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">{activeStage.name} 단계</p>
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-50 border border-danger-100">
                  <CheckCircle2 size={13} className="text-danger-500" aria-hidden />
                  <span className="text-danger-700 font-semibold">필수 {requiredCount}건</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200">
                  <Circle size={13} className="text-neutral-400" aria-hidden />
                  <span className="text-neutral-600 font-semibold">선택 {optionalCount}건</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-100">
                  <Download size={13} className="text-primary-500" aria-hidden />
                  <span className="text-primary-700 font-semibold">양식 {templateCount}건</span>
                </div>
              </div>
            </div>

            {/* Document list */}
            <div role="list" aria-label={`${activeStage.name} 단계 서류 목록`}>
              {activeStage.documents.map((doc, idx) => (
                <div key={doc.id} role="listitem">
                  <DocRow doc={doc} index={idx} onDownload={handleDownload} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Info card ── */}
        <section aria-label="참고사항">
          <div className="bg-info-50 border border-info-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-info-500 shrink-0 mt-0.5" aria-hidden />
              <div>
                <h3 className="font-semibold text-info-800 text-base mb-2">참고사항</h3>
                <ul className="space-y-1.5 text-sm text-info-700 list-none">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-info-400 shrink-0 mt-1.5" aria-hidden />
                    서류 양식은 시·도별 조례에 따라 다를 수 있습니다
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-info-400 shrink-0 mt-1.5" aria-hidden />
                    최신 양식은 해당 시·군·구 도시계획과에 확인하세요
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-info-400 shrink-0 mt-1.5" aria-hidden />
                    표준양식은 서울특별시 정비사업 운영 매뉴얼 기준입니다
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
            'bg-neutral-900 text-white text-sm font-medium',
            'animate-in fade-in slide-in-from-bottom-2 duration-200'
          )}
        >
          <Download size={15} aria-hidden />
          {toast}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Star,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Proposal {
  id: string
  company: string
  rank: number
  score: number
  totalCost: string
  costPerPyeong: string
  constructionPeriod: string
  generalPartnerContrib: string
  moveInSupport: string
  designHighlight: string
  brandApt: string
  profitRate: string
  financialHealth: string
  warranty: string
  specialConditions: string[]
  risks: string[]
  strengths: string[]
}

// ── Demo data ──────────────────────────────────────────────────────────────────

const proposals: Proposal[] = [
  {
    id: '1',
    company: '대우건설',
    rank: 1,
    score: 92.5,
    totalCost: '4,850억원',
    costPerPyeong: '580만원/평',
    constructionPeriod: '36개월',
    generalPartnerContrib: '3,200만원',
    moveInSupport: '이주비 100% 선지급',
    designHighlight: '49층 랜드마크 타워 + 커뮤니티 3개층',
    brandApt: '푸르지오',
    profitRate: '115%',
    financialHealth: 'A+',
    warranty: '하자보수 10년',
    specialConditions: ['이주비 100% 선지급', '중도금 무이자', '마감재 업그레이드 포함'],
    risks: ['공사비 증액 가능성', '현 시장 대비 공사비 10% 높음'],
    strengths: ['재개발 시공 경험 50건 이상', '서울 내 브랜드 인지도 1위', '커뮤니티 설계 우수'],
  },
  {
    id: '2',
    company: '현대건설',
    rank: 2,
    score: 89.3,
    totalCost: '4,620억원',
    costPerPyeong: '552만원/평',
    constructionPeriod: '38개월',
    generalPartnerContrib: '3,050만원',
    moveInSupport: '이주비 80% 선지급',
    designHighlight: '42층 트윈타워 + 스카이라운지',
    brandApt: '디에이치',
    profitRate: '112%',
    financialHealth: 'AA-',
    warranty: '하자보수 10년',
    specialConditions: ['이주비 80% 선지급', '중도금 50% 무이자', '스마트홈 기본 적용'],
    risks: ['공사기간 38개월로 타사 대비 길음'],
    strengths: ['재무건전성 최상위', '디에이치 브랜드 프리미엄', '스마트홈 기술력'],
  },
  {
    id: '3',
    company: 'GS건설',
    rank: 3,
    score: 86.7,
    totalCost: '4,380억원',
    costPerPyeong: '524만원/평',
    constructionPeriod: '34개월',
    generalPartnerContrib: '2,900만원',
    moveInSupport: '이주비 70% 선지급',
    designHighlight: '38층 3개동 + 테라스하우스',
    brandApt: '자이',
    profitRate: '108%',
    financialHealth: 'A',
    warranty: '하자보수 10년',
    specialConditions: ['최저 공사비', '공사기간 최단', '친환경 인증 목표'],
    risks: ['일반분양 수익률 타사 대비 낮음', '이주비 선지급 비율 낮음'],
    strengths: ['공사비 최저가', '공사기간 최단', '친환경 설계 전문'],
  },
]

// ── Comparison table row definitions ──────────────────────────────────────────

interface RowDef {
  label: string
  getValue: (p: Proposal) => string
  bestFn?: (vals: string[]) => string   // returns the best value string
}

/** Extract leading numeric value for comparison */
function parseLeadingNumber(s: string): number {
  const cleaned = s.replace(/[,억원%개월만원/평]/g, '')
  const m = cleaned.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : NaN
}

const ROW_DEFS: RowDef[] = [
  { label: '브랜드', getValue: (p) => p.brandApt },
  {
    label: '총 공사비',
    getValue: (p) => p.totalCost,
    bestFn: (vals) => vals.reduce((best, v) => parseLeadingNumber(v) < parseLeadingNumber(best) ? v : best),
  },
  {
    label: '평당 공사비',
    getValue: (p) => p.costPerPyeong,
    bestFn: (vals) => vals.reduce((best, v) => parseLeadingNumber(v) < parseLeadingNumber(best) ? v : best),
  },
  {
    label: '공사기간',
    getValue: (p) => p.constructionPeriod,
    bestFn: (vals) => vals.reduce((best, v) => parseLeadingNumber(v) < parseLeadingNumber(best) ? v : best),
  },
  {
    label: '조합원 분담금',
    getValue: (p) => p.generalPartnerContrib,
    bestFn: (vals) => vals.reduce((best, v) => parseLeadingNumber(v) < parseLeadingNumber(best) ? v : best),
  },
  {
    label: '이주비 지원',
    getValue: (p) => p.moveInSupport,
    bestFn: (vals) => vals.reduce((best, v) => parseLeadingNumber(v) > parseLeadingNumber(best) ? v : best),
  },
  {
    label: '수익률',
    getValue: (p) => p.profitRate,
    bestFn: (vals) => vals.reduce((best, v) => parseLeadingNumber(v) > parseLeadingNumber(best) ? v : best),
  },
  {
    label: '재무건전성',
    getValue: (p) => p.financialHealth,
    bestFn: (vals) => {
      const order = ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB']
      return vals.reduce((best, v) => order.indexOf(v) < order.indexOf(best) ? v : best)
    },
  },
  { label: '설계 특징', getValue: (p) => p.designHighlight },
  { label: '하자보수', getValue: (p) => p.warranty },
]

// ── Medal helper ───────────────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉']

// ── Upload area ────────────────────────────────────────────────────────────────

function UploadArea() {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }
  function handleDragLeave() { setIsDragging(false) }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setFileName(file.name)
  }
  function handleClick() {
    document.getElementById('proposal-file-input')?.click()
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  return (
    <section aria-labelledby="upload-heading" className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
      <h2 id="upload-heading" className="text-lg font-semibold text-neutral-800 mb-1">
        제안서 업로드
      </h2>
      <p className="text-sm text-neutral-500 mb-4">
        제안서를 업로드하면 AI가 핵심 항목을 자동 분석합니다
      </p>

      <div
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 영역 — 클릭하거나 파일을 드래그하세요"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex flex-col items-center justify-center gap-3 py-10 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50'
        )}
      >
        <div className={cn(
          'p-3 rounded-full transition-colors',
          isDragging ? 'bg-primary-100' : 'bg-neutral-200'
        )}>
          <Upload size={28} className={isDragging ? 'text-primary-600' : 'text-neutral-500'} aria-hidden />
        </div>
        {fileName ? (
          <div className="flex items-center gap-2 text-success-600 font-medium">
            <CheckCircle2 size={18} aria-hidden />
            <span>{fileName}</span>
          </div>
        ) : (
          <p className="text-sm text-neutral-600 text-center">
            <span className="font-medium text-primary-600">PDF/엑셀 파일</span>을 드래그하거나{' '}
            <span className="font-medium text-primary-600">클릭</span>하여 업로드
          </p>
        )}
        <p className="text-xs text-neutral-400">지원 형식: .pdf, .xlsx, .pptx | 최대 50MB</p>
      </div>

      <input
        id="proposal-file-input"
        type="file"
        accept=".pdf,.xlsx,.pptx"
        className="sr-only"
        aria-hidden
        onChange={handleFileChange}
      />
    </section>
  )
}

// ── Detail card ────────────────────────────────────────────────────────────────

function DetailCard({ proposal }: { proposal: Proposal }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{MEDALS[proposal.rank - 1]}</span>
          <div className="text-left">
            <p className="font-semibold text-neutral-800">{proposal.company}</p>
            <p className="text-xs text-neutral-500">{proposal.brandApt} · 종합 {proposal.score}점</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={18} className="text-neutral-400" aria-hidden />
          : <ChevronDown size={18} className="text-neutral-400" aria-hidden />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-100 pt-4">
          {/* 강점 */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-success-600 uppercase tracking-wide mb-2">
              <ShieldCheck size={14} aria-hidden />
              강점
            </h4>
            <ul className="space-y-1.5">
              {proposal.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* 특별조건 */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-info-600 uppercase tracking-wide mb-2">
              <Star size={14} aria-hidden />
              특별조건
            </h4>
            <ul className="space-y-1.5">
              {proposal.specialConditions.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-info-500 shrink-0" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* 리스크 */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-danger-600 uppercase tracking-wide mb-2">
              <AlertTriangle size={14} aria-hidden />
              리스크
            </h4>
            <ul className="space-y-1.5">
              {proposal.risks.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger-500 shrink-0" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  // Pre-compute best values per row
  const bestValues: Record<string, string> = {}
  ROW_DEFS.forEach((row) => {
    if (row.bestFn) {
      const vals = proposals.map(row.getValue)
      bestValues[row.label] = row.bestFn(vals)
    }
  })

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-bold text-neutral-800">시공사 제안서 분석</h1>
        <p className="mt-1 text-sm text-neutral-500">
          AI가 복수 시공사 제안서를 항목별로 자동 비교·분석합니다
        </p>
      </header>

      {/* Section 1 — Upload */}
      <UploadArea />

      {/* Section 2 — Comparison table */}
      <section aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-lg font-semibold text-neutral-800 mb-4">
          시공사 제안서 비교 분석
        </h2>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm" role="table">
              <thead>
                <tr className="border-b border-neutral-200">
                  {/* Empty corner cell */}
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-neutral-50 px-4 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide w-36 border-r border-neutral-200"
                  >
                    항목
                  </th>

                  {proposals.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className="px-4 py-4 text-center min-w-[180px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{MEDALS[p.rank - 1]}</span>
                        <span className="font-bold text-neutral-800 text-base">{p.company}</span>
                        <span className="text-xs text-neutral-500">종합 {p.score}점</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROW_DEFS.map((row, rowIdx) => {
                  const best = bestValues[row.label]
                  return (
                    <tr
                      key={row.label}
                      className={cn(
                        'border-b border-neutral-100 last:border-0',
                        rowIdx % 2 === 1 ? 'bg-neutral-50/50' : 'bg-white'
                      )}
                    >
                      {/* Row header */}
                      <th
                        scope="row"
                        className="sticky left-0 z-10 px-4 py-3.5 text-left text-xs font-semibold text-neutral-600 border-r border-neutral-200"
                        style={{ background: rowIdx % 2 === 1 ? 'rgb(249 250 251 / 0.5)' : 'white' }}
                      >
                        {row.label}
                      </th>

                      {proposals.map((p) => {
                        const val = row.getValue(p)
                        const isBest = best !== undefined && val === best
                        return (
                          <td
                            key={p.id}
                            className={cn(
                              'px-4 py-3.5 text-center text-sm',
                              isBest ? 'bg-success-50' : ''
                            )}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={cn(
                                'font-medium',
                                isBest ? 'text-success-700' : 'text-neutral-700'
                              )}>
                                {val}
                              </span>
                              {isBest && (
                                <CheckCircle2
                                  size={15}
                                  className="text-success-600 shrink-0"
                                  aria-label="최우수"
                                />
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 2b — Detail cards */}
      <section aria-labelledby="detail-cards-heading">
        <h2 id="detail-cards-heading" className="text-base font-semibold text-neutral-700 mb-3">
          시공사별 상세 정보
        </h2>
        <div className="space-y-3">
          {proposals.map((p) => (
            <DetailCard key={p.id} proposal={p} />
          ))}
        </div>
      </section>

      {/* Section 3 — AI summary */}
      <section aria-labelledby="ai-summary-heading">
        <div className="bg-gradient-to-br from-primary-50 to-info-50 border border-primary-200 rounded-xl p-6">
          <h2
            id="ai-summary-heading"
            className="flex items-center gap-2 text-lg font-bold text-primary-800 mb-4"
          >
            <Sparkles size={20} className="text-primary-600" aria-hidden />
            AI 분석 요약
          </h2>

          <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
            <div className="bg-white/70 rounded-lg p-4">
              <p className="font-semibold text-neutral-800 mb-1">
                <FileText size={14} className="inline mr-1 text-primary-500" aria-hidden />
                종합 평가
              </p>
              <p>
                <strong>대우건설</strong>이 가장 높은 종합점수(92.5점)를 기록했으며, 특히 이주비 100% 선지급과
                115% 수익률이 강점입니다. 다만 공사비가 가장 높아 조합 부담이 클 수 있습니다.
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <p>
                <strong>현대건설</strong>은 재무건전성(AA-)이 가장 우수하며 디에이치 브랜드 프리미엄이
                기대됩니다.
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4">
              <p>
                <strong>GS건설</strong>은 최저 공사비와 최단 공사기간으로 비용 효율성이 높으나,
                일반분양 수익률이 상대적으로 낮아 시장 상황에 따른 리스크가 있습니다.
              </p>
            </div>

            <div className="flex items-start gap-2 bg-warning-50 border border-warning-200 rounded-lg p-4">
              <AlertTriangle size={16} className="text-warning-600 mt-0.5 shrink-0" aria-hidden />
              <p>
                <strong className="text-warning-700">권장:</strong>{' '}
                조합의 우선순위(수익률 vs 공사비 vs 브랜드)에 따라 최종 선정이 필요합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

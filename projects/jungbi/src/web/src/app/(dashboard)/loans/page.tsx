'use client'

import { useState } from 'react'
import {
  Landmark,
  Info,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type RegionKey = 'seoul' | 'metropolitan' | 'regional' | 'speculative' | 'land'

interface LoanRule {
  category: string
  ltv: string
  dti: string
  dsr: string
  limit: string
  note: string
  riskLevel: 'danger' | 'warning' | 'success' | 'neutral'
}

interface RegionData {
  label: string
  description: string
  rules: LoanRule[]
}

interface Benefit {
  title: string
  ltv: string
  limit: string
  conditions: string[]
  law: string
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                             */
/* ------------------------------------------------------------------ */

const REGIONS: Record<RegionKey, RegionData> = {
  seoul: {
    label: '서울',
    description: '투기과열지구 전역 지정 — 전국 최고 수준 규제 적용',
    rules: [
      {
        category: '1주택자 (무주택)',
        ltv: '50%',
        dti: '40%',
        dsr: '40%',
        limit: '5억원',
        note: '생애최초 70% 적용',
        riskLevel: 'warning',
      },
      {
        category: '2주택자',
        ltv: '30%',
        dti: '30%',
        dsr: '40%',
        limit: '-',
        note: '규제지역 내 취득 시 제한',
        riskLevel: 'danger',
      },
      {
        category: '다주택자 (3주택+)',
        ltv: '0%',
        dti: '-',
        dsr: '-',
        limit: '대출 불가',
        note: '투기과열 전면 금지',
        riskLevel: 'danger',
      },
    ],
  },
  metropolitan: {
    label: '수도권',
    description: '조정대상지역 기준 — 서울 외 경기·인천 대부분 지역',
    rules: [
      {
        category: '1주택자 (무주택)',
        ltv: '60%',
        dti: '50%',
        dsr: '40%',
        limit: '6억원',
        note: '생애최초 80% 적용 가능',
        riskLevel: 'warning',
      },
      {
        category: '2주택자',
        ltv: '50%',
        dti: '40%',
        dsr: '40%',
        limit: '-',
        note: '조정대상지역 한도 적용',
        riskLevel: 'warning',
      },
      {
        category: '다주택자 (3주택+)',
        ltv: '30%',
        dti: '30%',
        dsr: '40%',
        limit: '3억원',
        note: '추가 제한 심사 가능',
        riskLevel: 'warning',
      },
    ],
  },
  regional: {
    label: '지방',
    description: '비규제지역 — 상대적으로 완화된 규제 기준',
    rules: [
      {
        category: '1주택자 (무주택)',
        ltv: '70%',
        dti: '60%',
        dsr: '40%',
        limit: '6억원',
        note: '생애최초 80% 적용',
        riskLevel: 'success',
      },
      {
        category: '2주택자',
        ltv: '60%',
        dti: '50%',
        dsr: '40%',
        limit: '-',
        note: '지역별 상이',
        riskLevel: 'warning',
      },
      {
        category: '다주택자 (3주택+)',
        ltv: '60%',
        dti: '50%',
        dsr: '40%',
        limit: '4억원',
        note: '비규제지역 완화 적용',
        riskLevel: 'success',
      },
    ],
  },
  speculative: {
    label: '투기과열지구',
    description: '정부 지정 투기과열지구 — 가장 강력한 규제 적용',
    rules: [
      {
        category: '1주택자 (무주택)',
        ltv: '40%',
        dti: '40%',
        dsr: '40%',
        limit: '4억원',
        note: '생애최초 60% 제한적 적용',
        riskLevel: 'warning',
      },
      {
        category: '2주택자',
        ltv: '0%',
        dti: '-',
        dsr: '-',
        limit: '대출 불가',
        note: '원칙적 전면 금지',
        riskLevel: 'danger',
      },
      {
        category: '다주택자 (3주택+)',
        ltv: '0%',
        dti: '-',
        dsr: '-',
        limit: '대출 불가',
        note: '전면 금지',
        riskLevel: 'danger',
      },
    ],
  },
  land: {
    label: '토지거래허가구역',
    description: '토지거래허가구역 — 별도 허가 + 대출 규제 병행 적용',
    rules: [
      {
        category: '1주택자 (무주택)',
        ltv: '40%',
        dti: '40%',
        dsr: '40%',
        limit: '4억원',
        note: '토지거래허가 취득 후 적용',
        riskLevel: 'warning',
      },
      {
        category: '2주택자',
        ltv: '0%',
        dti: '-',
        dsr: '-',
        limit: '대출 불가',
        note: '허가 거부 대상',
        riskLevel: 'danger',
      },
      {
        category: '다주택자 (3주택+)',
        ltv: '0%',
        dti: '-',
        dsr: '-',
        limit: '대출 불가',
        note: '허가 및 대출 전면 불가',
        riskLevel: 'danger',
      },
    ],
  },
}

const BENEFITS: Benefit[] = [
  {
    title: '생애최초 주택구매',
    ltv: '80%',
    limit: '6억원',
    conditions: ['무주택자', '생애 최초 주택 구매', '소득 기준 충족 필요'],
    law: '주택담보대출비율 규제 고시 제5조',
  },
  {
    title: '신혼부부 특례',
    ltv: '80%',
    limit: '6억원',
    conditions: ['혼인 7년 이내', '무주택 세대', '소득 합산 연 8,500만원 이하'],
    law: '주택도시기금법 제6조',
  },
  {
    title: '서민실수요자',
    ltv: '70%',
    limit: '5억원',
    conditions: ['무주택 세대주', '부부합산 소득 연 9,000만원 이하', '주택가격 9억원 이하'],
    law: '은행업감독규정 제79조의2',
  },
]

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function LtvCellBadge({ value, riskLevel }: { value: string; riskLevel: LoanRule['riskLevel'] }) {
  if (value === '0%' || value === '대출 불가') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-danger-100 text-danger-700">
        {value}
      </span>
    )
  }
  if (riskLevel === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-warning-100 text-warning-700">
        {value}
      </span>
    )
  }
  if (riskLevel === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-success-100 text-success-700">
        {value}
      </span>
    )
  }
  return <span className="text-sm text-neutral-700">{value}</span>
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <div className="bg-success-50 border border-success-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-success-800">{benefit.title}</h3>
        <div className="flex gap-1 shrink-0">
          <Badge variant="success">LTV {benefit.ltv}</Badge>
          <Badge variant="neutral">{benefit.limit}</Badge>
        </div>
      </div>
      <ul className="space-y-1 mb-3">
        {benefit.conditions.map((c) => (
          <li key={c} className="flex items-center gap-1.5 text-xs text-success-700">
            <CheckCircle2 size={12} className="shrink-0 text-success-500" />
            {c}
          </li>
        ))}
      </ul>
      <p className="text-xs text-success-600 flex items-center gap-1">
        <FileText size={11} />
        {benefit.law}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function LoansPage() {
  const [activeRegion, setActiveRegion] = useState<RegionKey>('seoul')

  const regionKeys = Object.keys(REGIONS) as RegionKey[]
  const currentRegion = REGIONS[activeRegion]

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-5 shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary-100">
            <Landmark size={22} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">대출규제 현황</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              주담대 LTV/DTI/DSR 규제 실시간 현황
            </p>
          </div>
        </div>

        {/* Region Tabs */}
        <div
          className="flex flex-wrap gap-2 mt-5"
          role="tablist"
          aria-label="지역 유형 선택"
        >
          {regionKeys.map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeRegion === key}
              onClick={() => setActiveRegion(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeRegion === key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600'
              }`}
            >
              {REGIONS[key].label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col lg:flex-row gap-6 p-6">

          {/* Main Table */}
          <div className="flex-1 min-w-0">
            {/* Region info */}
            <div className="flex items-center gap-2 mb-4">
              <Info size={15} className="text-primary-500 shrink-0" />
              <p className="text-sm text-neutral-600">{currentRegion.description}</p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label={`${currentRegion.label} 대출규제 현황표`}>
                  <caption className="sr-only">
                    {currentRegion.label} 지역 LTV/DTI/DSR 규제 현황
                  </caption>
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">구분</th>
                      <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">LTV</th>
                      <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">DTI</th>
                      <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">DSR</th>
                      <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">대출한도</th>
                      <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRegion.rules.map((rule, idx) => (
                      <tr
                        key={rule.category}
                        className={`border-b border-neutral-100 last:border-0 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-neutral-800 whitespace-nowrap">
                          {rule.category}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <LtvCellBadge value={rule.ltv} riskLevel={rule.riskLevel} />
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-neutral-600">
                          {rule.dti === '-' ? (
                            <span className="text-neutral-400">-</span>
                          ) : (
                            rule.dti
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-neutral-600">
                          {rule.dsr === '-' ? (
                            <span className="text-neutral-400">-</span>
                          ) : (
                            rule.dsr
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {rule.limit === '대출 불가' ? (
                            <Badge variant="danger">대출 불가</Badge>
                          ) : rule.limit === '-' ? (
                            <span className="text-neutral-400 text-sm">-</span>
                          ) : (
                            <span className="text-sm font-medium text-neutral-700">{rule.limit}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-500">{rule.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3" aria-label="색상 범례">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="inline-block w-3 h-3 rounded bg-danger-200" />
                대출 불가 / 전면 금지
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="inline-block w-3 h-3 rounded bg-warning-200" />
                제한적 허용
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="inline-block w-3 h-3 rounded bg-success-200" />
                상대적 완화
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-6 bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={15} className="text-neutral-400" />
                <span className="text-xs text-neutral-500 font-medium">최종 업데이트: 2026-03-27</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 flex items-start gap-1.5">
                  <FileText size={12} className="shrink-0 mt-0.5 text-neutral-400" />
                  <span>
                    <strong className="text-neutral-700">근거 법령:</strong>{' '}
                    주택담보대출비율 규제 고시 (금융위원회 고시),
                    은행업감독규정 (금융감독원)
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a
                    href="https://www.law.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                    aria-label="국가법령정보센터 외부 링크"
                  >
                    <ExternalLink size={11} />
                    국가법령정보센터
                  </a>
                  <a
                    href="https://www.fsc.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                    aria-label="금융위원회 외부 링크"
                  >
                    <ExternalLink size={11} />
                    금융위원회 공식 사이트
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <aside
            className="w-full lg:w-80 shrink-0"
            aria-label="주요 혜택 및 특례"
          >
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 bg-success-50">
                <h2 className="text-sm font-semibold text-success-800 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success-600" />
                  주요 혜택 / 특례 프로그램
                </h2>
                <p className="text-xs text-success-600 mt-0.5">조건 충족 시 우대 LTV 적용</p>
              </div>
              <div className="p-4 space-y-4">
                {BENEFITS.map((b) => (
                  <BenefitCard key={b.title} benefit={b} />
                ))}
              </div>

              {/* Warning notice */}
              <div className="mx-4 mb-4 p-3 rounded-lg bg-warning-50 border border-warning-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-warning-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-700">
                    특례 혜택은 금융기관 심사 기준 및 소득에 따라 실제 적용 여부가 달라질 수 있습니다.
                    반드시 담당 금융기관에 사전 확인하세요.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

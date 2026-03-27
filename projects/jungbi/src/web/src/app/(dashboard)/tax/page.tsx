'use client'

import { useState } from 'react'
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Info,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type TaxTab = 'acquisition' | 'gift' | 'capital' | 'comprehensive' | 'registration'

interface TaxRow {
  category: string
  rate: string
  condition: string
  benefit: string
  highlight?: boolean
}

interface TaxBracket {
  range: string
  rate: string
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                             */
/* ------------------------------------------------------------------ */

const ACQUISITION_ROWS: TaxRow[] = [
  {
    category: '6억 이하 — 1주택',
    rate: '1%',
    condition: '취득가액 6억원 이하',
    benefit: '생애최초 200만원 한도 감면',
    highlight: false,
  },
  {
    category: '6억~9억 — 1주택',
    rate: '1~3%',
    condition: '취득가액 6억~9억원 구간',
    benefit: '구간별 비례 세율 적용',
    highlight: false,
  },
  {
    category: '9억 초과 — 1주택',
    rate: '3%',
    condition: '취득가액 9억원 초과',
    benefit: '-',
    highlight: false,
  },
  {
    category: '2주택 — 조정대상지역',
    rate: '8%',
    condition: '조정대상지역 내 2번째 취득',
    benefit: '생애최초 1주택 전환 시 환급 가능',
    highlight: true,
  },
  {
    category: '3주택 이상',
    rate: '12%',
    condition: '3주택 이상 보유 또는 취득',
    benefit: '-',
    highlight: true,
  },
  {
    category: '법인',
    rate: '12% + 중과',
    condition: '법인 명의 취득 전체',
    benefit: '-',
    highlight: true,
  },
]

const GIFT_BRACKETS: TaxBracket[] = [
  { range: '1억원 이하', rate: '10%' },
  { range: '1억~5억원', rate: '20%' },
  { range: '5억~10억원', rate: '30%' },
  { range: '10억~30억원', rate: '40%' },
  { range: '30억원 초과', rate: '50%' },
]

const CAPITAL_ROWS: TaxRow[] = [
  {
    category: '1세대 1주택 — 비과세',
    rate: '0% (비과세)',
    condition: '12억원 이하, 2년 이상 보유·거주',
    benefit: '12억 초과분만 과세',
    highlight: false,
  },
  {
    category: '1세대 1주택 — 일반',
    rate: '기본세율 6~45%',
    condition: '12억 초과 또는 보유기간 미달',
    benefit: '장기보유 특별공제 최대 80%',
    highlight: false,
  },
  {
    category: '2주택 — 조정대상지역',
    rate: '기본세율 +20%p',
    condition: '조정대상지역 2주택 양도',
    benefit: '-',
    highlight: true,
  },
  {
    category: '3주택 이상 — 조정대상지역',
    rate: '기본세율 +30%p',
    condition: '조정대상지역 3주택 이상 양도',
    benefit: '-',
    highlight: true,
  },
  {
    category: '단기보유 (1년 미만)',
    rate: '70%',
    condition: '보유기간 1년 미만',
    benefit: '-',
    highlight: true,
  },
  {
    category: '단기보유 (2년 미만)',
    rate: '60%',
    condition: '보유기간 1~2년 미만',
    benefit: '-',
    highlight: true,
  },
]

const COMPREHENSIVE_ROWS: TaxRow[] = [
  {
    category: '1세대 1주택',
    rate: '0.5~2.7%',
    condition: '공시가격 합산 12억원 공제 후 과세',
    benefit: '고령자·장기보유 세액공제 최대 80%',
    highlight: false,
  },
  {
    category: '2주택',
    rate: '0.5~5.0%',
    condition: '합산 공시가격 9억원 공제 후 과세',
    benefit: '주택 수에 따라 세율 상향',
    highlight: false,
  },
  {
    category: '3주택 이상',
    rate: '1.2~6.0%',
    condition: '합산 공시가격 9억원 공제 후 과세',
    benefit: '-',
    highlight: true,
  },
  {
    category: '법인',
    rate: '3% (단일)',
    condition: '공제 없이 전액 과세',
    benefit: '-',
    highlight: true,
  },
]

const REGISTRATION_ROWS: TaxRow[] = [
  {
    category: '소유권 이전 (매매)',
    rate: '2%',
    condition: '매매로 인한 소유권 이전',
    benefit: '농어촌특별세·지방교육세 별도',
    highlight: false,
  },
  {
    category: '소유권 보존 (신축)',
    rate: '0.8%',
    condition: '건물 최초 등기',
    benefit: '-',
    highlight: false,
  },
  {
    category: '근저당권 설정',
    rate: '0.2%',
    condition: '저당권 설정 금액 기준',
    benefit: '-',
    highlight: false,
  },
]

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function TaxTable({ rows }: { rows: TaxRow[] }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="세율 안내표">
          <caption className="sr-only">세율 및 조건 안내</caption>
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">구분</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">세율</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">조건</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">혜택/비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.category}
                className={`border-b border-neutral-100 last:border-0 ${
                  row.highlight
                    ? 'bg-danger-50/40'
                    : idx % 2 === 0
                    ? 'bg-white'
                    : 'bg-neutral-50/40'
                }`}
              >
                <td className="px-5 py-4 font-medium text-neutral-800">{row.category}</td>
                <td className="px-4 py-4 text-center">
                  {row.highlight ? (
                    <Badge variant="danger">{row.rate}</Badge>
                  ) : row.rate.includes('비과세') ? (
                    <Badge variant="success">{row.rate}</Badge>
                  ) : (
                    <Badge variant="warning">{row.rate}</Badge>
                  )}
                </td>
                <td className="px-4 py-4 text-neutral-600">{row.condition}</td>
                <td className="px-4 py-4 text-neutral-500">
                  {row.benefit === '-' ? (
                    <span className="text-neutral-300">-</span>
                  ) : (
                    <span className="text-success-600 text-xs">{row.benefit}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BenefitCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-success-50 border border-success-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={15} className="text-success-600 shrink-0" />
        <h3 className="text-sm font-semibold text-success-800">혜택 및 감면</h3>
      </div>
      <div className="text-sm text-success-700 space-y-1.5">{children}</div>
    </div>
  )
}

function CautionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={15} className="text-warning-600 shrink-0" />
        <h3 className="text-sm font-semibold text-warning-800">주의사항</h3>
      </div>
      <div className="text-sm text-warning-700 space-y-1.5">{children}</div>
    </div>
  )
}

function SourceRow({ label, text }: { label: string; text: string }) {
  return (
    <p className="text-xs text-neutral-500 flex items-start gap-1.5">
      <FileText size={12} className="shrink-0 mt-0.5 text-neutral-400" />
      <span>
        <strong className="text-neutral-600">{label}:</strong> {text}
      </span>
    </p>
  )
}

/* ------------------------------------------------------------------ */
/* Tab Content Components                                               */
/* ------------------------------------------------------------------ */

function AcquisitionTab() {
  return (
    <div className="space-y-5">
      <TaxTable rows={ACQUISITION_ROWS} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BenefitCard>
          <p>· 생애최초 구매자: 취득세 200만원 한도 감면</p>
          <p>· 신혼부부: 공시가격 3억원 이하 주택 취득세 50% 감면</p>
          <p>· 공공분양 주택: 취득세 감면 혜택 가능</p>
        </BenefitCard>
        <CautionCard>
          <p>· 조정대상지역 2주택부터 중과세율(8%) 적용</p>
          <p>· 3주택 이상 및 법인은 12% 단일세율</p>
          <p>· 임시특례는 실거주 요건 충족 시에만 유효</p>
        </CautionCard>
      </div>
      <div className="bg-white rounded-xl border border-neutral-100 p-4 space-y-1.5">
        <SourceRow label="근거 법령" text="지방세법 제11조 (취득세), 제13조 (중과)" />
        <SourceRow label="특례 근거" text="지방세특례제한법 제36조의3 (생애최초 주택 취득)" />
      </div>
    </div>
  )
}

function GiftTab() {
  return (
    <div className="space-y-5">
      {/* Deduction summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: '배우자 공제', amount: '6억원', note: '10년 합산 기준' },
          { title: '직계존비속 공제', amount: '5,000만원', note: '미성년자 2,000만원' },
          { title: '기타 친족', amount: '1,000만원', note: '10년 합산 기준' },
        ].map((item) => (
          <div key={item.title} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-neutral-500 mb-1">{item.title}</p>
            <p className="text-2xl font-bold text-primary-700">{item.amount}</p>
            <p className="text-xs text-neutral-400 mt-1">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Bracket table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50">
          <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary-500" />
            누진세율 구간 (공제 후 과세표준 기준)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="증여세 누진세율 구간">
            <caption className="sr-only">증여세 누진 세율 구간별 세율</caption>
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">과세표준</th>
                <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">세율</th>
              </tr>
            </thead>
            <tbody>
              {GIFT_BRACKETS.map((bracket, idx) => (
                <tr
                  key={bracket.range}
                  className={`border-b border-neutral-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'}`}
                >
                  <td className="px-5 py-3 text-neutral-700">{bracket.range}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        bracket.rate === '50%'
                          ? 'danger'
                          : bracket.rate === '40%'
                          ? 'warning'
                          : bracket.rate === '10%'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {bracket.rate}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BenefitCard>
          <p>· 배우자 6억원 공제로 절세 가능</p>
          <p>· 10년 단위 공제 리셋 활용 전략</p>
          <p>· 창업자금 증여 특례: 5억원 10% 단일세율</p>
        </BenefitCard>
        <CautionCard>
          <p>· 10년 합산 과세 — 분산 증여에도 누적 합산</p>
          <p>· 부담부 증여 시 양도세 동시 발생 가능</p>
          <p>· 신고 기한: 증여일이 속한 달의 말일부터 3개월</p>
        </CautionCard>
      </div>

      <div className="bg-white rounded-xl border border-neutral-100 p-4 space-y-1.5">
        <SourceRow label="근거 법령" text="상속세 및 증여세법 제53조 (증여재산 공제), 제56조 (세율)" />
      </div>
    </div>
  )
}

function CapitalTab() {
  return (
    <div className="space-y-5">
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={15} className="text-primary-600 shrink-0 mt-0.5" />
        <p className="text-sm text-primary-700">
          <strong>1세대 1주택 비과세 기준:</strong> 보유기간 2년 이상 + 공시가격 12억원 이하.
          12억 초과분에 대해서만 세율 적용.
        </p>
      </div>
      <TaxTable rows={CAPITAL_ROWS} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BenefitCard>
          <p>· 장기보유특별공제: 3년 이상 보유 시 최대 80%</p>
          <p>· 1주택 비과세: 12억 이하 2년 보유·거주</p>
          <p>· 상생임대인: 임대기간 충족 시 거주기간 인정</p>
        </BenefitCard>
        <CautionCard>
          <p>· 다주택 중과: 조정대상지역 +20~30%p 추가</p>
          <p>· 1년 미만 보유: 70% 단일세율 (주택)</p>
          <p>· 분양권·입주권은 주택 수 산정에 포함 가능</p>
        </CautionCard>
      </div>
      <div className="bg-white rounded-xl border border-neutral-100 p-4 space-y-1.5">
        <SourceRow label="근거 법령" text="소득세법 제89조 (비과세), 제104조 (중과세율)" />
        <SourceRow label="공제 근거" text="소득세법 제95조 (장기보유특별공제)" />
      </div>
    </div>
  )
}

function ComprehensiveTab() {
  return (
    <div className="space-y-5">
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={15} className="text-primary-600 shrink-0 mt-0.5" />
        <p className="text-sm text-primary-700">
          종합부동산세는 매년 6월 1일 기준 주택 공시가격 합산액이 공제금액을 초과하는 경우 부과되며,
          12월에 납부합니다.
        </p>
      </div>
      <TaxTable rows={COMPREHENSIVE_ROWS} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BenefitCard>
          <p>· 1세대 1주택: 최대 80% 세액공제 (고령자 + 장기보유 합산)</p>
          <p>· 고령자 공제: 60세 이상 20%, 65세 이상 30%, 70세 이상 40%</p>
          <p>· 장기보유 공제: 5년 이상 20%, 10년 이상 40%, 15년 이상 50%</p>
        </BenefitCard>
        <CautionCard>
          <p>· 법인 소유 주택: 공제 없이 3% 단일세율</p>
          <p>· 3주택 이상 조정대상지역: 가중 세율 적용</p>
          <p>· 재산세와 합산 시 세 부담 상한 초과분 환급</p>
        </CautionCard>
      </div>
      <div className="bg-white rounded-xl border border-neutral-100 p-4 space-y-1.5">
        <SourceRow label="근거 법령" text="종합부동산세법 제7조 (납세의무자), 제9조 (세율)" />
        <SourceRow label="공제 근거" text="종합부동산세법 제9조의2 (세액공제)" />
      </div>
    </div>
  )
}

function RegistrationTab() {
  return (
    <div className="space-y-5">
      <TaxTable rows={REGISTRATION_ROWS} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BenefitCard>
          <p>· 서민주택 취득: 등록면허세 감면 가능</p>
          <p>· 공공임대주택 사업자: 감면 특례 적용</p>
        </BenefitCard>
        <CautionCard>
          <p>· 농어촌특별세(취득세의 10%)와 지방교육세 별도 납부</p>
          <p>· 등기 지연 시 가산세 발생</p>
        </CautionCard>
      </div>
      <div className="bg-white rounded-xl border border-neutral-100 p-4 space-y-1.5">
        <SourceRow label="근거 법령" text="지방세법 제23조 (등록면허세 납세의무), 제28조 (세율)" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

const TAX_TABS: { key: TaxTab; label: string }[] = [
  { key: 'acquisition', label: '취득세' },
  { key: 'gift', label: '증여세' },
  { key: 'capital', label: '양도소득세' },
  { key: 'comprehensive', label: '종합부동산세' },
  { key: 'registration', label: '등록면허세' },
]

export default function TaxPage() {
  const [activeTab, setActiveTab] = useState<TaxTab>('acquisition')

  function renderTabContent() {
    switch (activeTab) {
      case 'acquisition':
        return <AcquisitionTab />
      case 'gift':
        return <GiftTab />
      case 'capital':
        return <CapitalTab />
      case 'comprehensive':
        return <ComprehensiveTab />
      case 'registration':
        return <RegistrationTab />
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-5 shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-success-100">
            <Receipt size={22} className="text-success-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">부동산 세금 가이드</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              취득세, 증여세, 양도세, 종합부동산세 한눈에 보기
            </p>
          </div>
        </div>

        {/* Tax type tabs */}
        <div
          className="flex flex-wrap gap-2 mt-5"
          role="tablist"
          aria-label="세금 유형 선택"
        >
          {TAX_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tax-panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-success-600 text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-success-400 hover:text-success-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div
        className="flex-1 overflow-auto p-6"
        role="tabpanel"
        id={`tax-panel-${activeTab}`}
        aria-label={TAX_TABS.find((t) => t.key === activeTab)?.label}
      >
        {renderTabContent()}
      </div>
    </div>
  )
}

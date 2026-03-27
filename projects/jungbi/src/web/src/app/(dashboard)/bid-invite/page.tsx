'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import {
  Mail,
  Send,
  FileText,
  Building2,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Download,
  Users,
  Phone,
  AtSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Company {
  id: string
  name: string
  email: string
  contact: string
  phone: string
  speciality: string
  tier: '1군' | '2군'
}

interface TemplateVars {
  조합명: string
  사업명: string
  위치: string
  면적: string
  세대수: string
  사업유형: string
  제출기한: string
  조합이메일: string
  담당자명: string
  담당자연락처: string
  조합장명: string
}

interface SendResult {
  companyId: string
  name: string
  email: string
  contact: string
  time: string
}

// ── Static data ───────────────────────────────────────────────────────────────

const COMPANIES: Company[] = [
  { id: '1',  name: '현대건설',      email: 'bid@hdec.co.kr',          contact: '김영수 부장', phone: '02-746-1234',  speciality: '재개발·재건축',   tier: '1군' },
  { id: '2',  name: '대우건설',      email: 'bid@dwconst.co.kr',       contact: '박민호 차장', phone: '02-2288-3456', speciality: '재개발·재건축',   tier: '1군' },
  { id: '3',  name: 'GS건설',        email: 'bid@gsenc.com',            contact: '이정민 과장', phone: '02-728-5678',  speciality: '재건축·주거복합', tier: '1군' },
  { id: '4',  name: '삼성물산',      email: 'bid@secc.co.kr',           contact: '최진영 부장', phone: '02-2145-7890', speciality: '재건축',         tier: '1군' },
  { id: '5',  name: 'HDC현대산업개발', email: 'bid@hdc-dvp.com',        contact: '정우성 차장', phone: '02-3279-2345', speciality: '재건축·재개발',   tier: '1군' },
  { id: '6',  name: '롯데건설',      email: 'bid@lotteconst.co.kr',    contact: '한지민 과장', phone: '02-2626-3456', speciality: '재개발',         tier: '1군' },
  { id: '7',  name: 'DL이앤씨',      email: 'bid@dlenc.co.kr',          contact: '강동원 부장', phone: '02-3670-4567', speciality: '재개발·재건축',   tier: '1군' },
  { id: '8',  name: '포스코이앤씨',  email: 'bid@poscoenc.com',         contact: '윤서연 차장', phone: '02-3457-5678', speciality: '재건축',         tier: '1군' },
  { id: '9',  name: '태영건설',      email: 'bid@taeyoung.co.kr',      contact: '임재현 과장', phone: '02-2630-6789', speciality: '재개발',         tier: '2군' },
  { id: '10', name: '한화건설',      email: 'bid@hwconst.co.kr',       contact: '송미래 부장', phone: '02-729-7890',  speciality: '재건축·주거복합', tier: '1군' },
  { id: '11', name: '호반건설',      email: 'bid@hobanconst.co.kr',    contact: '조현우 차장', phone: '02-3489-1234', speciality: '재개발',         tier: '2군' },
  { id: '12', name: '코오롱글로벌',  email: 'bid@kolongroup.com',       contact: '배수지 과장', phone: '02-3677-2345', speciality: '재건축',         tier: '2군' },
]

const DEFAULT_TEMPLATE = `1. 귀사의 무궁한 발전을 기원합니다.

2. 당 조합은 「도시 및 주거환경정비법」에 의거하여 {조합명} 정비사업을 추진하고 있으며, 시공사 선정을 위한 입찰을 진행하고자 합니다.

3. 이에 귀사의 입찰참여 의향 여부를 확인하고자 하오니, 아래 내용을 참고하시어 입찰참여 의향서를 제출하여 주시기 바랍니다.

                              - 아    래 -

가. 사업 개요
   · 사업명: {사업명}
   · 위치: {위치}
   · 사업면적: {면적}
   · 예정 세대수: {세대수}
   · 사업유형: {사업유형}

나. 제출 서류
   · 입찰참여 의향서 1부
   · 회사 소개서 1부
   · 시공 실적 증명서 1부

다. 제출 기한: {제출기한}

라. 제출 방법: 이메일 ({조합이메일}) 또는 방문 제출

마. 문의처: {담당자명} ({담당자연락처})

                                                    {조합명}
                                                    조합장 {조합장명} (직인)`

const DEFAULT_VARS: TemplateVars = {
  조합명: '성동구 XX구역 재개발정비사업조합',
  사업명: 'XX구역 재개발정비사업',
  위치: '서울특별시 성동구 XX동 일대',
  면적: '95,100㎡',
  세대수: '3,200세대',
  사업유형: '재개발',
  제출기한: '2026년 4월 30일',
  조합이메일: 'union@example.co.kr',
  담당자명: '김철수',
  담당자연락처: '02-1234-5678',
  조합장명: '홍길동',
}

const VAR_KEYS = Object.keys(DEFAULT_VARS) as (keyof TemplateVars)[]

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyVars(template: string, vars: TemplateVars, recipientName?: string): string {
  let result = template
  VAR_KEYS.forEach((key) => {
    result = result.replaceAll(`{${key}}`, vars[key])
  })
  if (recipientName) {
    result = result.replaceAll('{수신자}', recipientName)
  }
  return result
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Step indicator ────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number
}

function StepIndicator({ current }: StepIndicatorProps) {
  const steps = ['시공사 선택', '공문 작성', '발송 확인']
  return (
    <nav aria-label="진행 단계" className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const num = idx + 1
        const isCompleted = num < current
        const isActive = num === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
                  isCompleted && 'bg-primary-600 border-primary-600 text-white',
                  isActive && 'bg-white border-primary-600 text-primary-600 shadow-md',
                  !isCompleted && !isActive && 'bg-neutral-100 border-neutral-300 text-neutral-400'
                )}
              >
                {isCompleted ? <Check size={16} aria-hidden /> : num}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-primary-600' : isCompleted ? 'text-primary-500' : 'text-neutral-400'
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                aria-hidden
                className={cn(
                  'h-0.5 w-16 md:w-24 mx-2 mb-4 transition-all duration-300',
                  isCompleted ? 'bg-primary-500' : 'bg-neutral-200'
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ── Step 1: Company selection ─────────────────────────────────────────────────

interface Step1Props {
  selected: Set<string>
  onChange: (next: Set<string>) => void
  onNext: () => void
}

function Step1({ selected, onChange, onNext }: Step1Props) {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<'전체' | '1군' | '2군'>('전체')

  const filtered = useMemo(() => {
    return COMPANIES.filter((c) => {
      const matchesTier = tierFilter === '전체' || c.tier === tierFilter
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        c.name.includes(q) ||
        c.contact.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.speciality.includes(q)
      return matchesTier && matchesSearch
    })
  }, [search, tierFilter])

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id))

  function toggleAll() {
    const next = new Set(selected)
    if (allFilteredSelected) {
      filtered.forEach((c) => next.delete(c.id))
    } else {
      filtered.forEach((c) => next.add(c.id))
    }
    onChange(next)
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  function removeSelected(id: string) {
    const next = new Set(selected)
    next.delete(id)
    onChange(next)
  }

  const selectedCompanies = COMPANIES.filter((c) => selected.has(c.id))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: company list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <Building2 size={18} className="text-primary-600" aria-hidden />
              시공사 목록
              <span className="text-xs text-neutral-400 font-normal">({COMPANIES.length}개 등록)</span>
            </h2>
            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
              <input
                type="search"
                placeholder="회사명, 담당자, 이메일 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="시공사 검색"
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            {/* Tier filter */}
            <div className="flex gap-2" role="group" aria-label="시공사 등급 필터">
              {(['전체', '1군', '2군'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTierFilter(t)}
                  aria-pressed={tierFilter === t}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    tierFilter === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Select all row */}
          <div className="px-4 py-2.5 border-b border-neutral-100 bg-neutral-50 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleAll}
                aria-label="현재 필터 결과 전체 선택"
                className="w-4 h-4 rounded accent-primary-600"
              />
              <span>전체 선택 ({filtered.length}개)</span>
            </label>
          </div>

          {/* Company rows */}
          <ul role="list" className="divide-y divide-neutral-100 max-h-[420px] overflow-y-auto">
            {filtered.length === 0 && (
              <li className="py-10 text-center text-sm text-neutral-400">검색 결과가 없습니다.</li>
            )}
            {filtered.map((company) => {
              const isChecked = selected.has(company.id)
              return (
                <li key={company.id}>
                  <label
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-neutral-50 select-none',
                      isChecked && 'bg-primary-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(company.id)}
                      aria-label={`${company.name} 선택`}
                      className="mt-0.5 w-4 h-4 rounded accent-primary-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-800">{company.name}</span>
                        <Badge variant={company.tier === '1군' ? 'primary' : 'neutral'}>{company.tier}</Badge>
                        <span className="text-xs text-neutral-400">{company.speciality}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <AtSign size={11} aria-hidden />
                          {company.email}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Users size={11} aria-hidden />
                          {company.contact}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Phone size={11} aria-hidden />
                          {company.phone}
                        </span>
                      </div>
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right: selected chips */}
        <div className="bg-white rounded-xl border border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <Check size={18} className="text-success-600" aria-hidden />
              선택된 시공사
              <span
                className={cn(
                  'ml-auto text-sm font-bold px-2 py-0.5 rounded-full',
                  selected.size > 0 ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-400'
                )}
                aria-live="polite"
                aria-atomic="true"
              >
                {selected.size}개 선택됨
              </span>
            </h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto max-h-[440px]">
            {selectedCompanies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-10">
                <Building2 size={32} className="mb-2 opacity-30" aria-hidden />
                <p className="text-sm">왼쪽 목록에서<br />시공사를 선택하세요.</p>
              </div>
            ) : (
              <ul role="list" className="flex flex-col gap-2">
                {selectedCompanies.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2"
                  >
                    <Building2 size={14} className="text-primary-500 shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-800 truncate">{c.name}</p>
                      <p className="text-xs text-primary-500 truncate">{c.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelected(c.id)}
                      aria-label={`${c.name} 선택 해제`}
                      className="text-primary-400 hover:text-danger-600 transition-colors p-0.5 rounded"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={selected.size === 0}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all',
            selected.size > 0
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          )}
        >
          다음: 공문 작성
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}

// ── Document preview ──────────────────────────────────────────────────────────

interface DocPreviewProps {
  vars: TemplateVars
  template: string
  title: string
  subject: string
  docNumber: string
  senderDate: string
  selectedCompanies: Company[]
}

function DocPreview({ vars, template, title, subject, docNumber, senderDate, selectedCompanies }: DocPreviewProps) {
  const [previewIdx, setPreviewIdx] = useState(0)
  const recipient = selectedCompanies[previewIdx] ?? selectedCompanies[0]
  const body = applyVars(template, vars)

  return (
    <div className="flex flex-col h-full">
      {/* Recipient navigation */}
      {selectedCompanies.length > 1 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-neutral-500">
            미리보기: <span className="font-semibold text-neutral-700">{previewIdx + 1} / {selectedCompanies.length}</span>
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPreviewIdx((i) => Math.max(0, i - 1))}
              disabled={previewIdx === 0}
              aria-label="이전 수신자"
              className="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronLeft size={14} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPreviewIdx((i) => Math.min(selectedCompanies.length - 1, i + 1))}
              disabled={previewIdx === selectedCompanies.length - 1}
              aria-label="다음 수신자"
              className="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Official document */}
      <div
        aria-label="공문 미리보기"
        className="flex-1 bg-white border-2 border-neutral-200 rounded-lg overflow-y-auto p-6 text-[13px] leading-relaxed"
        style={{ fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif' }}
      >
        {/* Header */}
        <div className="border-b-2 border-neutral-800 pb-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold tracking-[0.3em] text-neutral-900">{title}</p>
          </div>
        </div>

        {/* Meta fields */}
        <table className="w-full text-xs mb-4 border-collapse">
          <tbody>
            <tr className="border border-neutral-300">
              <td className="border border-neutral-300 px-2 py-1.5 bg-neutral-50 font-semibold w-20 whitespace-nowrap">발  신</td>
              <td className="border border-neutral-300 px-2 py-1.5">{vars.조합명}</td>
              <td className="border border-neutral-300 px-2 py-1.5 bg-neutral-50 font-semibold w-20 whitespace-nowrap">문서번호</td>
              <td className="border border-neutral-300 px-2 py-1.5">{docNumber}</td>
            </tr>
            <tr className="border border-neutral-300">
              <td className="border border-neutral-300 px-2 py-1.5 bg-neutral-50 font-semibold whitespace-nowrap">수  신</td>
              <td className="border border-neutral-300 px-2 py-1.5 font-semibold text-primary-700" colSpan={3}>
                {recipient ? `${recipient.name} 대표이사 귀하` : '(수신자 없음)'}
              </td>
            </tr>
            <tr className="border border-neutral-300">
              <td className="border border-neutral-300 px-2 py-1.5 bg-neutral-50 font-semibold whitespace-nowrap">제  목</td>
              <td className="border border-neutral-300 px-2 py-1.5 font-semibold" colSpan={3}>{subject}</td>
            </tr>
            <tr className="border border-neutral-300">
              <td className="border border-neutral-300 px-2 py-1.5 bg-neutral-50 font-semibold whitespace-nowrap">발신일자</td>
              <td className="border border-neutral-300 px-2 py-1.5" colSpan={3}>{senderDate}</td>
            </tr>
          </tbody>
        </table>

        {/* Body */}
        <div className="mt-4">
          <pre
            className="whitespace-pre-wrap text-neutral-800 leading-[1.9] text-[12px]"
            style={{ fontFamily: 'inherit' }}
          >
            {body}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Document editor ───────────────────────────────────────────────────

interface Step2Props {
  selectedCompanies: Company[]
  onPrev: () => void
  onNext: (data: { vars: TemplateVars; template: string; subject: string; docNumber: string; senderDate: string }) => void
}

function Step2({ selectedCompanies, onPrev, onNext }: Step2Props) {
  const [vars, setVars] = useState<TemplateVars>(DEFAULT_VARS)
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [subject, setSubject] = useState('시공사 선정을 위한 입찰참여 의향서 제출 요청')
  const [docNumber, setDocNumber] = useState('XX조합 제2026-031호')
  const [senderDate, setSenderDate] = useState(todayString())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function updateVar(key: keyof TemplateVars, value: string) {
    setVars((prev) => ({ ...prev, [key]: value }))
  }

  function insertVar(key: string) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const token = `{${key}}`
    const next = template.slice(0, start) + token + template.slice(end)
    setTemplate(next)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + token.length, start + token.length)
    }, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: editor */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-base font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary-600" aria-hidden />
              공문 기본 정보
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1" htmlFor="doc-sender">
                  발신
                </label>
                <input
                  id="doc-sender"
                  type="text"
                  value={vars.조합명}
                  onChange={(e) => updateVar('조합명', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1" htmlFor="doc-number">
                  문서번호
                </label>
                <input
                  id="doc-number"
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1" htmlFor="doc-date">
                  발신 일자
                </label>
                <input
                  id="doc-date"
                  type="date"
                  value={senderDate}
                  onChange={(e) => setSenderDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1" htmlFor="doc-subject">
                  제목
                </label>
                <input
                  id="doc-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>
            {/* Recipient note */}
            <div className="mt-3 p-2.5 bg-neutral-50 rounded-lg text-xs text-neutral-500">
              수신: <span className="font-semibold text-primary-600">{'{시공사명}'} 대표이사 귀하</span>
              <span className="ml-2 text-neutral-400">— 각 시공사에 자동으로 삽입됩니다</span>
            </div>
          </div>

          {/* Template body */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-700">본문 템플릿</h3>
              <span className="text-xs text-neutral-400">{'{변수명}'} 형식으로 삽입</span>
            </div>
            {/* Variable chips */}
            <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="템플릿 변수 삽입">
              {VAR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => insertVar(key)}
                  title={`{${key}} 커서 위치에 삽입`}
                  className="px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded text-xs font-mono hover:bg-primary-100 transition-colors"
                >
                  {`{${key}}`}
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              aria-label="공문 본문 편집"
              rows={16}
              className="w-full px-3 py-2.5 text-xs font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none leading-relaxed"
            />
          </div>

          {/* Variable fill-in */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              변수 값 입력
              <span className="text-xs font-normal text-neutral-400">— 공문에 자동으로 반영됩니다</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VAR_KEYS.map((key) => (
                <div key={key}>
                  <label
                    className="block text-xs font-medium text-neutral-500 mb-1"
                    htmlFor={`var-${key}`}
                  >
                    <span className="font-mono text-primary-600">{`{${key}}`}</span>
                  </label>
                  <input
                    id={`var-${key}`}
                    type="text"
                    value={vars[key]}
                    onChange={(e) => updateVar(key, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex flex-col">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col flex-1 min-h-[600px]">
            <h2 className="text-base font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Mail size={18} className="text-primary-600" aria-hidden />
              실시간 미리보기
            </h2>
            <div className="flex-1">
              <DocPreview
                vars={vars}
                template={template}
                title={vars.조합명}
                subject={subject}
                docNumber={docNumber}
                senderDate={senderDate}
                selectedCompanies={selectedCompanies}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <ChevronLeft size={16} aria-hidden />
          이전
        </button>
        <button
          type="button"
          onClick={() => onNext({ vars, template, subject, docNumber, senderDate })}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors"
        >
          다음: 발송 확인
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Send confirmation ─────────────────────────────────────────────────

interface Step3Data {
  vars: TemplateVars
  template: string
  subject: string
  docNumber: string
  senderDate: string
}

interface Step3Props {
  selectedCompanies: Company[]
  data: Step3Data
  onPrev: () => void
}

type SendStatus = 'idle' | 'sending' | 'done'

function Step3({ selectedCompanies, data, onPrev }: Step3Props) {
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const [results, setResults] = useState<SendResult[]>([])
  const [sendingIdx, setSendingIdx] = useState(-1)

  const CHECKLIST = [
    '공문 내용이 정확한지 최종 확인하셨나요?',
    '입찰 참여 제출 기한이 올바른가요?',
    '조합장 이름 및 직인 정보가 맞나요?',
  ]

  function handleSend() {
    if (sendStatus !== 'idle') return
    setSendStatus('sending')
    const res: SendResult[] = []
    let i = 0

    function sendNext() {
      if (i >= selectedCompanies.length) {
        setResults(res)
        setSendStatus('done')
        setSendingIdx(-1)
        return
      }
      setSendingIdx(i)
      const c = selectedCompanies[i]
      setTimeout(() => {
        res.push({
          companyId: c.id,
          name: c.name,
          email: c.email,
          contact: c.contact,
          time: getTimestamp(),
        })
        setResults([...res])
        i++
        sendNext()
      }, 300 + Math.random() * 200)
    }

    sendNext()
  }

  if (sendStatus === 'done') {
    return (
      <div className="flex flex-col items-center gap-6">
        {/* Success banner */}
        <div className="w-full max-w-2xl bg-success-50 border border-success-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-success-600" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-success-800 mb-1">발송 완료!</h2>
          <p className="text-success-700 text-sm">
            {results.length}개 시공사에 입찰참여 의향서가 발송되었습니다.
          </p>
        </div>

        {/* Results list */}
        <div className="w-full max-w-2xl bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700">발송 현황</h3>
            <Badge variant="success">{results.length}건 완료</Badge>
          </div>
          <ul role="list" className="divide-y divide-neutral-100">
            {results.map((r) => (
              <li key={r.companyId} className="flex items-center gap-3 px-5 py-3">
                <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center shrink-0">
                  <Check size={12} className="text-success-600" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-neutral-800">{r.name}</span>
                  <span className="text-xs text-neutral-400 ml-2">{r.email}</span>
                </div>
                <span className="text-xs text-neutral-400">발송 완료 ({r.time})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Download size={16} aria-hidden />
            발송 내역 다운로드 (Excel)
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            대시보드로 돌아가기
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Summary card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <Send size={18} className="text-primary-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-800">발송 요약</h2>
            <p className="text-xs text-neutral-500">내용을 최종 확인하고 발송하세요.</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">발송 대상</p>
            <p className="text-sm font-bold text-neutral-800">{selectedCompanies.length}개 시공사</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">문서번호</p>
            <p className="text-sm font-semibold text-neutral-800">{data.docNumber}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-neutral-500 mb-0.5">문서 제목</p>
            <p className="text-sm font-semibold text-neutral-800">{data.subject}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">발신</p>
            <p className="text-sm text-neutral-700">{data.vars.조합명}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">발신일</p>
            <p className="text-sm text-neutral-700">{data.senderDate}</p>
          </div>
        </div>
      </div>

      {/* Recipient list */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-700">수신 목록</h3>
        </div>
        <ul role="list" className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
          {selectedCompanies.map((c, idx) => {
            const sent = results.find((r) => r.companyId === c.id)
            const isSending = sendingIdx === idx
            return (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
                    sent ? 'bg-success-100' : isSending ? 'bg-primary-100 animate-pulse' : 'bg-neutral-100'
                  )}
                >
                  {sent ? (
                    <Check size={12} className="text-success-600" aria-hidden />
                  ) : (
                    <Mail size={12} className={isSending ? 'text-primary-600' : 'text-neutral-400'} aria-hidden />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-neutral-800">{c.name}</span>
                  <span className="text-xs text-neutral-400 ml-2">{c.email}</span>
                </div>
                <span className="text-xs text-neutral-400">{c.contact}</span>
                {sent && (
                  <span className="text-xs text-success-600 font-medium">발송 완료 ({sent.time})</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Checklist */}
      <div className="bg-warning-50 border border-warning-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-warning-800 mb-3 flex items-center gap-2">
          <Mail size={16} className="text-warning-600" aria-hidden />
          발송 전 확인사항
        </h3>
        <ul className="space-y-2" role="list">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-warning-700">
              <span className="text-warning-500 mt-0.5" aria-hidden>·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom nav */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={sendStatus === 'sending'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden />
          공문 수정
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={sendStatus === 'sending'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-40"
          >
            <Download size={16} aria-hidden />
            PDF로 저장
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sendStatus === 'sending'}
            aria-busy={sendStatus === 'sending'}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all',
              sendStatus === 'sending'
                ? 'bg-primary-400 text-white cursor-wait'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            <Send size={16} aria-hidden />
            {sendStatus === 'sending'
              ? `발송 중... (${results.length}/${selectedCompanies.length})`
              : '전체 발송'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BidInvitePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [step2Data, setStep2Data] = useState<Step3Data | null>(null)

  const selectedCompanies = useMemo(
    () => COMPANIES.filter((c) => selected.has(c.id)),
    [selected]
  )

  const handleStep1Next = useCallback(() => {
    if (selected.size > 0) setStep(2)
  }, [selected.size])

  const handleStep2Next = useCallback((data: Step3Data) => {
    setStep2Data(data)
    setStep(3)
  }, [])

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Mail size={24} className="text-primary-600" aria-hidden />
            시공사 입찰 공문 발송
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            시공사를 선택하고 입찰 초청 공문을 작성하여 일괄 발송합니다.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Step content */}
        {step === 1 && (
          <Step1
            selected={selected}
            onChange={setSelected}
            onNext={handleStep1Next}
          />
        )}

        {step === 2 && (
          <Step2
            selectedCompanies={selectedCompanies}
            onPrev={() => setStep(1)}
            onNext={handleStep2Next}
          />
        )}

        {step === 3 && step2Data && (
          <Step3
            selectedCompanies={selectedCompanies}
            data={step2Data}
            onPrev={() => setStep(2)}
          />
        )}
      </div>
    </main>
  )
}

'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Download,
  Eye,
  Upload,
  Users,
  UserCheck,
  ClipboardCheck,
  Building2,
  Calculator,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Trash2,
  Shield,
  Lock,
  AlertTriangle,
  ArrowUpDown,
  type LucideIcon,
} from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Booklet {
  id: string
  unionName: string
  meetingType: '정기총회' | '임시총회'
  meetingDate: string
  pages: number
  items: string[]
  downloadCount: number
  fileSize: string
}

interface Template {
  id: string
  name: string
  description: string
  format: string
  columns: string[]
  icon: LucideIcon
  color: BadgeVariant
}

interface UploadedFile {
  name: string
  formType: string
  uploadDate: string
  status: 'done' | 'processing'
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const demoBooklets: Booklet[] = [
  {
    id: '1',
    unionName: '강남구 AA구역 재건축조합',
    meetingType: '정기총회',
    meetingDate: '2026-02-15',
    pages: 48,
    items: ['사업시행계획 변경안', '예산안 심의', '감사보고'],
    downloadCount: 156,
    fileSize: '12.4MB',
  },
  {
    id: '2',
    unionName: '성동구 BB구역 재개발조합',
    meetingType: '임시총회',
    meetingDate: '2026-01-20',
    items: ['관리처분계획 수립안', '시공사 선정'],
    pages: 62,
    downloadCount: 234,
    fileSize: '18.7MB',
  },
  {
    id: '3',
    unionName: '마포구 CC구역 재개발조합',
    meetingType: '정기총회',
    meetingDate: '2025-12-10',
    items: ['조합 결산 보고', '정관 변경안', '대의원 선출'],
    pages: 35,
    downloadCount: 89,
    fileSize: '8.2MB',
  },
  {
    id: '4',
    unionName: '용산구 DD구역 재건축조합',
    meetingType: '임시총회',
    meetingDate: '2026-03-01',
    items: ['사업비 변경안', '이주계획안'],
    pages: 28,
    downloadCount: 112,
    fileSize: '6.5MB',
  },
]

const standardTemplates: Template[] = [
  {
    id: 'roster',
    name: '조합원 명부',
    description: '조합원 성명, 연락처, 토지/건물 소유현황, 동의서 제출 여부',
    format: 'Excel (.xlsx)',
    columns: ['연번', '성명', '생년월일', '연락처', '소유 토지(㎡)', '소유 건물(㎡)', '지분율(%)', '동의서 제출', '비고'],
    icon: Users,
    color: 'primary',
  },
  {
    id: 'delegate',
    name: '대의원 명부',
    description: '대의원 성명, 소속 동/구역, 선임일, 임기, 연락처',
    format: 'Excel (.xlsx)',
    columns: ['연번', '성명', '소속 동/구역', '선임일', '임기만료일', '연락처', '직책', '비고'],
    icon: UserCheck,
    color: 'success',
  },
  {
    id: 'attendance',
    name: '총회 참석자 명부',
    description: '총회 참석/위임 현황, 의결권 행사 여부',
    format: 'Excel (.xlsx)',
    columns: ['연번', '성명', '조합원번호', '참석구분(직접/위임)', '위임인 성명', '의결권 행사', '서명', '비고'],
    icon: ClipboardCheck,
    color: 'warning',
  },
  {
    id: 'vote',
    name: '의결권 행사 명부',
    description: '안건별 찬반 투표 현황',
    format: 'Excel (.xlsx)',
    columns: ['연번', '성명', '조합원번호', '제1호 안건(찬/반)', '제2호 안건(찬/반)', '제3호 안건(찬/반)', '비고'],
    icon: ClipboardCheck,
    color: 'info',
  },
  {
    id: 'property',
    name: '토지·건물 조서',
    description: '정비구역 내 토지 및 건축물 현황',
    format: 'Excel (.xlsx)',
    columns: ['연번', '소유자', '소재지', '지목', '면적(㎡)', '공시지가(원/㎡)', '감정가(원)', '비고'],
    icon: Building2,
    color: 'neutral',
  },
  {
    id: 'expense',
    name: '사업비 내역서',
    description: '정비사업 총사업비 항목별 내역',
    format: 'Excel (.xlsx)',
    columns: ['구분', '항목', '산출내역', '금액(원)', '비율(%)', '비고'],
    icon: Calculator,
    color: 'danger',
  },
]

const recentUploads: UploadedFile[] = [
  { name: '조합원명부_2026.xlsx', formType: '조합원 명부', uploadDate: '2026-03-25', status: 'done' },
  { name: '대의원명부.xlsx', formType: '대의원 명부', uploadDate: '2026-03-20', status: 'done' },
  { name: '참석자현황.csv', formType: '총회 참석자', uploadDate: '2026-03-15', status: 'processing' },
]

/* ------------------------------------------------------------------ */
/* Toast helper                                                        */
/* ------------------------------------------------------------------ */

function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(msg)
    timerRef.current = setTimeout(() => setMessage(null), 2800)
  }, [])

  return { message, showToast }
}

/* ------------------------------------------------------------------ */
/* BookletTable (replaces BookletCard grid)                            */
/* ------------------------------------------------------------------ */

function BookletTable({
  booklets,
  onAction,
}: {
  booklets: Booklet[]
  onAction: (action: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortDesc, setSortDesc] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = booklets
    .filter((b) => {
      const q = searchQuery.toLowerCase()
      return (
        b.unionName.toLowerCase().includes(q) ||
        b.meetingType.includes(q) ||
        b.items.some((item) => item.toLowerCase().includes(q))
      )
    })
    .sort((a, b) =>
      sortDesc
        ? b.meetingDate.localeCompare(a.meetingDate)
        : a.meetingDate.localeCompare(b.meetingDate)
    )

  return (
    <div>
      {/* Search + sort controls */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="조합명, 안건으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-xs px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="총회책자 검색"
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm" aria-label="총회책자 목록">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 min-w-[180px]">
                  조합명
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">
                  주요 안건
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 w-24">
                  유형
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 w-28">
                  <button
                    onClick={() => setSortDesc((v) => !v)}
                    className="inline-flex items-center gap-1 hover:text-neutral-700 transition-colors"
                    aria-label="날짜 정렬"
                  >
                    일시
                    <ArrowUpDown size={12} aria-hidden />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 w-20">
                  페이지
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 w-28">
                  다운로드
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((booklet) => {
                const isExpanded = expandedId === booklet.id
                return (
                  <>
                    <tr
                      key={booklet.id}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : booklet.id)}
                      aria-expanded={isExpanded}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-800">{booklet.unionName}</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 max-w-xs">
                        <span className="line-clamp-1">{booklet.items.join(', ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={booklet.meetingType === '정기총회' ? 'primary' : 'warning'}>
                          {booklet.meetingType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">
                        {booklet.meetingDate.slice(5).replace('-', '/')}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">{booklet.pages}p</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAction('다운로드가 시작됩니다')
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors"
                          aria-label={`${booklet.unionName} 다운로드`}
                        >
                          <Download size={12} aria-hidden />
                          {booklet.fileSize}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${booklet.id}-detail`} className="bg-primary-50/40">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Agenda */}
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                                안건 목록
                              </p>
                              <ul className="space-y-1" aria-label="안건 목록">
                                {booklet.items.map((item, idx) => (
                                  <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                                    <span className="text-xs text-neutral-400 w-5 shrink-0">
                                      제{idx + 1}호
                                    </span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* File info */}
                            <div className="sm:w-48 shrink-0">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                                파일 정보
                              </p>
                              <div className="space-y-1 text-xs text-neutral-600">
                                <p>용량: {booklet.fileSize}</p>
                                <p>페이지: {booklet.pages}페이지</p>
                                <p>다운로드: {booklet.downloadCount.toLocaleString()}회</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="sm:w-32 shrink-0 flex flex-col gap-2">
                              <button
                                onClick={() => onAction('미리보기')}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-white transition-colors"
                                aria-label={`${booklet.unionName} 미리보기`}
                              >
                                <Eye size={13} aria-hidden />
                                미리보기
                              </button>
                              <button
                                onClick={() => onAction('다운로드가 시작됩니다')}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors"
                                aria-label={`${booklet.unionName} 다운로드`}
                              >
                                <Download size={13} aria-hidden />
                                다운로드
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-400">
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* TemplateCard (compact 2-col, always-visible columns as tags)        */
/* ------------------------------------------------------------------ */

function TemplateCard({ template, onAction }: { template: Template; onAction: (action: string) => void }) {
  const IconComponent = template.icon

  return (
    <article className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
            template.color === 'primary' && 'bg-primary-100 text-primary-600',
            template.color === 'success' && 'bg-success-100 text-success-600',
            template.color === 'warning' && 'bg-warning-100 text-warning-600',
            template.color === 'info' && 'bg-info-100 text-info-600',
            template.color === 'neutral' && 'bg-neutral-100 text-neutral-600',
            template.color === 'danger' && 'bg-danger-100 text-danger-600'
          )}
        >
          <IconComponent size={18} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 text-sm">{template.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{template.description}</p>
        </div>
      </div>

      {/* Columns — always visible as small tags */}
      <div className="flex flex-wrap gap-1" role="list" aria-label="포함 컬럼 목록">
        {template.columns.map((col) => (
          <span
            key={col}
            role="listitem"
            className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-medium"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onAction('양식 다운로드가 시작됩니다')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors"
          aria-label={`${template.name} 양식 다운로드`}
        >
          <Download size={13} aria-hidden />
          양식 다운로드
        </button>
        <button
          onClick={() => onAction('샘플을 불러오는 중입니다')}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          aria-label={`${template.name} 샘플 보기`}
        >
          <Eye size={13} aria-hidden />
          샘플
        </button>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* UploadArea                                                          */
/* ------------------------------------------------------------------ */

function UploadArea({ onUpload }: { onUpload: () => void }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      onUpload()
    },
    [onUpload]
  )

  const handleClick = useCallback(() => {
    onUpload()
  }, [onUpload])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onUpload()
      }
    },
    [onUpload]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="엑셀 파일 업로드 영역. 클릭하거나 파일을 드래그하세요"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2',
        isDragging
          ? 'border-primary-400 bg-primary-50'
          : 'border-neutral-200 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50/40'
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <Upload size={22} className="text-primary-600" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-700">
            엑셀 파일을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-xs text-neutral-400 mt-1">지원 형식: .xlsx, .xls, .csv &nbsp;·&nbsp; 최대 크기: 10MB</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-50 border border-warning-200 rounded-lg">
          <AlertTriangle size={12} className="text-warning-600 shrink-0" aria-hidden />
          <p className="text-xs text-warning-700">개인정보가 포함된 파일은 암호화되어 저장됩니다</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function MeetingsPage() {
  const { message: toastMsg, showToast } = useToast()

  const handleDownload = useCallback(() => {
    showToast('양식 다운로드가 시작됩니다')
  }, [showToast])

  const handleUpload = useCallback(() => {
    showToast('파일이 업로드되었습니다. 변환이 완료되면 알려드립니다.')
  }, [showToast])

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">총회 관리</h1>
        <p className="mt-1 text-sm text-neutral-500">총회 관련 서류를 관리하고, 표준 양식을 활용해 명부를 통일된 형식으로 관리하세요.</p>
      </div>

      {/* ============================================================ */}
      {/* Section 1: 총회책자 라이브러리                              */}
      {/* ============================================================ */}
      <section aria-labelledby="booklet-library-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="booklet-library-heading" className="text-lg font-bold text-neutral-900">
              총회책자 라이브러리
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">다른 조합의 총회 책자를 참고하세요</p>
          </div>
          <button
            onClick={() => showToast('업로드 기능은 준비 중입니다')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Upload size={15} aria-hidden />
            우리 조합 책자 업로드
          </button>
        </div>

        <BookletTable booklets={demoBooklets} onAction={showToast} />
      </section>

      {/* ============================================================ */}
      {/* Section 2: 서울시 표준 양식                                 */}
      {/* ============================================================ */}
      <section aria-labelledby="templates-heading">
        {/* Section header with clear separator */}
        <div className="mb-5 p-4 bg-primary-50 border border-primary-100 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">📋</span>
            <div>
              <h2 id="templates-heading" className="text-lg font-bold text-neutral-900">
                서울시 표준 양식
              </h2>
              <p className="text-sm text-neutral-600 mt-0.5 leading-relaxed">
                서울특별시 정비사업 운영 매뉴얼에 기반한 표준 양식입니다.{' '}
                조합별 상황에 맞게 수정하여 사용하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standardTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} onAction={showToast} />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 3: 명부 업로드 & 변환                               */}
      {/* ============================================================ */}
      <section aria-labelledby="upload-heading" id="roster">
        <div className="mb-4">
          <h2 id="upload-heading" className="text-lg font-bold text-neutral-900">
            명부 업로드
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            엑셀 파일을 업로드하면 자동으로 표준 양식으로 변환합니다.
          </p>
        </div>

        {/* Upload area */}
        <UploadArea onUpload={handleUpload} />

        {/* Recent uploads table */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">최근 업로드</h3>
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm" aria-label="최근 업로드 파일 목록">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">파일명</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">양식 유형</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">업로드일</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">상태</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentUploads.map((file) => (
                  <tr key={file.name} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={15} className="text-success-600 shrink-0" aria-hidden />
                        <span className="text-neutral-800 font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{file.formType}</td>
                    <td className="px-4 py-3 text-neutral-500">{file.uploadDate}</td>
                    <td className="px-4 py-3">
                      {file.status === 'done' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success-700 font-medium">
                          <CheckCircle2 size={13} aria-hidden />
                          변환 완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-warning-700 font-medium">
                          <Clock size={13} className="animate-pulse" aria-hidden />
                          변환 중
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {file.status === 'done' ? (
                          <>
                            <button
                              onClick={handleDownload}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors"
                              aria-label={`${file.name} 다운로드`}
                            >
                              <Download size={12} aria-hidden />
                              다운로드
                            </button>
                            <button
                              onClick={() => showToast('파일이 삭제되었습니다')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-danger-50 text-danger-700 text-xs font-medium hover:bg-danger-100 transition-colors"
                              aria-label={`${file.name} 삭제`}
                            >
                              <Trash2 size={12} aria-hidden />
                              삭제
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1.5 rounded-md bg-neutral-100 text-neutral-400 text-xs font-medium cursor-not-allowed">
                            대기 중
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-6 p-4 bg-neutral-900 rounded-xl" role="note" aria-label="개인정보 보호 안내">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={15} className="text-neutral-300" aria-hidden />
            <p className="text-sm font-semibold text-white">개인정보 보호 안내</p>
          </div>
          <ul className="space-y-1.5">
            {[
              '모든 파일은 AES-256 암호화되어 저장됩니다',
              '조합 관리자만 열람 가능하며, 다운로드 시 워터마크가 자동 삽입됩니다',
              '파일 접근 이력은 활동 로그에 기록됩니다',
              '개인정보보호법(PIPA) 및 정보통신망법 준수',
            ].map((notice) => (
              <li key={notice} className="flex items-start gap-2 text-xs text-neutral-400">
                <span className="w-1 h-1 rounded-full bg-neutral-500 mt-1.5 shrink-0" aria-hidden />
                {notice}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Toast notification */}
      {toastMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm rounded-xl shadow-xl z-50 max-w-xs"
        >
          <Shield size={15} className="text-primary-400 shrink-0" aria-hidden />
          {toastMsg}
        </div>
      )}
    </div>
  )
}

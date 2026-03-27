'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronLeft, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types & Demo Data                                                    */
/* ------------------------------------------------------------------ */

interface LawAlert {
  id: string
  isNew: boolean
  isRead: boolean
  lawName: string
  summary: string
  date: string
  changeType: '수정' | '추가' | '삭제'
  articleNumber?: string
}

const LAW_ALERTS: LawAlert[] = [
  {
    id: '1',
    isNew: true,
    isRead: false,
    lawName: '도시정비법 제49조 개정',
    summary: '관리처분계획 작성 기준 변경 — 분양신청 기간 조정 및 처리 기한 단축',
    date: '2026-03-20',
    changeType: '수정',
    articleNumber: '제49조',
  },
  {
    id: '2',
    isNew: true,
    isRead: false,
    lawName: '서울시 성동구 조례 제2조 개정',
    summary: '용적률 완화 기준 추가 — 소규모재건축 사업구역 내 용적률 10% 상향',
    date: '2026-03-18',
    changeType: '추가',
    articleNumber: '제2조',
  },
  {
    id: '3',
    isNew: false,
    isRead: true,
    lawName: '도시정비법 제35조 시행령 개정',
    summary: '조합설립인가 서류 간소화 — 첨부 서류 5종 → 3종으로 축소',
    date: '2026-02-28',
    changeType: '수정',
    articleNumber: '제35조',
  },
  {
    id: '4',
    isNew: false,
    isRead: true,
    lawName: '도시정비법 제81조 시행령 개정',
    summary: '이주비 지급 기준 현실화 — 세입자 주거이전비 산정 기준 변경',
    date: '2026-02-15',
    changeType: '수정',
    articleNumber: '제81조',
  },
  {
    id: '5',
    isNew: false,
    isRead: true,
    lawName: '빈집특별법 시행규칙 개정',
    summary: '빈집 실태조사 주기 조정 — 연 1회에서 2년 1회로 변경',
    date: '2026-01-30',
    changeType: '수정',
  },
  {
    id: '6',
    isNew: false,
    isRead: true,
    lawName: '서울특별시 도시정비 조례 제12조 신설',
    summary: '모아주택 사업 절차 간소화 특례 신설',
    date: '2026-01-10',
    changeType: '추가',
    articleNumber: '제12조',
  },
]

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function LawAlertsPage() {
  const [alerts, setAlerts] = useState<LawAlert[]>(LAW_ALERTS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = alerts.filter((a) => !a.isRead).length
  const displayed = filter === 'unread' ? alerts.filter((a) => !a.isRead) : alerts

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
  }

  const markRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/laws"
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label="법령 관리로 돌아가기"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
              법령 업데이트 알림
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 bg-danger-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            관련 법령 개정 시 자동으로 알림을 수신합니다
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <CheckCircle2 size={14} strokeWidth={1.5} />
            모두 읽음 처리
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5" role="tablist" aria-label="알림 필터">
        <button
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          전체 ({alerts.length})
        </button>
        <button
          role="tab"
          aria-selected={filter === 'unread'}
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          읽지 않음 ({unreadCount})
        </button>
      </div>

      {/* Alert List */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-success-300" strokeWidth={1} />
          <p className="text-base font-medium text-neutral-500">읽지 않은 알림이 없습니다</p>
          <p className="text-sm text-neutral-400 mt-1">모든 법령 업데이트를 확인하셨습니다</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {displayed.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                !alert.isRead ? 'bg-primary-50/30' : ''
              }`}
              onClick={() => markRead(alert.id)}
              role="button"
              aria-label={`${alert.lawName} — ${alert.summary}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') markRead(alert.id)
              }}
            >
              {/* Icon */}
              <div
                className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                  !alert.isRead ? 'bg-warning-100' : 'bg-neutral-100'
                }`}
              >
                <Bell
                  size={16}
                  className={!alert.isRead ? 'text-warning-600' : 'text-neutral-400'}
                  strokeWidth={1.5}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {alert.isNew && <Badge variant="warning">새 글</Badge>}
                  <Badge
                    variant={
                      alert.changeType === '추가'
                        ? 'success'
                        : alert.changeType === '삭제'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {alert.changeType}
                  </Badge>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" aria-label="읽지 않음" />
                  )}
                </div>

                <p className="text-sm font-semibold text-neutral-800 mb-0.5">
                  {alert.lawName}
                  {alert.articleNumber && (
                    <span className="ml-1.5 text-xs font-normal text-neutral-500 font-mono">
                      {alert.articleNumber}
                    </span>
                  )}
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed">{alert.summary}</p>
              </div>

              {/* Right side */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="text-xs text-neutral-400 font-mono">{alert.date}</span>
                <Link
                  href="/laws"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  법령 보기 <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="mt-4 flex items-start gap-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
        <AlertTriangle size={14} className="text-neutral-400 mt-0.5 shrink-0" strokeWidth={1.5} />
        <p className="text-xs text-neutral-500">
          법령 알림은 조합 사업 유형(재개발/재건축/소규모정비)과 관련된 개정 사항만 필터링하여 제공합니다.
          알림 설정은 <Link href="/settings" className="text-primary-600 hover:underline">설정</Link>에서 변경할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

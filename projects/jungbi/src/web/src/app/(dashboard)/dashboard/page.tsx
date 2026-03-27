'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  CalendarClock,
  ScrollText,
  FileX2,
  CheckCircle2,
  CircleDot,
  Circle,
  AlertTriangle,
  ArrowRight,
  FolderSearch,
  Bell,
} from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/* Demo Data                                                            */
/* ------------------------------------------------------------------ */

type ProcedureStatus = 'completed' | 'in_progress' | 'pending';

interface ProcedureStage {
  id: string;
  name: string;
  date: string;
  status: ProcedureStatus;
  progress?: number;
}

const procedureStages: ProcedureStage[] = [
  { id: '1', name: '기본계획 수립', date: '2023-11-20', status: 'completed' },
  { id: '2', name: '정비구역 지정', date: '2024-03-15', status: 'completed' },
  { id: '3', name: '추진위원회 구성', date: '2024-06-20', status: 'completed' },
  { id: '4', name: '조합설립인가', date: '2024-11-10', status: 'completed' },
  { id: '5', name: '사업시행계획인가', date: '2025-08-30', status: 'in_progress', progress: 67 },
  { id: '6', name: '관리처분계획인가', date: '2026-04 예정', status: 'pending' },
  { id: '7', name: '이주 및 철거', date: '미정', status: 'pending' },
];

interface ScheduleItem {
  id: string;
  date: string;
  dayLabel: string;
  title: string;
  dDay: number;
}

const scheduleItems: ScheduleItem[] = [
  { id: '1', date: '3/27', dayLabel: '목', title: '총회 의결 서류 제출 마감', dDay: 1 },
  { id: '2', date: '3/28', dayLabel: '금', title: '시청 협의 미팅', dDay: 2 },
  { id: '3', date: '4/02', dayLabel: '수', title: '법령 설명회 참석', dDay: 7 },
];

interface LawUpdate {
  id: string;
  isNew: boolean;
  lawName: string;
  summary: string;
  date: string;
}

const lawUpdates: LawUpdate[] = [
  { id: '1', isNew: true, lawName: '도시정비법 제49조 개정', summary: '관리처분계획 작성 기준 변경', date: '2026-03-20' },
  { id: '2', isNew: true, lawName: '서울시 성동구 조례 제2조 개정', summary: '용적률 완화 기준 추가', date: '2026-03-18' },
  { id: '3', isNew: false, lawName: '도시정비법 제35조 시행령 개정', summary: '조합설립인가 서류 간소화', date: '2026-02-28' },
];

interface SimilarCase {
  id: string;
  region: string;
  name: string;
  currentStage: string;
  duration: string;
  members: number;
  note: string;
}

const similarCases: SimilarCase[] = [
  {
    id: '1',
    region: '서울 성동구',
    name: 'XX구역 재개발',
    currentStage: '사업시행인가',
    duration: '8년 2개월',
    members: 240,
    note: '현재 단계와 동일 — 인가 소요 평균 14개월',
  },
  {
    id: '2',
    region: '서울 마포구',
    name: 'YY구역 재건축',
    currentStage: '관리처분인가',
    duration: '11년',
    members: 185,
    note: '관리처분 단계 진입 후 이주까지 평균 18개월',
  },
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: ProcedureStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 size={18} className="text-success-600 shrink-0" strokeWidth={1.5} />;
  }
  if (status === 'in_progress') {
    return <CircleDot size={18} className="text-primary-600 shrink-0" strokeWidth={1.5} />;
  }
  return <Circle size={18} className="text-neutral-400 shrink-0" strokeWidth={1.5} />;
}

function StatusBadge({ status, progress }: { status: ProcedureStatus; progress?: number }) {
  if (status === 'completed') return <Badge variant="success">완료</Badge>;
  if (status === 'in_progress') return <Badge variant="primary">진행중 {progress ? `(${progress}%)` : ''}</Badge>;
  return <Badge variant="neutral">대기</Badge>;
}

function ProcedureTimeline({ onItemClick }: { onItemClick: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-neutral-800">절차 진행 현황</h2>
        <Link
          href="/flow"
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          전체 보기 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="space-y-1" role="list" aria-label="절차 단계 목록">
        {procedureStages.map((stage) => (
          <div
            key={stage.id}
            role="listitem"
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer
              ${stage.status === 'in_progress'
                ? 'bg-primary-50 border-l-[3px] border-primary-600'
                : 'hover:bg-neutral-50 border-l-[3px] border-transparent'
              }`}
            aria-label={`${stage.name}, ${stage.status === 'completed' ? '완료' : stage.status === 'in_progress' ? '진행중' : '대기'}`}
          >
            <StatusIcon status={stage.status} />
            <span
              className={`flex-1 text-sm ${
                stage.status === 'in_progress' ? 'font-semibold text-neutral-950' : 'text-neutral-700'
              }`}
            >
              {stage.name}
            </span>
            <span
              className="text-xs text-neutral-400 w-28 text-right shrink-0 font-mono"
            >
              {stage.date}
            </span>
            <div className="w-28 flex justify-end shrink-0">
              <StatusBadge status={stage.status} progress={stage.progress} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekSchedule({ onItemClick }: { onItemClick: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-neutral-800">이번 주 일정</h2>
        <Link
          href="/calendar"
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          캘린더 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="space-y-2">
        {scheduleItems.map((item) => (
          <div
            key={item.id}
            onClick={onItemClick}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="shrink-0 text-center min-w-[36px]">
              <div
                className={`text-xs font-mono font-semibold ${item.dDay <= 3 ? 'text-danger-600' : 'text-neutral-500'}`}
              >
                {item.date}
              </div>
              <div className="text-xs text-neutral-400">{item.dayLabel}</div>
            </div>
            <p className="flex-1 text-sm text-neutral-800 leading-snug">{item.title}</p>
            <div className="shrink-0">
              {item.dDay <= 3 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-danger-600 bg-danger-100">
                  <AlertTriangle size={10} aria-hidden="true" />
                  D-{item.dDay}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-neutral-500 bg-neutral-100">
                  D-{item.dDay}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LawUpdates() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-neutral-800">최근 법령 변경 알림</h2>
        <Link
          href="/laws/alerts"
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          전체 보기 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-neutral-100">
        {lawUpdates.map((update) => (
          <button
            key={update.id}
            className="w-full flex items-start gap-3 py-3 text-left hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors"
            aria-label={`${update.lawName} - ${update.summary}`}
          >
            <Bell size={14} className="text-neutral-400 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {update.isNew && (
                  <Badge variant="warning">새 글</Badge>
                )}
                <span className="text-sm font-medium text-neutral-800 truncate">{update.lawName}</span>
              </div>
              <p className="text-xs text-neutral-500">{update.summary}</p>
            </div>
            <span className="text-xs text-neutral-400 shrink-0 font-mono">{update.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SimilarCases() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-neutral-800">유사 사례 참고</h2>
        <Link
          href="/cases"
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          사례 검색 <ArrowRight size={14} />
        </Link>
      </div>
      <div className="space-y-4">
        {similarCases.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-lg border border-neutral-200 hover:border-primary-100 hover:bg-primary-50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-xs text-neutral-400">{c.region}</span>
                <h3 className="text-sm font-semibold text-neutral-800">{c.name}</h3>
              </div>
              <Badge variant="primary">{c.currentStage}</Badge>
            </div>
            <p className="text-xs text-neutral-500 mb-2">
              진행기간: {c.duration} | 조합원 {c.members}세대
            </p>
            <p className="text-xs text-primary-600 bg-primary-50 px-2 py-1.5 rounded-md">
              {c.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">대시보드</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-neutral-500">성동구 XX구역 재개발조합</span>
            <Badge variant="primary">재개발</Badge>
            <span className="text-xs text-neutral-400">정비구역 지정일: 2024-03-15</span>
          </div>
        </div>
        <Link
          href="/flow"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
        >
          <FolderSearch size={16} strokeWidth={1.5} />
          절차 전체 보기
        </Link>
      </div>

      {/* KPI Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        role="list"
        aria-label="주요 지표"
      >
        <div role="listitem">
          <KpiCard
            icon={BarChart3}
            label="전체 진행률"
            value="67%"
            description="절차 18/27 완료"
          />
        </div>
        <div role="listitem">
          <KpiCard
            icon={CalendarClock}
            label="D-day 마감"
            value="D-12"
            description="사업시행인가"
          />
        </div>
        <div role="listitem">
          <KpiCard
            icon={ScrollText}
            label="법령 업데이트"
            value="3건"
            description="이번 달 개정 — 미확인"
            urgent
          />
        </div>
        <div role="listitem">
          <KpiCard
            icon={FileX2}
            label="미완료 서류"
            value="5건"
            description="이번 달 기한"
          />
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <div className="lg:col-span-8">
          <ProcedureTimeline onItemClick={() => router.push('/flow')} />
        </div>
        <div className="lg:col-span-4">
          <WeekSchedule onItemClick={() => router.push('/calendar')} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LawUpdates />
        <SimilarCases />
      </div>
    </div>
  );
}

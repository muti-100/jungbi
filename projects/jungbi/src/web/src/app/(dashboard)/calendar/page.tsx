'use client';

import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import {
  Plus,
  X,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type EventType = 'approval' | 'meeting' | 'document' | 'law' | 'other';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  dDay?: number;
  location?: string;
  description?: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                             */
/* ------------------------------------------------------------------ */

const EVENT_COLORS: Record<EventType, { bg: string; text: string; tailwind: string }> = {
  approval: { bg: '#DC2626', text: '#ffffff', tailwind: 'bg-red-600' },
  meeting: { bg: '#1E5799', text: '#ffffff', tailwind: 'bg-blue-700' },
  document: { bg: '#CA8A04', text: '#ffffff', tailwind: 'bg-yellow-600' },
  law: { bg: '#0891B2', text: '#ffffff', tailwind: 'bg-cyan-600' },
  other: { bg: '#6B7280', text: '#ffffff', tailwind: 'bg-gray-500' },
};

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  approval: '인허가 기한',
  meeting: '총회/회의',
  document: '서류 제출',
  law: '법령 시행일',
  other: '기타',
};

/* ------------------------------------------------------------------ */
/* Demo Data (2026-03)                                                   */
/* ------------------------------------------------------------------ */

const demoEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '사업시행계획인가 제출 마감',
    date: '2026-03-27',
    type: 'approval',
    dDay: 1,
    location: '서울시 성동구청 도시계획과',
    description: '사업시행계획서 일체 제출 마감일입니다. 미제출 시 인가 지연',
  },
  {
    id: '2',
    title: '조합원 임시총회',
    date: '2026-03-28',
    type: 'meeting',
    dDay: 2,
    location: '성동구 어울림마당 3층',
    description: '사업시행계획 변경안 심의 및 의결',
  },
  {
    id: '3',
    title: '법령 설명회 참석',
    date: '2026-04-02',
    type: 'law',
    dDay: 7,
    location: '서울 COEX 컨퍼런스홀',
    description: '개정 도시정비법 실무 설명회',
  },
  {
    id: '4',
    title: '토지·건물 조서 제출',
    date: '2026-03-31',
    type: 'document',
    dDay: 5,
    location: '성동구청',
    description: '권리산정 기준일 기준 토지 및 건물 조서 제출',
  },
  {
    id: '5',
    title: '도시정비법 시행령 시행',
    date: '2026-03-15',
    type: 'law',
    description: '개정 도시정비법 시행령 제44조 시행일',
  },
  {
    id: '6',
    title: '조합 이사회',
    date: '2026-03-20',
    type: 'meeting',
    location: '조합 사무소',
    description: '월례 이사회 - 사업 진행 현황 보고',
  },
  {
    id: '7',
    title: '분양신청 기간 마감',
    date: '2026-03-10',
    type: 'approval',
    description: '관리처분계획 수립을 위한 분양신청 기간 종료',
  },
  {
    id: '8',
    title: '정비기반시설 설계 도서 제출',
    date: '2026-03-25',
    type: 'document',
    dDay: 1,
    location: '성동구청 건축과',
  },
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function DayBadge({ dDay }: { dDay: number }) {
  if (dDay <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-red-600 bg-red-50">
        <AlertTriangle size={10} aria-hidden="true" />
        D-{dDay}
      </span>
    );
  }
  if (dDay <= 7) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-700 bg-amber-50">
        D-{dDay}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-gray-500 bg-gray-100">
      D-{dDay}
    </span>
  );
}

interface AddEventModalProps {
  defaultDate?: string;
  onClose: () => void;
}

function AddEventModal({ defaultDate, onClose }: AddEventModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="일정 추가"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        style={{ boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">일정 추가</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="모달 닫기"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-title">
              일정명 <span className="text-red-500" aria-label="필수">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              required
              placeholder="일정 제목 입력"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-type">
              일정 유형
            </label>
            <select
              id="event-type"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-date">
              날짜 <span className="text-red-500" aria-label="필수">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              defaultValue={defaultDate}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-location">
              장소
            </label>
            <input
              id="event-location"
              type="text"
              placeholder="장소 입력 (선택)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event-memo">
              메모
            </label>
            <textarea
              id="event-memo"
              rows={3}
              placeholder="메모 입력 (선택)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState<string | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const selectedDateEvents = selectedDate
    ? demoEvents.filter((e) => e.date === selectedDate)
    : [];

  const fcEvents = demoEvents.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    backgroundColor: EVENT_COLORS[e.type].bg,
    borderColor: EVENT_COLORS[e.type].bg,
    textColor: EVENT_COLORS[e.type].text,
    extendedProps: { type: e.type, dDay: e.dDay },
  }));

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.dateStr);
    setSelectedEvent(null);
  };

  const handleEventClick = (info: EventClickArg) => {
    const ev = demoEvents.find((e) => e.id === info.event.id);
    if (ev) {
      setSelectedDate(ev.date);
      setSelectedEvent(ev);
    }
  };

  const navigateCalendar = (dir: 'prev' | 'next') => {
    const api = calendarRef.current?.getApi();
    if (dir === 'prev') api?.prev();
    else api?.next();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">일정 관리</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateCalendar('prev')}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigateCalendar('next')}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3">
            {(Object.entries(EVENT_COLORS) as [EventType, typeof EVENT_COLORS[EventType]][]).map(
              ([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`w-3 h-3 rounded-sm ${color.tailwind}`} aria-hidden="true" />
                  {EVENT_TYPE_LABELS[type]}
                </div>
              )
            )}
          </div>
          <button
            onClick={() => {
              setModalDate(undefined);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            aria-label="일정 추가"
          >
            <Plus size={16} strokeWidth={1.5} />
            일정 추가
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="bg-white rounded-xl h-full overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              headerToolbar={{
                left: '',
                center: 'title',
                right: '',
              }}
              events={fcEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="100%"
              dayMaxEvents={3}
              moreLinkText={(n) => `+${n}개 더`}
              buttonText={{ today: '오늘' }}
              eventContent={(info) => {
                const dDay = info.event.extendedProps.dDay as number | undefined;
                return (
                  <div className="flex items-center gap-1 px-1 overflow-hidden w-full">
                    <span className="text-xs truncate flex-1">{info.event.title}</span>
                    {dDay !== undefined && dDay <= 7 && (
                      <span className="text-xs font-bold shrink-0 opacity-90">D-{dDay}</span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <aside
          className="w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden"
          aria-label="선택한 날짜의 일정 목록"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-gray-800">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })
                  : '날짜를 선택하세요'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDate && (
              <div className="text-center py-10 text-sm text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 text-gray-200" strokeWidth={1} />
                캘린더에서 날짜를 클릭하면
                <br />
                해당 일정이 표시됩니다
              </div>
            )}

            {selectedDate && selectedDateEvents.length === 0 && (
              <div className="text-center py-10 text-sm text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 text-gray-200" strokeWidth={1} />
                <p>이 날 일정이 없습니다</p>
                <button
                  onClick={() => {
                    setModalDate(selectedDate);
                    setShowModal(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} />
                  일정 추가
                </button>
              </div>
            )}

            {selectedDateEvents.length > 0 && (
              <div className="space-y-3">
                {selectedDateEvents.map((ev) => {
                  const color = EVENT_COLORS[ev.type];
                  const isSelected = selectedEvent?.id === ev.id;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(isSelected ? null : ev)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                      aria-expanded={isSelected}
                      aria-label={ev.title}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                          style={{ backgroundColor: color.bg }}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-sm font-medium text-gray-800 leading-snug">
                              {ev.title}
                            </span>
                            {ev.dDay !== undefined && <DayBadge dDay={ev.dDay} />}
                          </div>
                          <div className="mt-0.5">
                            <Badge
                              variant={
                                ev.type === 'approval'
                                  ? 'danger'
                                  : ev.type === 'meeting'
                                  ? 'primary'
                                  : ev.type === 'document'
                                  ? 'warning'
                                  : ev.type === 'law'
                                  ? 'info'
                                  : 'neutral'
                              }
                            >
                              {EVENT_TYPE_LABELS[ev.type]}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2 pl-4 space-y-1 text-xs text-gray-500">
                          {ev.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={11} strokeWidth={1.5} />
                              {ev.location}
                            </div>
                          )}
                          {ev.description && (
                            <div className="flex items-start gap-1">
                              <Clock size={11} className="shrink-0 mt-0.5" strokeWidth={1.5} />
                              {ev.description}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <AddEventModal defaultDate={modalDate} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

'use client'

import React, { useState } from 'react'
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  ChevronRight,
  Check,
  Save,
  Trash2,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type SettingsTab = 'profile' | 'organization' | 'notifications' | 'security' | 'billing'

interface TabItem {
  id: SettingsTab
  label: string
  icon: LucideIcon
}

/* ------------------------------------------------------------------ */
/* Constants                                                             */
/* ------------------------------------------------------------------ */

const TABS: TabItem[] = [
  { id: 'profile', label: '내 프로필', icon: User },
  { id: 'organization', label: '조직 설정', icon: Building2 },
  { id: 'notifications', label: '알림 설정', icon: Bell },
  { id: 'security', label: '보안', icon: Shield },
  { id: 'billing', label: '구독/결제', icon: CreditCard },
]

/* ------------------------------------------------------------------ */
/* Tab Content Components                                               */
/* ------------------------------------------------------------------ */

function SavedToast({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-success-700 text-white text-sm rounded-xl shadow-xl z-50"
      role="alert"
      aria-live="polite"
    >
      <Check size={16} />
      저장되었습니다
    </div>
  )
}

function ProfileTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-800 mb-4">내 프로필</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
            김
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">김철수</p>
            <p className="text-xs text-neutral-500">관리자</p>
          </div>
          <button className="ml-2 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors">
            사진 변경
          </button>
        </div>
        <div className="space-y-4 max-w-md">
          {[
            { id: 'name', label: '이름', defaultValue: '김철수', type: 'text' },
            { id: 'email', label: '이메일', defaultValue: 'kim@union.co.kr', type: 'email' },
            { id: 'phone', label: '연락처', defaultValue: '010-1234-5678', type: 'tel' },
            { id: 'position', label: '직책', defaultValue: '조합장', type: 'text' },
          ].map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                defaultValue={field.defaultValue}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="pt-2">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Save size={15} strokeWidth={1.5} />
          저장
        </button>
      </div>
    </div>
  )
}

function OrganizationTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-800 mb-4">조직 설정</h2>
        <div className="space-y-4 max-w-md">
          {[
            { id: 'org-name', label: '조합/단체명', defaultValue: '성동구 XX구역 재개발조합' },
            { id: 'org-district', label: '정비구역명', defaultValue: 'XX구역' },
            { id: 'org-address', label: '사무소 주소', defaultValue: '서울특별시 성동구 XX로 123' },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-neutral-700 mb-1.5">
                {field.label}
              </label>
              <input
                id={field.id}
                type="text"
                defaultValue={field.defaultValue}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          ))}
          <div>
            <label htmlFor="org-type" className="block text-sm font-medium text-neutral-700 mb-1.5">
              사업 유형
            </label>
            <select
              id="org-type"
              defaultValue="redevelopment"
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="redevelopment">재개발</option>
              <option value="reconstruction">재건축</option>
              <option value="small_scale">소규모정비</option>
              <option value="moa">모아주택</option>
            </select>
          </div>
          <div>
            <label htmlFor="org-region" className="block text-sm font-medium text-neutral-700 mb-1.5">
              소재지 시/도
            </label>
            <select
              id="org-region"
              defaultValue="seoul"
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="seoul">서울특별시</option>
              <option value="gyeonggi">경기도</option>
              <option value="busan">부산광역시</option>
              <option value="incheon">인천광역시</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-700">팀 멤버</h3>
          <button className="text-xs text-primary-600 hover:underline font-medium">+ 초대</button>
        </div>
        <div className="space-y-2 max-w-md">
          {[
            { name: '김철수', email: 'kim@union.co.kr', role: '관리자' },
            { name: '이영희', email: 'lee@union.co.kr', role: '편집자' },
            { name: '박민수', email: 'park@union.co.kr', role: '뷰어' },
          ].map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{member.name}</p>
                <p className="text-xs text-neutral-400">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === '관리자' ? 'primary' : member.role === '편집자' ? 'success' : 'neutral'}>
                  {member.role}
                </Badge>
                {member.role !== '관리자' && (
                  <button className="text-neutral-300 hover:text-danger-600 transition-colors" aria-label="멤버 제거">
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Save size={15} strokeWidth={1.5} />
          저장
        </button>
      </div>
    </div>
  )
}

function NotificationsTab({ onSave }: { onSave: () => void }) {
  const [settings, setSettings] = useState({
    law_update: true,
    deadline_7d: true,
    deadline_3d: true,
    deadline_1d: true,
    meeting_reminder: true,
    document_due: true,
    email_digest: false,
    kakao_alert: false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  const notificationItems = [
    { key: 'law_update' as const, label: '법령 업데이트 알림', desc: '관련 법령이 개정되면 즉시 알림' },
    { key: 'deadline_7d' as const, label: 'D-7 마감 알림', desc: '마감 7일 전 사전 알림' },
    { key: 'deadline_3d' as const, label: 'D-3 마감 알림', desc: '마감 3일 전 긴급 알림' },
    { key: 'deadline_1d' as const, label: 'D-1 마감 알림', desc: '마감 1일 전 최종 알림' },
    { key: 'meeting_reminder' as const, label: '회의/총회 리마인더', desc: '일정 24시간 전 알림' },
    { key: 'document_due' as const, label: '서류 제출 기한 알림', desc: '체크리스트 미완료 서류 알림' },
  ]

  const channelItems = [
    { key: 'email_digest' as const, label: '이메일 주간 요약', desc: '매주 월요일 주간 일정/업데이트 요약' },
    { key: 'kakao_alert' as const, label: '카카오 알림톡', desc: '긴급 마감 및 중요 알림을 카카오로 전송' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-800 mb-4">알림 설정</h2>
        <div className="space-y-2 max-w-lg">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                role="switch"
                aria-checked={settings[item.key]}
                aria-label={item.label}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                  settings[item.key] ? 'bg-primary-600' : 'bg-neutral-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    settings[item.key] ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">알림 채널</h3>
        <div className="space-y-2 max-w-lg">
          {channelItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                role="switch"
                aria-checked={settings[item.key]}
                aria-label={item.label}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                  settings[item.key] ? 'bg-primary-600' : 'bg-neutral-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    settings[item.key] ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Save size={15} strokeWidth={1.5} />
          저장
        </button>
      </div>
    </div>
  )
}

function SecurityTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-800 mb-4">비밀번호 변경</h2>
        <div className="space-y-4 max-w-md">
          {[
            { id: 'current-pw', label: '현재 비밀번호' },
            { id: 'new-pw', label: '새 비밀번호' },
            { id: 'confirm-pw', label: '새 비밀번호 확인' },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-neutral-700 mb-1.5">
                {field.label}
              </label>
              <input
                id={field.id}
                type="password"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          ))}
          <button
            onClick={onSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Save size={15} strokeWidth={1.5} />
            비밀번호 변경
          </button>
        </div>
      </div>

      <div className="max-w-md">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">2단계 인증</h3>
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-neutral-800">2FA 인증</p>
            <p className="text-xs text-neutral-400 mt-0.5">OTP 앱을 이용한 2단계 인증</p>
          </div>
          <Badge variant="neutral">비활성</Badge>
        </div>
        <button className="mt-2 w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          2FA 활성화
        </button>
      </div>

      <div className="max-w-md p-4 bg-danger-50 border border-danger-200 rounded-xl">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle size={16} className="text-danger-600 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-semibold text-danger-800">위험 구역</p>
            <p className="text-xs text-danger-600 mt-0.5">아래 작업은 되돌릴 수 없습니다.</p>
          </div>
        </div>
        <button className="w-full px-4 py-2 rounded-lg border border-danger-300 text-sm font-medium text-danger-700 hover:bg-danger-100 transition-colors">
          계정 탈퇴
        </button>
      </div>
    </div>
  )
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-800 mb-4">현재 구독</h2>
        <div className="max-w-md p-5 bg-primary-50 border border-primary-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-primary-900 text-lg">Pro 플랜</span>
            <Badge variant="primary">활성</Badge>
          </div>
          <p className="text-sm text-primary-700 mb-3">월 59,000원 · 다음 결제일: 2026-04-26</p>
          <ul className="space-y-1 text-sm text-primary-700">
            {['무제한 법령 조회', '실시간 법령 업데이트 알림', '모든 사업 유형 지원', '우선 고객 지원'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check size={14} className="text-primary-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 mt-3 max-w-md">
          <button className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            플랜 변경
          </button>
          <button className="flex-1 px-4 py-2 rounded-lg border border-danger-200 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors">
            구독 취소
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">결제 수단</h3>
        <div className="max-w-md flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-lg">
          <CreditCard size={20} className="text-neutral-400" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-neutral-800">Visa •••• 4242</p>
            <p className="text-xs text-neutral-400">만료: 12/28</p>
          </div>
          <button className="ml-auto text-xs text-primary-600 hover:underline font-medium">변경</button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">결제 내역</h3>
        <div className="max-w-2xl">
          <table className="w-full text-sm" aria-label="결제 내역">
            <thead>
              <tr className="border-b border-neutral-200">
                <th scope="col" className="text-left pb-2 text-xs font-semibold text-neutral-500">날짜</th>
                <th scope="col" className="text-left pb-2 text-xs font-semibold text-neutral-500">내용</th>
                <th scope="col" className="text-right pb-2 text-xs font-semibold text-neutral-500">금액</th>
                <th scope="col" className="text-right pb-2 text-xs font-semibold text-neutral-500">영수증</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2026-03-26', desc: 'Pro 플랜 월 구독', amount: '59,000원' },
                { date: '2026-02-26', desc: 'Pro 플랜 월 구독', amount: '59,000원' },
                { date: '2026-01-26', desc: 'Pro 플랜 월 구독', amount: '59,000원' },
              ].map((row) => (
                <tr key={row.date} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 text-xs text-neutral-500 font-mono">{row.date}</td>
                  <td className="py-3 text-neutral-800">{row.desc}</td>
                  <td className="py-3 text-right font-medium text-neutral-800">{row.amount}</td>
                  <td className="py-3 text-right">
                    <button className="text-xs text-primary-600 hover:underline">PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [savedToast, setSavedToast] = useState(false)

  const handleSave = () => {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-neutral-950 tracking-tight mb-6">설정</h1>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav
          className="w-52 shrink-0"
          aria-label="설정 메뉴"
        >
          <ul className="space-y-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-800 font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                    }`}
                  >
                    <tab.icon
                      size={17}
                      strokeWidth={1.5}
                      className={isActive ? 'text-primary-600' : 'text-neutral-400'}
                    />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {isActive && <ChevronRight size={14} className="text-primary-400" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-6 min-h-[480px]">
          {activeTab === 'profile' && <ProfileTab onSave={handleSave} />}
          {activeTab === 'organization' && <OrganizationTab onSave={handleSave} />}
          {activeTab === 'notifications' && <NotificationsTab onSave={handleSave} />}
          {activeTab === 'security' && <SecurityTab onSave={handleSave} />}
          {activeTab === 'billing' && <BillingTab />}
        </div>
      </div>

      <SavedToast visible={savedToast} />
    </div>
  )
}

'use client'

import {
  Shield,
  Lock,
  Eye,
  FileKey,
  Server,
  Globe,
  ChevronLeft,
  CheckCircle2,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PolicySection {
  id: string
  number: string
  title: string
  icon: React.ReactNode
  iconBg: string
  items: string[]
}

interface ContactItem {
  label: string
  email: string
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const LAST_UPDATED = '2026-03-27'

const sections: PolicySection[] = [
  {
    id: 'encryption',
    number: '1',
    title: '데이터 암호화',
    icon: <Lock size={18} aria-hidden />,
    iconBg: 'bg-primary-100 text-primary-600',
    items: [
      '전송 중 암호화: TLS 1.3 적용 (HTTPS 전용)',
      '저장 시 암호화: AES-256-GCM (조합원 명부, 개인정보 포함 문서)',
      '데이터베이스: Supabase PostgreSQL RLS (Row Level Security) 전면 적용',
      '파일 저장: Supabase Storage + Server-Side Encryption',
    ],
  },
  {
    id: 'access',
    number: '2',
    title: '접근 제어',
    icon: <Shield size={18} aria-hidden />,
    iconBg: 'bg-success-100 text-success-600',
    items: [
      '역할 기반 접근 제어 (RBAC): 소유자/관리자/편집자/뷰어 4단계',
      '세션 관리: JWT + HttpOnly Cookie, 24시간 자동 만료',
      '2단계 인증 (2FA): OTP 앱 지원 (선택)',
      'IP 화이트리스트: Enterprise 플랜 지원 예정',
    ],
  },
  {
    id: 'privacy',
    number: '3',
    title: '개인정보 처리',
    icon: <Eye size={18} aria-hidden />,
    iconBg: 'bg-warning-100 text-warning-600',
    items: [
      '수집 항목: 성명, 이메일, 연락처, 조합 정보',
      '처리 목적: 조합 운영 지원, 절차 관리, 법령 알림 서비스 제공',
      '보유 기간: 회원 탈퇴 후 30일 이내 파기',
      '제3자 제공: 없음 (법적 요구 시 제외)',
      '개인정보보호법(PIPA) 제15조, 제17조, 제21조 준수',
    ],
  },
  {
    id: 'document',
    number: '4',
    title: '문서 보안',
    icon: <FileKey size={18} aria-hidden />,
    iconBg: 'bg-info-100 text-info-600',
    items: [
      '다운로드 워터마크: 다운로드자 이름 + 일시 자동 삽입',
      '파일 접근 로그: 누가, 언제, 어떤 파일에 접근했는지 기록',
      '열람 권한: 조합 내 멤버만 접근 가능 (RLS 정책)',
      '파일 삭제: 완전 삭제 (soft delete 후 30일 이내 물리적 삭제)',
    ],
  },
  {
    id: 'audit',
    number: '5',
    title: '감사 추적 (Audit Trail)',
    icon: <Eye size={18} aria-hidden />,
    iconBg: 'bg-neutral-100 text-neutral-600',
    items: [
      '모든 데이터 변경 사항 기록',
      '명부 업로드/다운로드/수정/삭제 이력 추적',
      '로그 보관: Pro 30일, Enterprise 무제한',
      '이상 접근 감지 시 관리자 알림',
    ],
  },
  {
    id: 'infra',
    number: '6',
    title: '인프라 보안',
    icon: <Server size={18} aria-hidden />,
    iconBg: 'bg-danger-100 text-danger-600',
    items: [
      '호스팅: Vercel (SOC 2 Type II 인증)',
      '데이터베이스: Supabase (SOC 2 Type II, ISO 27001)',
      '리전: 서울 (ap-northeast-2) — 데이터 국내 보관',
      '자동 백업: 매일 + Point-in-Time Recovery (7일)',
      'DDoS 방어: Vercel Edge Network + Rate Limiting',
    ],
  },
  {
    id: 'headers',
    number: '7',
    title: '보안 헤더',
    icon: <Globe size={18} aria-hidden />,
    iconBg: 'bg-primary-100 text-primary-600',
    items: [
      'X-Frame-Options: DENY (클릭재킹 방지)',
      'X-Content-Type-Options: nosniff',
      'Strict-Transport-Security: HSTS 적용',
      'Content-Security-Policy: 외부 스크립트 실행 차단',
      'Referrer-Policy: strict-origin-when-cross-origin',
    ],
  },
  {
    id: 'compliance',
    number: '8',
    title: '컴플라이언스',
    icon: <Shield size={18} aria-hidden />,
    iconBg: 'bg-success-100 text-success-600',
    items: [
      '개인정보보호법 (PIPA) 준수',
      '정보통신망 이용촉진 및 정보보호 등에 관한 법률 준수',
      '개인정보의 안전성 확보조치 기준 (고시) 준수',
      '연 1회 자체 보안 감사 실시',
    ],
  },
]

const contacts: ContactItem[] = [
  { label: '보안 관련 문의', email: 'security@nodrio.com' },
  { label: '개인정보 관련 문의', email: 'privacy@nodrio.com' },
]

/* ------------------------------------------------------------------ */
/* PolicySectionCard                                                   */
/* ------------------------------------------------------------------ */

function PolicySectionCard({ section }: { section: PolicySection }) {
  return (
    <article
      className="bg-white rounded-xl border border-neutral-200 p-6"
      aria-labelledby={`section-${section.id}-heading`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${section.iconBg}`}>
          {section.icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            {section.number}
          </p>
          <h2
            id={`section-${section.id}-heading`}
            className="text-base font-bold text-neutral-900 leading-tight"
          >
            {section.title}
          </h2>
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-2" role="list">
        {section.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckCircle2
              size={14}
              className="text-success-500 shrink-0 mt-0.5"
              aria-hidden
            />
            <span className="text-sm text-neutral-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SecurityPolicyPage() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
        aria-label="설정 페이지로 돌아가기"
      >
        <ChevronLeft size={15} aria-hidden />
        설정으로 돌아가기
      </Link>

      {/* Page header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Lock size={20} aria-hidden />
          </div>
          <Badge variant="info" className="bg-white/20 text-white border-0">
            정책 문서
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">개인정보 보호 및 보안 정책</h1>
        <p className="mt-2 text-primary-200 text-sm">
          정비나라는 조합원의 개인정보와 민감 데이터를 최고 수준의 보안으로 보호합니다.
        </p>
        <p className="mt-4 text-xs text-primary-300">
          마지막 업데이트: {LAST_UPDATED}
        </p>
      </div>

      {/* Summary badges */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        aria-label="주요 보안 인증 현황"
      >
        {[
          { label: 'TLS 1.3', desc: '전송 암호화' },
          { label: 'AES-256', desc: '저장 암호화' },
          { label: 'SOC 2 Type II', desc: '인프라 인증' },
          { label: 'PIPA 준수', desc: '개인정보보호법' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl border border-neutral-200 p-4 text-center"
          >
            <p className="text-sm font-bold text-primary-700">{item.label}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Policy sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <PolicySectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Contact section */}
      <div
        className="bg-neutral-900 rounded-2xl p-6"
        aria-labelledby="contact-heading"
      >
        <div className="flex items-center gap-2 mb-4">
          <Mail size={16} className="text-neutral-300" aria-hidden />
          <h2 id="contact-heading" className="text-sm font-bold text-white">
            보안 문의
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.email}
              className="bg-white/5 rounded-xl px-4 py-3 border border-white/10"
            >
              <p className="text-xs text-neutral-400 mb-1">{contact.label}</p>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm font-semibold text-primary-300 hover:text-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
              >
                {contact.email}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-neutral-400 text-center pb-4">
        본 정책은 서비스 변경에 따라 사전 고지 후 변경될 수 있습니다. 중요한 변경 사항은 이메일로 안내드립니다.
      </p>
    </div>
  )
}

import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white border-b border-neutral-200 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary-900">
          <Building2 size={20} className="text-primary-600" />
          정비나라
        </Link>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-950 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-neutral-400 mb-10">최종 업데이트: 2026년 1월 1일</p>

        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section aria-labelledby="pp-section1">
            <h2 id="pp-section1" className="text-lg font-bold text-neutral-900 mb-3">
              1. 개인정보의 처리 목적
            </h2>
            <p>
              정비나라(이하 &ldquo;회사&rdquo;)는 다음 목적을 위하여 개인정보를 처리합니다.
              처리하는 개인정보는 다음 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 개인정보 보호법에 따라 별도의 동의를 받습니다.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>회원 가입 및 서비스 이용을 위한 본인 확인</li>
              <li>서비스 제공 및 기능 운영</li>
              <li>서비스 이용 통계 분석 및 품질 개선</li>
              <li>법령 업데이트 알림 등 고지사항 전달</li>
            </ul>
          </section>

          <section aria-labelledby="pp-section2">
            <h2 id="pp-section2" className="text-lg font-bold text-neutral-900 mb-3">
              2. 처리하는 개인정보 항목
            </h2>
            <p>회사는 다음 항목의 개인정보를 수집·처리합니다.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-neutral-200">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="border border-neutral-200 px-4 py-2 text-left font-semibold text-neutral-700">구분</th>
                    <th className="border border-neutral-200 px-4 py-2 text-left font-semibold text-neutral-700">항목</th>
                    <th className="border border-neutral-200 px-4 py-2 text-left font-semibold text-neutral-700">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-neutral-200 px-4 py-2">필수</td>
                    <td className="border border-neutral-200 px-4 py-2">이메일, 비밀번호(암호화), 이름</td>
                    <td className="border border-neutral-200 px-4 py-2">회원 탈퇴 후 30일</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-4 py-2">선택</td>
                    <td className="border border-neutral-200 px-4 py-2">연락처, 소속 조합명</td>
                    <td className="border border-neutral-200 px-4 py-2">회원 탈퇴 후 즉시 삭제</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-4 py-2">자동 수집</td>
                    <td className="border border-neutral-200 px-4 py-2">IP 주소, 접속 로그, 쿠키</td>
                    <td className="border border-neutral-200 px-4 py-2">6개월</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="pp-section3">
            <h2 id="pp-section3" className="text-lg font-bold text-neutral-900 mb-3">
              3. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 법령의 규정에 의거하거나 수사·조사 목적으로 관계기관이 요구하는 경우에는
              제공할 수 있습니다.
            </p>
          </section>

          <section aria-labelledby="pp-section4">
            <h2 id="pp-section4" className="text-lg font-bold text-neutral-900 mb-3">
              4. 정보주체의 권리
            </h2>
            <p>
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>개인정보 처리 현황 열람 요청</li>
              <li>오류 등이 있는 경우 정정 요청</li>
              <li>개인정보 삭제(탈퇴) 요청</li>
              <li>개인정보 처리 정지 요청</li>
            </ul>
            <p className="mt-2">
              권리 행사는 <Link href="/settings" className="text-primary-600 hover:underline">설정 페이지</Link> 또는
              고객센터(privacy@jungbinara.kr)를 통해 가능합니다.
            </p>
          </section>

          <section aria-labelledby="pp-section5">
            <h2 id="pp-section5" className="text-lg font-bold text-neutral-900 mb-3">
              5. 개인정보 보호책임자
            </h2>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <p className="font-medium text-neutral-800 mb-1">개인정보 보호책임자</p>
              <p>이름: 홍길동</p>
              <p>직책: 개인정보보호팀장</p>
              <p>연락처: privacy@jungbinara.kr</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4 text-sm text-neutral-500">
          <Link href="/terms" className="hover:text-primary-600 transition-colors">
            이용약관
          </Link>
          <Link href="/" className="hover:text-primary-600 transition-colors">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-neutral-950 mb-2">이용약관</h1>
        <p className="text-sm text-neutral-400 mb-10">최종 업데이트: 2026년 1월 1일</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section aria-labelledby="section1">
            <h2 id="section1" className="text-lg font-bold text-neutral-900 mb-3">
              제1조 (목적)
            </h2>
            <p>
              이 약관은 정비나라(이하 &ldquo;회사&rdquo;)가 제공하는 도시정비사업 관리 서비스(이하 &ldquo;서비스&rdquo;)의
              이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section aria-labelledby="section2">
            <h2 id="section2" className="text-lg font-bold text-neutral-900 mb-3">
              제2조 (정의)
            </h2>
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>&ldquo;서비스&rdquo;란 회사가 제공하는 법령 조회, 절차 관리, 일정 관리 등 일체의 서비스를 말합니다.</li>
              <li>&ldquo;이용자&rdquo;란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>&ldquo;회원&rdquo;이란 회사에 개인 정보를 제공하여 회원 등록을 한 자로서 서비스를 이용하는 자를 말합니다.</li>
            </ul>
          </section>

          <section aria-labelledby="section3">
            <h2 id="section3" className="text-lg font-bold text-neutral-900 mb-3">
              제3조 (약관의 효력 및 변경)
            </h2>
            <p>
              이 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
              회사는 필요한 경우 관련 법령을 위반하지 않는 범위 내에서 이 약관을 변경할 수 있으며,
              변경된 약관은 공지 후 7일 이내에 효력이 발생합니다.
            </p>
          </section>

          <section aria-labelledby="section4">
            <h2 id="section4" className="text-lg font-bold text-neutral-900 mb-3">
              제4조 (서비스의 제공 및 변경)
            </h2>
            <p>
              회사는 법령 정보 제공 서비스, 절차 안내 서비스, 일정 관리 서비스 등을 제공합니다.
              회사는 서비스 내용을 변경할 경우 이용자에게 사전 공지합니다.
              본 서비스에서 제공하는 법령 정보는 참고용으로만 사용되어야 하며 법적 효력이 없습니다.
              실제 법률 적용은 관할 행정기관 또는 법률 전문가에게 확인하시기 바랍니다.
            </p>
          </section>

          <section aria-labelledby="section5">
            <h2 id="section5" className="text-lg font-bold text-neutral-900 mb-3">
              제5조 (이용자의 의무)
            </h2>
            <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
              <li>서비스에 게시된 정보를 무단으로 상업적으로 이용하는 행위</li>
              <li>회사 및 제3자의 지식재산권을 침해하는 행위</li>
              <li>기타 관련 법령 및 이 약관을 위반하는 행위</li>
            </ul>
          </section>

          <section aria-labelledby="section6">
            <h2 id="section6" className="text-lg font-bold text-neutral-900 mb-3">
              제6조 (면책조항)
            </h2>
            <p>
              회사는 천재지변, 전쟁, 기간통신사업자의 서비스 장애 등 불가항력으로 인해 서비스를
              제공할 수 없는 경우에는 책임이 면제됩니다. 회사는 이용자가 서비스를 통해 얻은
              정보로 인한 손해에 대해 책임을 지지 않습니다.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex gap-4 text-sm text-neutral-500">
          <Link href="/privacy" className="hover:text-primary-600 transition-colors">
            개인정보처리방침
          </Link>
          <Link href="/" className="hover:text-primary-600 transition-colors">
            홈으로
          </Link>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-black text-primary-500 opacity-20 mb-4 select-none"
          aria-hidden="true"
        >
          404
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export default function RootLoading() {
  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center"
      role="status"
      aria-label="페이지 로딩 중"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">로딩 중...</p>
      </div>
    </div>
  )
}

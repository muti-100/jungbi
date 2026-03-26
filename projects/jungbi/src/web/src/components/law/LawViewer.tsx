'use client'

import { useState } from 'react'
import { Search, Bookmark, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Law, LawArticle } from '@/types'

export interface LawViewerProps {
  law: Law
  articles: LawArticle[]
  onArticleBookmark?: (articleId: string) => void
}

export function LawViewer({ law, articles, onArticleBookmark }: LawViewerProps) {
  const [query, setQuery] = useState('')
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null)

  const filtered = query
    ? articles.filter(
        (a) =>
          a.article_number.includes(query) ||
          a.title?.includes(query) ||
          a.content.includes(query)
      )
    : articles

  function highlight(text: string) {
    if (!query) return text
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts
  }

  return (
    <div className="flex flex-col h-full">
      {/* Law header */}
      <div className="px-8 py-5 border-b border-neutral-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">{law.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              시행:{' '}
              <span className="font-mono">
                {law.effective_at ?? '미지정'}
              </span>{' '}
              &middot; {law.version ?? ''} &middot; 소관:{' '}
              {law.region ? `${law.region}` : '국토교통부'}
            </p>
          </div>
          {law.source_url && (
            <a
              href={law.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline shrink-0"
              aria-label="국가법령정보센터에서 원문 보기 (새 창)"
            >
              원문 보기
              <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="px-8 py-3 border-b border-neutral-200 bg-neutral-50">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="조문 내 검색..."
            aria-label="법령 조문 내 검색"
            className={cn(
              'w-full pl-9 pr-4 py-2 text-sm rounded-md border border-neutral-200',
              'bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600'
            )}
          />
        </div>
        {query && (
          <p className="mt-1 text-xs text-neutral-400" aria-live="polite">
            {filtered.length}개 조문 검색됨
          </p>
        )}
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <Search size={32} className="mx-auto mb-3 opacity-40" aria-hidden />
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
        {filtered.map((article) => {
          const contentParts = highlight(article.content)

          return (
            <article
              key={article.id}
              onMouseEnter={() => setHoveredArticle(article.id)}
              onMouseLeave={() => setHoveredArticle(null)}
              className="group relative"
              aria-label={`${article.article_number}${article.title ? ` ${article.title}` : ''}`}
            >
              {/* Article number + title */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-mono text-sm text-primary-600 font-semibold shrink-0">
                  {article.article_number}
                </span>
                {article.title && (
                  <span className="text-base font-semibold text-neutral-800">
                    {article.title}
                  </span>
                )}
                {/* Bookmark button — appears on hover */}
                {onArticleBookmark && hoveredArticle === article.id && (
                  <button
                    type="button"
                    onClick={() => onArticleBookmark(article.id)}
                    aria-label={`${article.article_number} 조문 북마크`}
                    className="ml-auto p-1 text-neutral-400 hover:text-primary-600 transition-colors"
                  >
                    <Bookmark size={15} />
                  </button>
                )}
              </div>

              {/* Article content */}
              <div className="text-sm leading-7 text-neutral-800 whitespace-pre-wrap">
                {Array.isArray(contentParts)
                  ? contentParts.map((part, i) =>
                      typeof part === 'string' && part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-amber-200 rounded-sm">{part}</mark>
                      ) : (
                        part
                      )
                    )
                  : article.content}
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary-050 text-primary-600 px-2 py-0.5 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Separator */}
              <div className="mt-8 border-b border-neutral-200" aria-hidden />
            </article>
          )
        })}
      </div>
    </div>
  )
}

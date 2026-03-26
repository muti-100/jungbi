'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Star,
  Share2,
  Printer,
  BookOpen,
  Bookmark,
  X,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface LawItem {
  id: string;
  name: string;
  hasUpdate: boolean;
}

interface LawCategory {
  id: string;
  label: string;
  laws: LawItem[];
}

interface Article {
  id: string;
  number: string;
  title: string;
  content: string;
}

interface LawDetail {
  id: string;
  name: string;
  enforcementDate: string;
  lawNumber: string;
  authority: string;
  articles: Article[];
  revisionHistory: { date: string; summary: string; type: '수정' | '추가' | '삭제' }[];
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                             */
/* ------------------------------------------------------------------ */

const lawCategories: LawCategory[] = [
  {
    id: 'national',
    label: '모법 (국가법령)',
    laws: [
      { id: 'urban-renewal', name: '도시 및 주거환경정비법', hasUpdate: true },
      { id: 'urban-regen', name: '도시재정비 촉진을 위한 특별법', hasUpdate: false },
      { id: 'small-house', name: '빈집 및 소규모주택 정비에 관한 특례법', hasUpdate: false },
    ],
  },
  {
    id: 'enforcement',
    label: '시행령 / 시행규칙',
    laws: [
      { id: 'urban-renewal-decree', name: '도시 및 주거환경정비법 시행령', hasUpdate: false },
      { id: 'urban-renewal-rule', name: '도시 및 주거환경정비법 시행규칙', hasUpdate: false },
    ],
  },
  {
    id: 'local',
    label: '지자체 조례 (서울특별시)',
    laws: [
      { id: 'seoul-ord', name: '서울특별시 도시 및 주거환경 정비 조례', hasUpdate: true },
      { id: 'seoul-vacant', name: '서울특별시 빈집정비 조례', hasUpdate: false },
    ],
  },
];

const lawDetails: Record<string, LawDetail> = {
  'urban-renewal': {
    id: 'urban-renewal',
    name: '도시 및 주거환경정비법',
    enforcementDate: '2026-01-15',
    lawNumber: '제19234호',
    authority: '국토교통부',
    articles: [
      {
        id: 'art1',
        number: '제1조',
        title: '목적',
        content:
          '이 법은 도시기능을 회복하기 위하여 정비가 필요한 지역에서 주거환경개선사업, 재개발사업, 재건축사업 등 도시정비사업을 시행하기 위하여 필요한 사항을 규정함으로써 도시환경을 개선하고 주거생활의 질을 높이는 데 이바지함을 목적으로 한다.',
      },
      {
        id: 'art2',
        number: '제2조',
        title: '정의',
        content:
          '이 법에서 사용하는 용어의 뜻은 다음과 같다.\n1. "정비구역"이란 정비사업을 계획적으로 시행하기 위하여 제16조에 따라 지정·고시된 구역을 말한다.\n2. "정비사업"이란 이 법에서 정한 절차에 따라 도시기능을 회복하기 위하여 정비구역에서 정비기반시설을 정비하거나 주택 등 건축물을 개량 또는 건설하는 다음 각 목의 사업을 말한다.\n  가. 주거환경개선사업\n  나. 재개발사업\n  다. 재건축사업',
      },
      {
        id: 'art35',
        number: '제35조',
        title: '조합의 설립인가',
        content:
          '① 재개발사업 및 재건축사업의 추진위원회가 조합을 설립하려면 다음 각 호의 사항을 첨부하여 시장·군수등의 인가를 받아야 한다.\n1. 정관\n2. 조합원 명부 및 해당 조합원과 관련된 등기사항증명서\n3. 공사비 등 정비사업에 드는 비용과 그 부담 계획\n4. 정비사업의 시행 계획서\n\n② 제1항에 따른 인가의 요건은 다음 각 호와 같다.\n1. 토지 또는 건축물을 소유한 자 또는 지상권자의 3/4 이상 동의\n2. 토지면적의 1/2 이상에 해당하는 토지 소유자의 동의',
      },
      {
        id: 'art49',
        number: '제49조',
        title: '사업시행계획인가',
        content:
          '① 사업시행자는 정비사업을 시행하려는 경우에는 사업시행계획서에 다음 각 호의 서류를 첨부하여 시장·군수등에게 제출하고 사업시행계획인가를 받아야 한다.\n1. 사업시행계획서\n2. 정관 등 관련 서류\n3. 토지·건물에 관한 권리의 명세서\n\n② 시장·군수등은 제1항에 따른 사업시행계획인가의 신청이 있는 날부터 60일 이내에 인가 여부를 결정하여 사업시행자에게 알려야 한다.',
      },
      {
        id: 'art74',
        number: '제74조',
        title: '관리처분계획의 인가 등',
        content:
          '① 사업시행자는 제72조에 따른 분양신청기간이 종료된 때에는 대통령령으로 정하는 기준 및 방법에 따라 다음 각 호의 사항이 포함된 관리처분계획을 수립하여 시장·군수등의 인가를 받아야 한다.\n1. 분양설계\n2. 분양대상자의 주소 및 성명\n3. 분양예정인 대지 또는 건축물의 추산액\n4. 다음 각 목에 해당하는 보류지 등의 명세와 추산액\n\n② 제1항에 따른 관리처분계획의 인가 또는 변경인가를 받은 경우에는 이전고시가 있는 날까지 종전의 토지 또는 건축물에 관한 권리는 그에 해당하는 권리에 갈음하여 새로이 취득한 것으로 본다.',
      },
      {
        id: 'art81',
        number: '제81조',
        title: '이주대책의 수립 등',
        content:
          '① 사업시행자는 주거이전비를 세입자에게 지급하여야 한다. 다만, 세입자가 보상에 관한 합의 없이 이주하는 경우에는 그러하지 아니하다.\n② 사업시행자는 이전고시 전 세입자가 임시거처를 마련할 수 있도록 이주대책을 수립하여야 한다.',
      },
    ],
    revisionHistory: [
      { date: '2026-01-15', summary: '제49조 1항 분양신청 기간 조정', type: '수정' },
      { date: '2025-07-01', summary: '제35조 조합설립인가 요건 완화', type: '수정' },
      { date: '2024-03-20', summary: '제3조 정의 추가 (모아주택)', type: '추가' },
      { date: '2023-11-01', summary: '제81조 이주비 기준 개정', type: '수정' },
      { date: '2022-06-10', summary: '제2조 2의3호 신설 (소규모재개발사업)', type: '추가' },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        strokeWidth={1.5}
      />
      <input
        type="search"
        placeholder="법령명, 조항 번호 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        aria-label="법령 검색"
      />
    </div>
  );
}

function CategorySection({
  category,
  selectedLawId,
  onSelect,
  defaultOpen = true,
}: {
  category: LawCategory;
  selectedLawId: string;
  onSelect: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:bg-neutral-50 transition-colors"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {category.label}
      </button>
      {open && (
        <ul>
          {category.laws.map((law) => (
            <li key={law.id}>
              <button
                onClick={() => onSelect(law.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                  ${selectedLawId === law.id
                    ? 'bg-primary-50 text-primary-800 border-l-[3px] border-primary-600 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50 border-l-[3px] border-transparent'
                  }`}
                aria-current={selectedLawId === law.id ? 'true' : undefined}
              >
                <span className="flex-1 leading-snug pr-2">{law.name}</span>
                {law.hasUpdate && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-warning-700 bg-warning-100">
                    <AlertTriangle size={10} />
                    개정
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ArticleBlock({ article, searchTerm }: { article: Article; searchTerm: string }) {
  const highlight = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning-200 rounded px-0.5">$1</mark>');
  };

  return (
    <article className="py-6 group" aria-labelledby={`article-${article.id}`}>
      <div className="flex items-start gap-3 mb-2">
        <code
          className="text-primary-600 font-semibold text-sm shrink-0 font-mono"
          id={`article-${article.id}`}
        >
          {article.number}
        </code>
        <h3 className="text-sm font-semibold text-neutral-800">({article.title})</h3>
        <button
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-neutral-400 hover:text-primary-600"
          aria-label={`${article.number} 북마크`}
        >
          <Bookmark size={14} strokeWidth={1.5} />
        </button>
      </div>
      <div
        className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: highlight(article.content) }}
      />
      <div className="mt-4 border-b border-neutral-100" />
    </article>
  );
}

function EmptyLawState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <BookOpen size={48} className="text-neutral-300 mb-4" strokeWidth={1} />
      <p className="text-base font-medium text-neutral-500">좌측에서 법령을 선택하세요</p>
      <p className="text-sm text-neutral-400 mt-1">법령을 선택하면 조문을 확인할 수 있습니다</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <AlertCircle size={48} className="text-danger-300 mb-4" strokeWidth={1} />
      <p className="text-base font-medium text-neutral-700">법령 데이터를 불러오지 못했습니다</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        재시도
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function LawsPage() {
  const [selectedLawId, setSelectedLawId] = useState<string>('urban-renewal');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [hasError] = useState(false);

  const detail = lawDetails[selectedLawId] ?? null;

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return lawCategories;
    const q = searchQuery.toLowerCase();
    return lawCategories
      .map((cat) => ({
        ...cat,
        laws: cat.laws.filter((l) => l.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.laws.length > 0);
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    if (!detail) return [];
    if (!articleSearch) return detail.articles;
    const q = articleSearch.toLowerCase();
    return detail.articles.filter(
      (a) =>
        a.number.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );
  }, [detail, articleSearch]);

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <aside
        className="w-80 shrink-0 bg-white border-r border-neutral-200 flex flex-col overflow-hidden"
        aria-label="법령 목록"
      >
        <div className="p-3 border-b border-neutral-100">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, idx) => (
              <CategorySection
                key={cat.id}
                category={cat}
                selectedLawId={selectedLawId}
                onSelect={(id) => {
                  setSelectedLawId(id);
                  setActiveTab('current');
                  setArticleSearch('');
                }}
                defaultOpen={idx === 0}
              />
            ))
          ) : (
            <div className="p-6 text-center text-sm text-neutral-400">
              <Search size={32} className="mx-auto mb-2 text-neutral-300" strokeWidth={1} />
              검색 결과가 없습니다.
              <button
                onClick={() => setSearchQuery('')}
                className="block mx-auto mt-2 text-primary-600 hover:underline"
              >
                검색 초기화
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {!detail && !hasError && <EmptyLawState />}
        {hasError && <ErrorState onRetry={() => {}} />}

        {detail && !hasError && (
          <>
            {/* Law Header */}
            <div className="border-b border-neutral-200 px-10 py-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-xl font-bold text-neutral-900">{detail.name}</h1>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                    aria-label="즐겨찾기 추가"
                  >
                    <Star size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                    aria-label="공유"
                  >
                    <Share2 size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                    aria-label="인쇄"
                  >
                    <Printer size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-neutral-500">
                시행:{' '}
                <span className="font-mono">{detail.enforcementDate}</span>{' '}
                | 법률 {detail.lawNumber} | 소관: {detail.authority}
              </p>

              {/* Tabs */}
              <div className="flex gap-1 mt-4" role="tablist">
                {(['current', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {tab === 'current' ? '현행' : '개정이력'}
                  </button>
                ))}
              </div>
            </div>

            {/* Article Search Bar */}
            {activeTab === 'current' && (
              <div className="px-10 py-3 border-b border-neutral-100 flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    strokeWidth={1.5}
                  />
                  <input
                    type="search"
                    placeholder="조문 내 검색..."
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 text-sm border border-neutral-200 rounded-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    aria-label="조문 내 검색"
                  />
                </div>
                {articleSearch && (
                  <button
                    onClick={() => setArticleSearch('')}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600"
                    aria-label="검색 초기화"
                  >
                    <X size={14} />
                  </button>
                )}
                {articleSearch && (
                  <span className="text-xs text-neutral-500">
                    {filteredArticles.length}건 검색됨
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-10 py-2" role="tabpanel">
              {activeTab === 'current' && (
                <>
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <ArticleBlock
                        key={article.id}
                        article={article}
                        searchTerm={articleSearch}
                      />
                    ))
                  ) : (
                    <div className="py-16 text-center text-sm text-neutral-400">
                      <Search size={32} className="mx-auto mb-2 text-neutral-300" strokeWidth={1} />
                      검색 결과가 없습니다. 다른 키워드를 사용해 보세요.
                      <button
                        onClick={() => setArticleSearch('')}
                        className="block mx-auto mt-2 text-primary-600 hover:underline"
                      >
                        검색 초기화
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <div className="py-6">
                  <table className="w-full text-sm" aria-label="개정이력">
                    <caption className="sr-only">법령 개정 이력</caption>
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th
                          scope="col"
                          className="text-left pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-36"
                        >
                          날짜
                        </th>
                        <th
                          scope="col"
                          className="text-left pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                        >
                          개정 내용 요약
                        </th>
                        <th
                          scope="col"
                          className="text-left pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider w-24"
                        >
                          변경 유형
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.revisionHistory.map((rev, i) => (
                        <tr
                          key={i}
                          className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 text-xs text-neutral-500 font-mono">
                            {rev.date}
                          </td>
                          <td className="py-3 text-neutral-800">{rev.summary}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                rev.type === '추가'
                                  ? 'success'
                                  : rev.type === '삭제'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {rev.type}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

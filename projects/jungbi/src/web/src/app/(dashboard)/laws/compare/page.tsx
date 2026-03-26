'use client';

import React, { useState } from 'react';
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Download,
  FileDown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface Region {
  id: string;
  name: string;
  lastUpdated: string;
  isLatest: boolean;
}

interface CompareRow {
  id: string;
  label: string;
  subLabel?: string;
  tooltip: string;
  values: Record<string, { text: string; numericValue?: number; note?: string }>;
  higherIsBetter: boolean;
}

/* ------------------------------------------------------------------ */
/* Demo Data                                                             */
/* ------------------------------------------------------------------ */

const allRegions: Region[] = [
  { id: 'seoul', name: '서울특별시', lastUpdated: '2026-02-01', isLatest: true },
  { id: 'gyeonggi', name: '경기도', lastUpdated: '2026-01-15', isLatest: true },
  { id: 'busan', name: '부산광역시', lastUpdated: '2025-11-20', isLatest: false },
  { id: 'incheon', name: '인천광역시', lastUpdated: '2026-01-30', isLatest: true },
  { id: 'daegu', name: '대구광역시', lastUpdated: '2025-12-10', isLatest: true },
  { id: 'gwangju', name: '광주광역시', lastUpdated: '2025-10-05', isLatest: false },
];

const defaultSelected = ['seoul', 'gyeonggi', 'busan'];

const compareRows: CompareRow[] = [
  {
    id: 'far_redevelopment',
    label: '재개발 용적률 인센티브',
    subLabel: '최대 허용 용적률',
    tooltip: '재개발사업 시행 시 법정 용적률 대비 인센티브 포함 최대 허용 용적률입니다.',
    higherIsBetter: true,
    values: {
      seoul: { text: '최대 300%', numericValue: 300 },
      gyeonggi: { text: '최대 250%', numericValue: 250 },
      busan: { text: '최대 280%', numericValue: 280 },
      incheon: { text: '최대 270%', numericValue: 270 },
      daegu: { text: '최대 260%', numericValue: 260 },
      gwangju: { text: '최대 240%', numericValue: 240 },
    },
  },
  {
    id: 'far_reconstruction',
    label: '재건축 용적률',
    subLabel: '기준 용적률',
    tooltip: '재건축사업 기준 용적률 (인센티브 제외)입니다.',
    higherIsBetter: true,
    values: {
      seoul: { text: '최대 270%', numericValue: 270 },
      gyeonggi: { text: '최대 230%', numericValue: 230 },
      busan: { text: '최대 260%', numericValue: 260 },
      incheon: { text: '최대 250%', numericValue: 250 },
      daegu: { text: '최대 245%', numericValue: 245 },
      gwangju: { text: '최대 220%', numericValue: 220 },
    },
  },
  {
    id: 'building_coverage',
    label: '건폐율',
    subLabel: '최대 허용 건폐율',
    tooltip: '부지면적 대비 건축면적의 비율로, 낮을수록 쾌적한 환경이 조성됩니다.',
    higherIsBetter: false,
    values: {
      seoul: { text: '60% 이하', numericValue: 60 },
      gyeonggi: { text: '60% 이하', numericValue: 60 },
      busan: { text: '60% 이하', numericValue: 60 },
      incheon: { text: '60% 이하', numericValue: 60 },
      daegu: { text: '60% 이하', numericValue: 60 },
      gwangju: { text: '60% 이하', numericValue: 60 },
    },
  },
  {
    id: 'union_consent',
    label: '조합설립 동의율',
    subLabel: '토지 소유자 기준',
    tooltip: '조합 설립인가를 받기 위해 필요한 토지 소유자 동의 비율입니다.',
    higherIsBetter: false,
    values: {
      seoul: { text: '토지 3/4 이상', numericValue: 75 },
      gyeonggi: { text: '토지 3/4 이상', numericValue: 75 },
      busan: { text: '토지 3/4 이상', numericValue: 75 },
      incheon: { text: '토지 3/4 이상', numericValue: 75 },
      daegu: { text: '토지 4/5 이상', numericValue: 80 },
      gwangju: { text: '토지 3/4 이상', numericValue: 75 },
    },
  },
  {
    id: 'sale_application_period',
    label: '분양신청 기간',
    subLabel: '최소~최대 일수',
    tooltip: '관리처분계획 수립을 위한 분양신청 기간입니다.',
    higherIsBetter: true,
    values: {
      seoul: { text: '30~60일', numericValue: 60 },
      gyeonggi: { text: '30~60일', numericValue: 60 },
      busan: { text: '30일 이상', numericValue: 30, note: '상한 없음' },
      incheon: { text: '30~60일', numericValue: 60 },
      daegu: { text: '30~60일', numericValue: 60 },
      gwangju: { text: '30~45일', numericValue: 45 },
    },
  },
  {
    id: 'donation_ratio',
    label: '기부채납 비율',
    subLabel: '최대 기부채납 비율',
    tooltip: '사업 시행 시 공공에 제공해야 하는 토지·시설의 비율로, 낮을수록 사업자에게 유리합니다.',
    higherIsBetter: false,
    values: {
      seoul: { text: '10% 이하', numericValue: 10 },
      gyeonggi: { text: '8% 이하', numericValue: 8 },
      busan: { text: '9% 이하', numericValue: 9 },
      incheon: { text: '10% 이하', numericValue: 10 },
      daegu: { text: '9% 이하', numericValue: 9 },
      gwangju: { text: '7% 이하', numericValue: 7 },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Helper: compute best/worst for selected regions                      */
/* ------------------------------------------------------------------ */

function getCellClass(
  row: CompareRow,
  regionId: string,
  selectedIds: string[]
): { bg: string; icon: React.ReactNode | null; ariaLabel: string } {
  const values = selectedIds
    .map((id) => ({ id, val: row.values[id]?.numericValue }))
    .filter((v) => v.val !== undefined);

  if (values.length < 2) return { bg: '', icon: null, ariaLabel: '' };

  const nums = values.map((v) => v.val as number);
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const current = row.values[regionId]?.numericValue;

  if (current === undefined) return { bg: '', icon: null, ariaLabel: '' };

  const isBest = row.higherIsBetter ? current === max : current === min;
  const isWorst = row.higherIsBetter ? current === min : current === max;

  if (isBest && !isWorst) {
    return {
      bg: 'bg-success-50',
      icon: <TrendingUp size={14} className="text-success-600 shrink-0" aria-hidden="true" />,
      ariaLabel: '최고값',
    };
  }
  if (isWorst && !isBest) {
    return {
      bg: 'bg-danger-50',
      icon: <TrendingDown size={14} className="text-danger-500 shrink-0" aria-hidden="true" />,
      ariaLabel: '최저값',
    };
  }
  return { bg: '', icon: null, ariaLabel: '' };
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelected);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedRegions = allRegions.filter((r) => selectedIds.includes(r.id));
  const availableRegions = allRegions.filter((r) => !selectedIds.includes(r.id));

  const addRegion = (id: string) => {
    if (selectedIds.length >= 5) {
      setToastMsg('최대 5개 시/도까지 비교 가능합니다.');
      setTimeout(() => setToastMsg(null), 4000);
      return;
    }
    setSelectedIds((prev) => [...prev, id]);
  };

  const removeRegion = (id: string) => {
    setSelectedIds((prev) => prev.filter((r) => r !== id));
  };

  return (
    <div className="p-6 max-w-[1440px] relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm rounded-xl shadow-xl z-50"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} className="text-warning-400 shrink-0" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-950 tracking-tight">시도별 조례 비교</h1>
          <p className="text-sm text-neutral-500 mt-1">
            지역별 도시정비 조례 주요 항목을 나란히 비교합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            aria-label="Excel 다운로드"
          >
            <Download size={15} strokeWidth={1.5} />
            Excel
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            aria-label="PDF 출력"
          >
            <FileDown size={15} strokeWidth={1.5} />
            PDF
          </button>
        </div>
      </div>

      {/* Region Selector */}
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-neutral-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-neutral-700 shrink-0">비교 대상:</span>
          {selectedRegions.map((region) => (
            <span
              key={region.id}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary-100 text-primary-800 text-sm font-medium"
            >
              {region.name}
              <button
                onClick={() => removeRegion(region.id)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
                aria-label={`${region.name} 제거`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {availableRegions.length > 0 && selectedIds.length < 5 && (
            <div className="relative group">
              <button
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-dashed border-neutral-300 text-neutral-500 text-sm hover:border-primary-400 hover:text-primary-600 transition-colors"
                aria-label="시/도 추가"
              >
                <Plus size={14} />
                시/도 추가
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-20 min-w-[180px] hidden group-hover:block">
                {availableRegions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => addRegion(r.id)}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <span className="text-xs text-neutral-400 ml-auto">최대 5개</span>
        </div>
      </div>

      {/* Warning: less than 2 */}
      {selectedIds.length < 2 && (
        <div
          className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-warning-50 border border-warning-200 text-sm text-warning-700"
          role="alert"
        >
          <AlertCircle size={16} className="shrink-0" />
          비교를 위해 2개 이상의 시/도를 선택하세요.
        </div>
      )}

      {/* Comparison Table */}
      {selectedIds.length >= 1 && (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200">
          {/* Update status row */}
          <div className="border-b border-neutral-100 overflow-x-auto">
            <table className="w-full text-xs" aria-label="조례 최신화 상태">
              <tbody>
                <tr>
                  <td className="sticky left-0 bg-neutral-50 px-4 py-2 font-medium text-neutral-500 w-52 min-w-[208px] border-r border-neutral-100">
                    조례 최신화
                  </td>
                  {selectedRegions.map((region) => (
                    <td key={region.id} className="px-4 py-2 text-center min-w-[160px]">
                      <span className="font-mono text-neutral-400 mr-2">
                        {region.lastUpdated}
                      </span>
                      {region.isLatest ? (
                        <Badge variant="success">최신</Badge>
                      ) : (
                        <Badge variant="warning">업데이트 필요</Badge>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="시도별 조례 비교표">
              <caption className="sr-only">
                {selectedRegions.map((r) => r.name).join(', ')} 조례 비교
              </caption>
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th
                    scope="col"
                    className="sticky left-0 bg-neutral-50 px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-52 min-w-[208px] border-r border-neutral-200"
                  >
                    비교 항목
                  </th>
                  {selectedRegions.map((region) => (
                    <th
                      key={region.id}
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-semibold text-neutral-800 min-w-[160px]"
                    >
                      {region.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
                  >
                    {/* Label column */}
                    <th
                      scope="row"
                      className={`sticky left-0 px-4 py-4 text-left font-medium text-neutral-800 border-r border-neutral-100 ${
                        rowIdx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start gap-1">
                        <div>
                          <div className="text-sm">{row.label}</div>
                          {row.subLabel && (
                            <div className="text-xs text-neutral-400 mt-0.5">{row.subLabel}</div>
                          )}
                        </div>
                        <button
                          className="mt-0.5 text-neutral-300 hover:text-neutral-500 transition-colors"
                          title={row.tooltip}
                          aria-label={`${row.label} 설명: ${row.tooltip}`}
                        >
                          <HelpCircle size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </th>

                    {/* Value columns */}
                    {selectedRegions.map((region) => {
                      const cell = row.values[region.id];
                      const { bg, icon, ariaLabel } = getCellClass(row, region.id, selectedIds);

                      return (
                        <td
                          key={region.id}
                          className={`px-4 py-4 text-center text-sm ${bg} transition-colors`}
                          aria-label={
                            cell
                              ? `${region.name} ${row.label}: ${cell.text}${ariaLabel ? ` (${ariaLabel})` : ''}`
                              : `${region.name} ${row.label}: 준비 중`
                          }
                        >
                          {cell ? (
                            <div className="flex items-center justify-center gap-1.5">
                              {icon}
                              <span className="font-medium text-neutral-800">{cell.text}</span>
                              {cell.note && (
                                <span className="text-xs text-neutral-400">({cell.note})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-xs">준비 중</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-neutral-100 flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-success-600" />
              <span>최고값 (유리)</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown size={12} className="text-danger-500" />
              <span>최저값 (불리)</span>
            </div>
            <span className="ml-auto">항목별 최고/최저는 현재 선택된 지역 기준</span>
          </div>
        </div>
      )}
    </div>
  );
}

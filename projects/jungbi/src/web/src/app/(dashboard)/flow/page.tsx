'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  CheckCircle2,
  CircleDot,
  Circle,
  X,
  FileText,
  ExternalLink,
  CheckSquare,
  Square,
  Phone,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type NodeStatus = 'completed' | 'in_progress' | 'pending';

interface ProcedureNodeData {
  label: string;
  authority: string;
  legalBasis: string;
  date: string;
  status: NodeStatus;
  progress?: number;
  onNodeClick: (id: string) => void;
  id: string;
}

/* ------------------------------------------------------------------ */
/* Custom FlowchartNode                                                  */
/* ------------------------------------------------------------------ */

function FlowchartNode({ data }: NodeProps<ProcedureNodeData>) {
  const statusStyles: Record<NodeStatus, string> = {
    completed: 'bg-success-50 border-success-600 border-2',
    in_progress: 'bg-primary-50 border-primary-600 border-2 node-in-progress',
    pending: 'bg-white border-neutral-200 border',
  };

  const StatusIcon = () => {
    if (data.status === 'completed')
      return <CheckCircle2 size={18} className="text-success-600 shrink-0" strokeWidth={1.5} />;
    if (data.status === 'in_progress')
      return <CircleDot size={18} className="text-primary-600 shrink-0" strokeWidth={1.5} />;
    return <Circle size={18} className="text-neutral-400 shrink-0" strokeWidth={1.5} />;
  };

  const statusBadge: Record<NodeStatus, React.ReactNode> = {
    completed: <Badge variant="success">완료</Badge>,
    in_progress: <Badge variant="primary">진행중</Badge>,
    pending: <Badge variant="neutral">대기</Badge>,
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <button
        className={`w-72 rounded-xl p-4 text-left cursor-pointer transition-all duration-200 hover:shadow-md ${statusStyles[data.status]}`}
        onClick={() => data.onNodeClick(data.id)}
        aria-label={`${data.label}, ${data.status === 'completed' ? '완료' : data.status === 'in_progress' ? '진행중' : '대기'}`}
        role="button"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon />
            <span
              className={`font-semibold text-sm ${
                data.status === 'in_progress' ? 'text-primary-900' : 'text-neutral-800'
              }`}
            >
              {data.label}
            </span>
          </div>
          {statusBadge[data.status]}
        </div>
        <div className="text-xs text-neutral-500 space-y-0.5 pl-6">
          <div>소관: {data.authority}</div>
          <div>관련법: {data.legalBasis}</div>
          <div className="font-mono text-neutral-400">{data.date}</div>
        </div>
        {data.status === 'in_progress' && data.progress !== undefined && (
          <div className="mt-2 pl-6">
            <div className="w-full bg-primary-200 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all"
                style={{ width: `${data.progress}%` }}
                role="progressbar"
                aria-valuenow={data.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-xs text-primary-600 mt-0.5 block">{data.progress}% 완료</span>
          </div>
        )}
      </button>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Detail Panel                                                          */
/* ------------------------------------------------------------------ */

interface StageDetail {
  id: string;
  label: string;
  status: NodeStatus;
  expectedDate: string;
  laws: { name: string; href: string }[];
  documents: { name: string; done: boolean }[];
  authority: string;
  phone: string;
  avgDuration: string;
}

const stageDetails: Record<string, StageDetail> = {
  '1': {
    id: '1',
    label: '기본계획 수립',
    status: 'completed',
    expectedDate: '2023-11-20 (완료)',
    laws: [
      { name: '도시정비법 제4조', href: '#' },
      { name: '동법 시행령 제5조', href: '#' },
    ],
    documents: [
      { name: '기본계획 수립 보고서', done: true },
      { name: '주민 의견 청취 결과', done: true },
      { name: '관련 기관 협의 공문', done: true },
    ],
    authority: '서울특별시 도시재생실',
    phone: '02-2133-XXXX',
    avgDuration: '평균 6개월 (최소 4개월 ~ 최대 12개월)',
  },
  '5': {
    id: '5',
    label: '사업시행계획인가',
    status: 'in_progress',
    expectedDate: '2025-08-30 (예정)',
    laws: [
      { name: '도시정비법 제50조', href: '#' },
      { name: '동법 시행령 제44조', href: '#' },
    ],
    documents: [
      { name: '사업시행계획서', done: true },
      { name: '정관', done: true },
      { name: '토지·건물 조서', done: false },
      { name: '분양신청 결과 보고서', done: false },
    ],
    authority: '서울특별시 성동구청 도시계획과',
    phone: '02-2286-XXXX',
    avgDuration: '평균 14.2개월 (최소 9개월 ~ 최대 22개월)',
  },
};

const defaultDetail: StageDetail = {
  id: '',
  label: '',
  status: 'pending',
  expectedDate: '미정',
  laws: [],
  documents: [],
  authority: '-',
  phone: '-',
  avgDuration: '-',
};

function DetailPanel({ stageId, onClose }: { stageId: string; onClose: () => void }) {
  const detail = stageDetails[stageId] ?? {
    ...defaultDetail,
    label: nodesData.find((n) => n.id === stageId)?.label ?? '단계 정보',
    id: stageId,
  };

  return (
    <aside
      className="w-[360px] shrink-0 bg-white border-l border-neutral-200 flex flex-col overflow-hidden"
      style={{ boxShadow: 'var(--shadow-lg)' }}
      role="dialog"
      aria-label={`${detail.label} 상세 정보`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-100">
        <div>
          <h3 className="font-bold text-neutral-900 text-base">{detail.label}</h3>
          <div className="mt-1">
            {detail.status === 'completed' && <Badge variant="success">완료</Badge>}
            {detail.status === 'in_progress' && <Badge variant="primary">진행중</Badge>}
            {detail.status === 'pending' && <Badge variant="neutral">대기</Badge>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="패널 닫기"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Expected date */}
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-neutral-400 shrink-0" strokeWidth={1.5} />
          <span className="text-neutral-500">예상 완료:</span>
          <span className="font-medium text-neutral-800">{detail.expectedDate}</span>
        </div>

        {/* Laws */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            관련 법령
          </h4>
          <ul className="space-y-1">
            {detail.laws.length > 0 ? detail.laws.map((law) => (
              <li key={law.name}>
                <a
                  href={law.href}
                  className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <FileText size={13} strokeWidth={1.5} />
                  {law.name}
                  <ExternalLink size={12} />
                </a>
              </li>
            )) : (
              <li className="text-sm text-neutral-400">관련 법령 정보 없음</li>
            )}
          </ul>
        </div>

        {/* Documents */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            필요 서류 체크리스트
          </h4>
          <ul className="space-y-1.5">
            {detail.documents.length > 0 ? detail.documents.map((doc) => (
              <li key={doc.name} className="flex items-center gap-2 text-sm">
                {doc.done ? (
                  <CheckSquare size={16} className="text-success-600 shrink-0" strokeWidth={1.5} />
                ) : (
                  <Square size={16} className="text-neutral-400 shrink-0" strokeWidth={1.5} />
                )}
                <span className={doc.done ? 'text-neutral-500 line-through' : 'text-neutral-800'}>
                  {doc.name}
                </span>
                {!doc.done && (
                  <span className="text-xs text-danger-600 ml-auto shrink-0">미제출</span>
                )}
              </li>
            )) : (
              <li className="text-sm text-neutral-400">서류 정보 없음</li>
            )}
          </ul>
        </div>

        {/* Authority */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            담당 행정 기관
          </h4>
          <p className="text-sm text-neutral-800">{detail.authority}</p>
          {detail.phone !== '-' && (
            <a
              href={`tel:${detail.phone}`}
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-1"
            >
              <Phone size={13} strokeWidth={1.5} />
              {detail.phone}
            </a>
          )}
        </div>

        {/* Duration */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            유사 사례 소요 기간
          </h4>
          <p className="text-sm text-neutral-700 bg-primary-50 px-3 py-2 rounded-lg">
            {detail.avgDuration}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-100 flex gap-2">
        <button className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          일정 추가
        </button>
        <button className="flex-1 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
          관련 법령 보기
        </button>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Flow Data                                                             */
/* ------------------------------------------------------------------ */

interface ProcedureItem {
  id: string;
  label: string;
  authority: string;
  legalBasis: string;
  date: string;
  status: NodeStatus;
  progress?: number;
}

const nodesData: ProcedureItem[] = [
  { id: '1', label: '기본계획 수립', authority: '시·도지사', legalBasis: '도시정비법 제4조', date: '2023-11-20', status: 'completed' },
  { id: '2', label: '정비구역 지정', authority: '시·도지사', legalBasis: '도시정비법 제8조', date: '2024-03-15', status: 'completed' },
  { id: '3', label: '추진위원회 구성', authority: '시장·군수', legalBasis: '도시정비법 제31조', date: '2024-06-20', status: 'completed' },
  { id: '4', label: '조합설립인가', authority: '시장·군수', legalBasis: '도시정비법 제35조', date: '2024-11-10', status: 'completed' },
  { id: '5', label: '사업시행계획인가', authority: '시장·군수', legalBasis: '도시정비법 제50조', date: '2025-08-30 예정', status: 'in_progress', progress: 67 },
  { id: '6', label: '관리처분계획인가', authority: '시장·군수', legalBasis: '도시정비법 제74조', date: '2026-04 예정', status: 'pending' },
  { id: '7', label: '이주 및 철거', authority: '조합', legalBasis: '도시정비법 제81조', date: '미정', status: 'pending' },
  { id: '8', label: '착공 및 시공', authority: '시공사', legalBasis: '건설업법 제21조', date: '미정', status: 'pending' },
  { id: '9', label: '준공인가', authority: '시장·군수', legalBasis: '도시정비법 제83조', date: '미정', status: 'pending' },
  { id: '10', label: '이전고시 및 청산', authority: '시장·군수', legalBasis: '도시정비법 제86조', date: '미정', status: 'pending' },
];

const NODE_X = 200;
const NODE_Y_START = 20;
const NODE_Y_GAP = 160;

function buildNodes(
  items: ProcedureItem[],
  onNodeClick: (id: string) => void
): Node<ProcedureNodeData>[] {
  return items.map((item, index) => ({
    id: item.id,
    type: 'procedureNode',
    position: { x: NODE_X, y: NODE_Y_START + index * NODE_Y_GAP },
    data: {
      ...item,
      onNodeClick,
    },
    draggable: false,
  }));
}

function buildEdges(items: ProcedureItem[]): Edge[] {
  return items.slice(0, -1).map((item, index) => {
    const next = items[index + 1];
    const bothCompleted = item.status === 'completed' && next.status === 'completed';
    const completedToProgress = item.status === 'completed' && next.status === 'in_progress';

    // Hex values aligned with design tokens: success-600, primary-600, neutral-300
    let strokeColor = '#D1D5DB';
    let strokeWidth = 1;
    let strokeDasharray: string | undefined = '5 5';

    if (bothCompleted) {
      strokeColor = '#16A34A';
      strokeWidth = 2;
      strokeDasharray = undefined;
    } else if (completedToProgress) {
      strokeColor = '#1E5799';
      strokeWidth = 2;
      strokeDasharray = undefined;
    }

    return {
      id: `e${item.id}-${next.id}`,
      source: item.id,
      target: next.id,
      style: { stroke: strokeColor, strokeWidth, strokeDasharray },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 16,
        height: 16,
      },
    };
  });
}

const nodeTypes = { procedureNode: FlowchartNode };

const tabs = ['재개발', '재건축', '소규모정비', '모아주택'] as const;
type TabType = (typeof tabs)[number];

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export default function FlowPage() {
  const [activeTab, setActiveTab] = useState<TabType>('재개발');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode((prev) => (prev === id ? null : id));
  }, []);

  const initialNodes = useMemo(() => buildNodes(nodesData, handleNodeClick), [handleNodeClick]);
  const initialEdges = useMemo(() => buildEdges(nodesData), []);

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-neutral-950 tracking-tight">절차 플로우차트</h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-1" role="tablist" aria-label="사업 유형 선택">
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedNode(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Flow Canvas */}
        <div className="flex-1" role="tabpanel" aria-label={`${activeTab} 절차 플로우차트`}>
          {activeTab === '재개발' ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.5}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#E5E7EB" gap={24} />
              <Controls
                showInteractive={false}
                aria-label="줌 컨트롤"
              />
              <MiniMap
                nodeColor={(node) => {
                  const d = node.data as ProcedureNodeData;
                  if (d.status === 'completed') return '#16A34A';
                  if (d.status === 'in_progress') return '#1E5799';
                  return '#D1D5DB';
                }}
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                ariaLabel="플로우차트 미니맵"
              />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                <Circle size={48} className="mx-auto mb-3 text-neutral-300" strokeWidth={1} />
                <p className="text-base font-medium text-neutral-500">
                  {activeTab} 절차 데이터를 준비 중입니다.
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  재개발 탭을 선택하면 절차 플로우차트를 확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <DetailPanel
            stageId={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
        {!selectedNode && (
          <div className="w-[280px] shrink-0 border-l border-neutral-100 bg-neutral-50/50 flex flex-col items-center justify-center p-6 text-center">
            <ChevronRight size={32} className="text-neutral-300 mb-3" strokeWidth={1} />
            <p className="text-sm text-neutral-400 font-medium">노드를 클릭하면</p>
            <p className="text-sm text-neutral-400">단계 상세 정보가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

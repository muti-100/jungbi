'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { FlowchartNodeComponent, type FlowchartNodeData } from './FlowchartNode'
import type { ProcedureTemplate, ProjectProgress } from '@/types'

const nodeTypes: NodeTypes = {
  procedureStep: FlowchartNodeComponent,
}

export interface ProcedureFlowchartProps {
  templates: ProcedureTemplate[]
  progress?: ProjectProgress[]
  onStageClick?: (stageCode: string) => void
}

const NODE_WIDTH = 288
const NODE_HEIGHT = 100
const H_GAP = 48
const V_GAP = 80

function buildNodes(
  templates: ProcedureTemplate[],
  progress: ProjectProgress[],
  onStageClick?: (stageCode: string) => void
): Node<FlowchartNodeData>[] {
  const progressMap = new Map(progress.map((p) => [p.stage_code, p]))

  return templates
    .slice()
    .sort((a, b) => a.sequence_order - b.sequence_order)
    .map((t, idx) => {
      const prog = progressMap.get(t.stage_code)
      const status = prog?.status ?? 'pending'

      return {
        id: t.stage_code,
        type: 'procedureStep',
        position: {
          x: t.node_x ?? (t.is_parallel ? (NODE_WIDTH + H_GAP) * 1 : 0),
          y: t.node_y ?? idx * (NODE_HEIGHT + V_GAP),
        },
        data: {
          stageCode: t.stage_code,
          stageName: t.stage_name,
          status: status as FlowchartNodeData['status'],
          legalBasis: t.legal_basis,
          completedAt: prog?.completed_at ?? null,
          legalDeadline: prog?.legal_deadline ?? null,
          onClick: onStageClick,
        },
        draggable: false,
      }
    })
}

function buildEdges(templates: ProcedureTemplate[], progress: ProjectProgress[]): Edge[] {
  const progressMap = new Map(progress.map((p) => [p.stage_code, p]))
  const sorted = templates.slice().sort((a, b) => a.sequence_order - b.sequence_order)

  return sorted.slice(1).map((t, idx) => {
    const prevTemplate = sorted[idx]
    const prevStatus = progressMap.get(prevTemplate.stage_code)?.status ?? 'pending'
    const currStatus = progressMap.get(t.stage_code)?.status ?? 'pending'

    let stroke = '#D1D5DB' // neutral-300, dashed
    let strokeDasharray = '4 4'
    let animated = false

    if (prevStatus === 'completed' && currStatus === 'completed') {
      stroke = '#16A34A' // success-600
      strokeDasharray = 'none'
    } else if (prevStatus === 'completed' && currStatus === 'in_progress') {
      stroke = '#1E5799' // primary-600
      strokeDasharray = 'none'
      animated = true
    }

    const source = t.parent_stage_code ?? prevTemplate.stage_code

    return {
      id: `e-${source}-${t.stage_code}`,
      source,
      target: t.stage_code,
      animated,
      style: { stroke, strokeWidth: 2, strokeDasharray },
    }
  })
}

export function ProcedureFlowchart({
  templates,
  progress = [],
  onStageClick,
}: ProcedureFlowchartProps) {
  const initialNodes = useMemo(
    () => buildNodes(templates, progress, onStageClick),
    [templates, progress, onStageClick]
  )
  const initialEdges = useMemo(
    () => buildEdges(templates, progress),
    [templates, progress]
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onInit = useCallback((instance: import('reactflow').ReactFlowInstance) => {
    instance.fitView({ padding: 0.2 })
  }, [])

  return (
    <div className="w-full h-full min-h-[600px] rounded-lg border border-neutral-200 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        minZoom={0.5}
        maxZoom={1.5}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} color="#E5E7EB" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as FlowchartNodeData
            if (data.status === 'completed') return '#16A34A'
            if (data.status === 'in_progress') return '#1E5799'
            return '#9CA3AF'
          }}
          maskColor="rgba(0,0,0,0.05)"
          style={{ width: 140, height: 100 }}
        />
      </ReactFlow>
    </div>
  )
}

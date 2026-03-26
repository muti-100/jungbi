'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { CheckCircle, Circle, CircleDot, Lock, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProgressStatus } from '@/types'

export interface FlowchartNodeData {
  stageCode: string
  stageName: string
  status: ProgressStatus | 'locked'
  legalBasis?: string[]
  authority?: string
  completedAt?: string | null
  legalDeadline?: string | null
  onClick?: (stageCode: string) => void
}

const STATUS_CONFIG: Record<
  ProgressStatus | 'locked',
  {
    icon: LucideIcon
    containerCls: string
    iconCls: string
    label: string
  }
> = {
  completed: {
    icon: CheckCircle,
    containerCls: 'bg-success-100 border-success-600',
    iconCls: 'text-success-600',
    label: '완료',
  },
  in_progress: {
    icon: CircleDot,
    containerCls: 'bg-primary-050 border-primary-600 border-2 node-in-progress',
    iconCls: 'text-primary-600',
    label: '진행중',
  },
  pending: {
    icon: Circle,
    containerCls: 'bg-white border-neutral-200',
    iconCls: 'text-neutral-400',
    label: '대기',
  },
  skipped: {
    icon: Circle,
    containerCls: 'bg-neutral-50 border-neutral-200',
    iconCls: 'text-neutral-300',
    label: '건너뜀',
  },
  blocked: {
    icon: Lock,
    containerCls: 'bg-neutral-100 border-neutral-300 border-dashed',
    iconCls: 'text-neutral-400',
    label: '불가',
  },
  locked: {
    icon: Lock,
    containerCls: 'bg-neutral-100 border-neutral-300 border-dashed',
    iconCls: 'text-neutral-400',
    label: '조건 미충족',
  },
}

export const FlowchartNodeComponent = memo(function FlowchartNode({
  data,
  selected,
}: NodeProps<FlowchartNodeData>) {
  const config = STATUS_CONFIG[data.status]
  const StatusIcon = config.icon

  return (
    <button
      type="button"
      onClick={() => data.onClick?.(data.stageCode)}
      aria-label={`${data.stageName}, ${config.label}`}
      className={cn(
        'w-72 px-4 py-3 rounded-lg border text-left transition-shadow duration-150',
        'focus-visible:outline-2 focus-visible:outline-primary-600',
        config.containerCls,
        selected && 'ring-2 ring-primary-600 ring-offset-2'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-neutral-300" />

      <div className="flex items-start gap-3">
        <StatusIcon
          size={18}
          className={cn('mt-0.5 shrink-0', config.iconCls)}
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-800 truncate">{data.stageName}</p>
            <span
              className={cn(
                'text-xs font-medium shrink-0 px-1.5 py-0.5 rounded-sm',
                data.status === 'completed' && 'text-success-600 bg-success-100',
                data.status === 'in_progress' && 'text-primary-600 bg-primary-100',
                data.status === 'pending' && 'text-neutral-400 bg-neutral-100',
                (data.status === 'blocked' || data.status === 'locked') && 'text-neutral-400 bg-neutral-100',
              )}
            >
              {config.label}
            </span>
          </div>

          {data.authority && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate">소관: {data.authority}</p>
          )}

          {data.legalBasis && data.legalBasis.length > 0 && (
            <p className="text-xs text-neutral-400 mt-1 truncate font-mono">
              {data.legalBasis[0]}
            </p>
          )}

          {(data.completedAt || data.legalDeadline) && (
            <p className={cn(
              'text-xs mt-1',
              data.status === 'completed' ? 'text-success-600' : 'text-neutral-500'
            )}>
              {data.status === 'completed' ? data.completedAt : data.legalDeadline}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-neutral-300" />
    </button>
  )
})

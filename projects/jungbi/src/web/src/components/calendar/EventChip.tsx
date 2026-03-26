import { cn } from '@/lib/utils'
import { formatDday } from '@/lib/utils'
import type { EventType } from '@/types'

export interface EventChipProps {
  title: string
  eventType: EventType
  startAt: string
  className?: string
}

const EVENT_TYPE_CLASSES: Record<EventType, string> = {
  legal_deadline: 'bg-danger-600 text-white',
  meeting:        'bg-primary-600 text-white',
  submission:     'bg-warning-600 text-white',
  notification:   'bg-info-600 text-white',
  custom:         'bg-neutral-200 text-neutral-700',
}

export function EventChip({ title, eventType, startAt, className }: EventChipProps) {
  const dday = formatDday(startAt)
  const isUrgent = dday.startsWith('D-') && parseInt(dday.slice(2)) <= 7

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-1.5 h-5 rounded-sm text-xs truncate max-w-full',
        EVENT_TYPE_CLASSES[eventType],
        className
      )}
      title={`${title} (${dday})`}
    >
      <span className="truncate">{title}</span>
      {isUrgent && (
        <span className="shrink-0 font-bold text-[10px]">{dday}</span>
      )}
    </div>
  )
}

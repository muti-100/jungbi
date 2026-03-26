import type { LucideIcon } from 'lucide-react'

export * from './database'

// UI-layer types (not persisted in DB)
export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: Omit<NavItem, 'children' | 'icon'>[]
  badge?: number | null
}

export interface KpiCardData {
  label: string
  value: string | number
  description: string
  trend?: 'up' | 'down' | 'neutral'
  urgent?: boolean
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumb?: { label: string; href?: string }[]
}

export interface ApiError {
  error: {
    code: string
    message: string
    request_id: string
  }
}

export type ProjectTypeLabel = {
  value: import('./database').ProjectType
  label: string
  short: string
  color: string
}

export const PROJECT_TYPE_LABELS: ProjectTypeLabel[] = [
  { value: 'redevelopment', label: '재개발', short: '재개발', color: 'bg-primary-600 text-white' },
  { value: 'reconstruction', label: '재건축', short: '재건축', color: 'bg-info-600 text-white' },
  { value: 'small_scale', label: '소규모정비', short: '소규모', color: 'bg-success-600 text-white' },
  { value: 'moa', label: '모아주택', short: '모아', color: 'bg-accent-600 text-white' },
]

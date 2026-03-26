// TypeScript types matching the Jungbi DB schema (Supabase PostgreSQL 15)
// Auto-generated from plan.md — keep in sync with migration files

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type OrganizationType =
  | 'association'
  | 'management_company'
  | 'consulting'
  | 'gov'
  | 'law_firm'
  | 'constructor'
export type ProjectType = 'redevelopment' | 'reconstruction' | 'small_scale' | 'moa'
export type MemberRole = 'owner' | 'admin' | 'manager' | 'viewer'
export type ProgressStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'
export type LawType = 'national_law' | 'presidential_decree' | 'ordinance' | 'guideline'
export type ChangeType = 'amendment' | 'repeal' | 'new_enactment' | 'partial_change'
export type EventType = 'legal_deadline' | 'custom' | 'meeting' | 'submission' | 'notification'
export type NotificationType = 'law_change' | 'deadline_reminder' | 'checklist' | 'member_activity' | 'system'
export type ChecklistSource = 'template' | 'user'

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  project_type: ProjectType | null
  region: string | null
  district: string | null
  address: string | null
  registration_number: string | null
  established_at: string | null // ISO date
  current_stage: string | null
  subscription_tier: SubscriptionTier
  subscription_expires_at: string | null // ISO timestamptz
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: MemberRole
  invited_by: string | null
  joined_at: string
}

export interface ProcedureTemplate {
  id: string
  project_type: ProjectType
  stage_code: string
  stage_name: string
  stage_name_en: string | null
  sequence_order: number
  description: string | null
  legal_basis: string[]
  typical_duration_months: number | null
  legal_deadline_rule: string | null
  required_consent_rate: number | null
  required_documents: string[]
  node_x: number | null
  node_y: number | null
  is_parallel: boolean
  parent_stage_code: string | null
  created_at: string
  updated_at: string
}

export interface ProjectProgress {
  id: string
  organization_id: string
  stage_code: string
  project_type: ProjectType
  status: ProgressStatus
  started_at: string | null
  completed_at: string | null
  legal_deadline: string | null // ISO date
  notes: string | null
  completed_by: string | null
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  organization_id: string
  stage_code: string
  title: string
  is_completed: boolean
  completed_by: string | null
  completed_at: string | null
  is_required: boolean
  source: ChecklistSource
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  organization_id: string
  stage_code: string | null
  file_name: string
  file_path: string // Supabase Storage path
  file_size_bytes: number | null
  mime_type: string | null
  description: string | null
  uploaded_by: string
  created_at: string
}

export interface Law {
  id: string
  law_code: string
  name: string
  short_name: string | null
  law_type: LawType
  applicable_types: ProjectType[]
  region: string | null // null = national
  source_url: string | null
  last_amended_at: string | null // ISO date
  effective_at: string | null
  version: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LawArticle {
  id: string
  law_id: string
  article_number: string // e.g. '제31조'
  title: string | null
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface LawChangeLog {
  id: string
  law_id: string
  change_type: ChangeType
  changed_at: string // ISO date
  summary: string | null
  affected_articles: string[]
  source_url: string | null
  notified: boolean
  created_at: string
}

export interface OrdinanceComparison {
  id: string
  region: string
  project_type: ProjectType
  item_key: string
  item_name: string
  value: string | null
  unit: string | null
  basis_article: string | null
  last_verified_at: string | null
  updated_at: string
}

export interface CalendarEvent {
  id: string
  organization_id: string
  title: string
  event_type: EventType
  stage_code: string | null
  start_at: string // ISO timestamptz
  end_at: string | null
  is_all_day: boolean
  description: string | null
  is_auto_generated: boolean
  law_basis: string | null
  reminder_days: number[]
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  organization_id: string | null
  type: NotificationType
  title: string
  body: string | null
  is_read: boolean
  action_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Case {
  id: string
  title: string
  project_type: ProjectType
  region: string | null
  stage_code: string | null
  summary: string | null
  full_content: string | null
  outcome: string | null
  tags: string[]
  source: string | null
  // embedding: vector(1536) — not surfaced in TS client
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string
  user_id: string | null
  action: string // e.g. 'checklist.complete'
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

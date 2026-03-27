-- Jungbi (정비나라) Initial Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- organizations
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('association','management_company','consulting','gov','law_firm','constructor')),
  project_type  TEXT,
  region        TEXT,
  district      TEXT,
  address       TEXT,
  registration_number TEXT,
  established_at DATE,
  current_stage TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','pro','enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- organization_members
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner','admin','manager','viewer')),
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- procedure_templates (master data)
CREATE TABLE procedure_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type    TEXT NOT NULL,
  stage_code      TEXT NOT NULL,
  stage_name      TEXT NOT NULL,
  stage_name_en   TEXT,
  sequence_order  INTEGER NOT NULL,
  description     TEXT,
  legal_basis     TEXT[],
  typical_duration_months INT,
  legal_deadline_rule TEXT,
  required_consent_rate NUMERIC(5,2),
  required_documents TEXT[],
  node_x          NUMERIC,
  node_y          NUMERIC,
  is_parallel     BOOLEAN DEFAULT FALSE,
  parent_stage_code TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_type, stage_code)
);

-- project_progress
CREATE TABLE project_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_code      TEXT NOT NULL,
  project_type    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','skipped','blocked')),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  legal_deadline  DATE,
  notes           TEXT,
  completed_by    UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, stage_code)
);

-- checklist_items
CREATE TABLE checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_code      TEXT NOT NULL,
  title           TEXT NOT NULL,
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_by    UUID REFERENCES auth.users(id),
  completed_at    TIMESTAMPTZ,
  is_required     BOOLEAN DEFAULT TRUE,
  source          TEXT DEFAULT 'user' CHECK (source IN ('template','user')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- documents
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_code      TEXT,
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type       TEXT,
  description     TEXT,
  uploaded_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- laws
CREATE TABLE laws (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_code        TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  short_name      TEXT,
  law_type        TEXT NOT NULL CHECK (law_type IN ('national_law','presidential_decree','ordinance','guideline')),
  applicable_types TEXT[],
  region          TEXT,
  source_url      TEXT,
  last_amended_at DATE,
  effective_at    DATE,
  version         TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- law_articles
CREATE TABLE law_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_id          UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  article_number  TEXT NOT NULL,
  title           TEXT,
  content         TEXT NOT NULL,
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- law_change_logs
CREATE TABLE law_change_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  law_id          UUID NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
  change_type     TEXT NOT NULL CHECK (change_type IN ('amendment','repeal','new_enactment','partial_change')),
  changed_at      DATE NOT NULL,
  summary         TEXT,
  affected_articles TEXT[],
  source_url      TEXT,
  notified        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ordinance_comparison
CREATE TABLE ordinance_comparison (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region          TEXT NOT NULL,
  project_type    TEXT NOT NULL,
  item_key        TEXT NOT NULL,
  item_name       TEXT NOT NULL,
  value           TEXT,
  unit            TEXT,
  basis_article   TEXT,
  last_verified_at DATE,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (region, project_type, item_key)
);

-- calendar_events
CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN ('legal_deadline','custom','meeting','submission','notification')),
  stage_code      TEXT,
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ,
  is_all_day      BOOLEAN DEFAULT FALSE,
  description     TEXT,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  law_basis       TEXT,
  reminder_days   INTEGER[],
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- notifications
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('law_change','deadline_reminder','checklist','member_activity','system')),
  title           TEXT NOT NULL,
  body            TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  action_url      TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- cases
CREATE TABLE cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  project_type    TEXT NOT NULL,
  region          TEXT,
  stage_code      TEXT,
  summary         TEXT,
  full_content    TEXT,
  outcome         TEXT,
  tags            TEXT[],
  source          TEXT,
  embedding       vector(1536),
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON cases USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- activity_logs
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  resource_type   TEXT,
  resource_id     UUID,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- updated_at auto-trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'organizations', 'procedure_templates', 'project_progress',
    'checklist_items', 'laws', 'law_articles', 'ordinance_comparison',
    'calendar_events'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t
    );
  END LOOP;
END;
$$;

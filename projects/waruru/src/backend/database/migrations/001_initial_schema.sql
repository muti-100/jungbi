-- ============================================================
-- Waruru — Initial Schema Migration
-- Requires: PostgreSQL 15.6 with PostGIS and pgvector extensions
-- Run: psql $DATABASE_URL -f 001_initial_schema.sql
-- ============================================================

BEGIN;

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone             VARCHAR(20) UNIQUE NOT NULL,
  -- Big Five personality vector: [Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism]
  -- Each dimension 0.0–1.0; populated after onboarding quiz
  big_five_vector   vector(5),
  interests         TEXT[],
  location_point    GEOMETRY(POINT, 4326),
  kyc_verified      BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── Venues ────────────────────────────────────────────────────────────────────
-- Scoped to 5 Seoul districts for launch: 마포, 성동, 강남, 용산, 송파
CREATE TABLE IF NOT EXISTS venues (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100) NOT NULL,
  category       VARCHAR(50),   -- 'cafe', 'restaurant', 'bar', 'activity'
  location_point GEOMETRY(POINT, 4326) NOT NULL,
  district       VARCHAR(20)  CHECK (district IN ('마포', '성동', '강남', '용산', '송파')),
  open_hours     JSONB,         -- { "mon": "09:00-22:00", ... }
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── Matches ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id     UUID        REFERENCES venues(id) ON DELETE SET NULL,
  -- Status lifecycle: pending → venue_assigned → arrived → completed | cancelled
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'venue_assigned', 'arrived', 'completed', 'cancelled')),
  ab_variant   VARCHAR(20) CHECK (ab_variant IN ('control', 'v2_weighted')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- A user should not be in two active matches simultaneously
  CONSTRAINT no_self_match CHECK (user_a_id <> user_b_id)
);

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── Arrival Events ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arrival_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     UUID        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  method       VARCHAR(20) NOT NULL
               CHECK (method IN ('ble', 'gps_fallback', 'manual')),
  rssi         INTEGER,    -- dBm; NULL when method = 'gps_fallback' or 'manual'
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One confirmation event per user per match (idempotent)
  UNIQUE (match_id, user_id)
);

-- ── Rolling Papers ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rolling_papers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id      UUID        NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  message       TEXT        NOT NULL CHECK (char_length(message) <= 200),
  figurine_url  TEXT,       -- populated asynchronously by Python AI sidecar
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One rolling paper per match (UNIQUE covers the table-level constraint)
  UNIQUE (match_id, author_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Users
CREATE INDEX IF NOT EXISTS idx_users_kyc ON users(kyc_verified);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location_point);

-- Venues
CREATE INDEX IF NOT EXISTS idx_venues_district ON venues(district);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_venues_category ON venues(category);

-- Matches
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- Arrival events
CREATE INDEX IF NOT EXISTS idx_arrival_match ON arrival_events(match_id);

-- Rolling papers
CREATE INDEX IF NOT EXISTS idx_rolling_paper_match ON rolling_papers(match_id);

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- Enable RLS so Supabase direct-DB clients only see their own rows.
-- The NestJS backend uses the service-role key and bypasses RLS.

ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrival_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rolling_papers ENABLE ROW LEVEL SECURITY;

-- Example policy: users can only read their own record
CREATE POLICY users_self_select ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY matches_participant_select ON matches
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY arrival_participant_select ON arrival_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY rolling_paper_participant_select ON rolling_papers
  FOR SELECT
  USING (
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT user_a_id FROM matches WHERE id = match_id
      UNION
      SELECT user_b_id FROM matches WHERE id = match_id
    )
  );

COMMIT;

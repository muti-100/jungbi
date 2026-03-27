-- LTV/loan regulation data
CREATE TABLE loan_regulations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_type     TEXT NOT NULL CHECK (region_type IN ('seoul','metropolitan','local','speculative_overheating','land_transaction_permit')),
  region_label    TEXT NOT NULL,
  housing_count   TEXT NOT NULL CHECK (housing_count IN ('first','second','multi')),
  housing_label   TEXT NOT NULL,
  ltv_rate        NUMERIC(5,2),
  dti_rate        NUMERIC(5,2),
  dsr_rate        NUMERIC(5,2),
  loan_limit      TEXT,
  notes           TEXT,
  effective_date  DATE,
  source_law      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON loan_regulations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE loan_regulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loan_regulations_public_read" ON loan_regulations FOR SELECT USING (true);

-- Tax rates and benefits
CREATE TABLE tax_info (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_type        TEXT NOT NULL CHECK (tax_type IN ('acquisition','gift','inheritance','comprehensive_real_estate','transfer_income','registration')),
  tax_label       TEXT NOT NULL,
  category        TEXT NOT NULL,
  condition_desc  TEXT NOT NULL,
  rate            TEXT NOT NULL,
  deduction       TEXT,
  benefit_desc    TEXT,
  benefit_conditions TEXT,
  region_scope    TEXT,
  housing_count   TEXT,
  effective_date  DATE,
  source_law      TEXT,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tax_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE tax_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tax_info_public_read" ON tax_info FOR SELECT USING (true);

-- Q&A posts
CREATE TABLE qna_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name     TEXT NOT NULL,
  author_type     TEXT NOT NULL DEFAULT 'user' CHECK (author_type IN ('user','lawyer','admin')),
  category        TEXT NOT NULL CHECK (category IN ('loan','tax','procedure','law','general')),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  is_public       BOOLEAN DEFAULT TRUE,
  is_resolved     BOOLEAN DEFAULT FALSE,
  view_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON qna_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE qna_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qna_posts_public_read" ON qna_posts FOR SELECT USING (is_public = true);
CREATE POLICY "qna_posts_author_manage" ON qna_posts FOR ALL USING (author_id = auth.uid());

-- Q&A answers (lawyer opinions with fees)
CREATE TABLE qna_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES qna_posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name     TEXT NOT NULL,
  author_type     TEXT NOT NULL DEFAULT 'user' CHECK (author_type IN ('user','lawyer','admin')),
  content         TEXT NOT NULL,
  is_accepted     BOOLEAN DEFAULT FALSE,
  is_opinion      BOOLEAN DEFAULT FALSE,
  fee_amount      INTEGER,
  fee_status      TEXT CHECK (fee_status IN ('pending','paid','refunded')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON qna_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE qna_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qna_answers_public_read" ON qna_answers FOR SELECT USING (true);
CREATE POLICY "qna_answers_author_manage" ON qna_answers FOR ALL USING (author_id = auth.uid());

-- Lawyer profiles
CREATE TABLE lawyer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name            TEXT NOT NULL,
  license_number  TEXT,
  firm_name       TEXT,
  specialties     TEXT[],
  bio             TEXT,
  consultation_fee INTEGER,
  opinion_fee     INTEGER,
  is_verified     BOOLEAN DEFAULT FALSE,
  total_answers   INTEGER DEFAULT 0,
  rating          NUMERIC(3,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON lawyer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lawyer_profiles_public_read" ON lawyer_profiles FOR SELECT USING (is_verified = true);
CREATE POLICY "lawyer_profiles_owner_manage" ON lawyer_profiles FOR ALL USING (user_id = auth.uid());

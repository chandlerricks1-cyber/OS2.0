-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Intake sessions
CREATE TABLE intake_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'in_progress'
                 CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Intake messages
CREATE TABLE intake_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_intake_messages_session ON intake_messages(session_id, created_at);

-- Business metrics
CREATE TABLE business_metrics (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cac                          NUMERIC(12,2),
  ltv                          NUMERIC(12,2),
  ltv_cac_ratio                NUMERIC(8,4),
  gross_profit_per_customer    NUMERIC(12,2),
  cash_collected_first_30_days NUMERIC(12,2),
  monthly_revenue              NUMERIC(12,2),
  monthly_new_customers        INTEGER,
  close_rate                   NUMERIC(5,4),
  cac_payback_months           NUMERIC(8,2),
  required_30_day_revenue      NUMERIC(12,2),
  extraction_confidence        JSONB,
  raw_extraction               JSONB,
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Reports
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  model_version TEXT,
  UNIQUE(user_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id        TEXT,
  status                 TEXT NOT NULL DEFAULT 'inactive'
                           CHECK (status IN ('active','inactive','past_due','canceled','trialing')),
  plan_type              TEXT CHECK (plan_type IN ('monthly', 'one_time')),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Client tags
CREATE TABLE client_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;

-- Profiles: clients see only their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Intake sessions
CREATE POLICY "Users can view own sessions" ON intake_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON intake_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON intake_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Intake messages
CREATE POLICY "Users can view own messages" ON intake_messages FOR SELECT
  USING (session_id IN (SELECT id FROM intake_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own messages" ON intake_messages FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM intake_sessions WHERE user_id = auth.uid()));

-- Business metrics
CREATE POLICY "Users can view own metrics" ON business_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON business_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metrics" ON business_metrics FOR UPDATE USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Client tags (read only for clients)
CREATE POLICY "Users can view own tags" ON client_tags FOR SELECT USING (auth.uid() = user_id);

-- Migration v2: CRO expansion fields (run in Supabase SQL Editor)
ALTER TABLE business_metrics
  ADD COLUMN IF NOT EXISTS business_type  TEXT,
  ADD COLUMN IF NOT EXISTS industry       TEXT,
  ADD COLUMN IF NOT EXISTS primary_offers JSONB,
  ADD COLUMN IF NOT EXISTS cro_blockers   JSONB;

-- Money Model: offers, milestones, milestone_offers
-- Supports the client dashboard /money-model views (Kanban, Timeline, Classroom)

CREATE TABLE IF NOT EXISTS offers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  offer_type          TEXT NOT NULL CHECK (offer_type IN ('attraction','core','upsell','downsell','continuity')),
  price               TEXT,
  what_customer_gets  TEXT,
  why_do_it           TEXT,
  when_offered        TEXT,
  trigger             TEXT,
  sales_pitch         TEXT,
  thumbnail_url       TEXT,
  short_description   TEXT,
  video_url           TEXT,
  classroom_body      TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offers_user_type_idx ON offers (user_id, offer_type, sort_order);

CREATE TABLE IF NOT EXISTS milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS milestones_user_order_idx ON milestones (user_id, sort_order);

CREATE TABLE IF NOT EXISTS milestone_offers (
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  offer_id     UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  sequence     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (milestone_id, offer_id)
);

CREATE INDEX IF NOT EXISTS milestone_offers_seq_idx ON milestone_offers (milestone_id, sequence);

-- RLS
ALTER TABLE offers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_offers ENABLE ROW LEVEL SECURITY;

-- Offers: users CRUD their own
CREATE POLICY "Users can view own offers"   ON offers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own offers" ON offers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own offers" ON offers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own offers" ON offers FOR DELETE USING (auth.uid() = user_id);

-- Admin read-all on offers
CREATE POLICY "Admins can view all offers" ON offers FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Milestones: users CRUD their own
CREATE POLICY "Users can view own milestones"   ON milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own milestones" ON milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own milestones" ON milestones FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all milestones" ON milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Milestone_offers: gated through milestone ownership
CREATE POLICY "Users can view own milestone_offers" ON milestone_offers FOR SELECT
  USING (milestone_id IN (SELECT id FROM milestones WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own milestone_offers" ON milestone_offers FOR INSERT
  WITH CHECK (
    milestone_id IN (SELECT id FROM milestones WHERE user_id = auth.uid())
    AND offer_id IN (SELECT id FROM offers WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own milestone_offers" ON milestone_offers FOR UPDATE
  USING (milestone_id IN (SELECT id FROM milestones WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own milestone_offers" ON milestone_offers FOR DELETE
  USING (milestone_id IN (SELECT id FROM milestones WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all milestone_offers" ON milestone_offers FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

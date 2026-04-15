-- Crucible Pro: client portal section with appointments, tasks, recordings, rocks, team
-- Supports /dashboard/crucible-pro tabbed views

-- Store GHL contact ID on profiles so we can fetch that client's calendar events
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;

-- Billing additions on subscriptions
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS monthly_consulting_fee NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS client_agreement_url   TEXT,
  ADD COLUMN IF NOT EXISTS next_billing_date      DATE;

-- Team members (referenced by crucible_tasks.accountable_team_member_id)
CREATE TABLE IF NOT EXISTS crucible_team_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  position          TEXT,
  phone             TEXT,
  email             TEXT,
  accountabilities  TEXT[] NOT NULL DEFAULT '{}',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crucible_team_members_user_idx ON crucible_team_members (user_id, sort_order);

-- Appointments (synced from GHL calendar)
CREATE TABLE IF NOT EXISTS crucible_appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ghl_event_id    TEXT,
  title           TEXT NOT NULL,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  guests          TEXT[] NOT NULL DEFAULT '{}',
  meeting_link    TEXT,
  notes           TEXT,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ghl_event_id)
);
CREATE INDEX IF NOT EXISTS crucible_appointments_user_starts_idx
  ON crucible_appointments (user_id, starts_at);

-- Call recordings
CREATE TABLE IF NOT EXISTS crucible_call_recordings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id      UUID REFERENCES crucible_appointments(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  call_date           TIMESTAMPTZ NOT NULL,
  zoom_recording_url  TEXT,
  transcript_raw      TEXT,
  transcript_segments JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crucible_call_recordings_user_date_idx
  ON crucible_call_recordings (user_id, call_date DESC);

-- Tasks / accountabilities
CREATE TABLE IF NOT EXISTS crucible_tasks (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                         TEXT NOT NULL,
  accountable_team_member_id    UUID REFERENCES crucible_team_members(id) ON DELETE SET NULL,
  accountable_name              TEXT,
  call_recording_id             UUID REFERENCES crucible_call_recordings(id) ON DELETE SET NULL,
  status                        TEXT NOT NULL DEFAULT 'new'
                                  CHECK (status IN ('new','done','not_done')),
  sort_order                    INTEGER NOT NULL DEFAULT 0,
  completed_at                  TIMESTAMPTZ,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crucible_tasks_user_status_idx
  ON crucible_tasks (user_id, status, sort_order);
CREATE INDEX IF NOT EXISTS crucible_tasks_recording_idx
  ON crucible_tasks (call_recording_id);

-- Short-term rocks (30-90 day goals)
CREATE TABLE IF NOT EXISTS crucible_rocks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  target_date  DATE,
  status       TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','completed','abandoned')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS crucible_rocks_user_status_idx
  ON crucible_rocks (user_id, status);

-- RLS
ALTER TABLE crucible_team_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crucible_appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crucible_call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crucible_tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE crucible_rocks           ENABLE ROW LEVEL SECURITY;

-- Team members policies
CREATE POLICY "Users can view own team_members"   ON crucible_team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own team_members" ON crucible_team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team_members" ON crucible_team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own team_members" ON crucible_team_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all team_members"  ON crucible_team_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert all team_members" ON crucible_team_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update all team_members" ON crucible_team_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete all team_members" ON crucible_team_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Appointments policies
CREATE POLICY "Users can view own appointments"   ON crucible_appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON crucible_appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON crucible_appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON crucible_appointments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all appointments"  ON crucible_appointments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert all appointments" ON crucible_appointments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update all appointments" ON crucible_appointments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete all appointments" ON crucible_appointments FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Recordings policies
CREATE POLICY "Users can view own recordings"   ON crucible_call_recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recordings" ON crucible_call_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recordings" ON crucible_call_recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recordings" ON crucible_call_recordings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all recordings"  ON crucible_call_recordings FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert all recordings" ON crucible_call_recordings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update all recordings" ON crucible_call_recordings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete all recordings" ON crucible_call_recordings FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Tasks policies
CREATE POLICY "Users can view own tasks"   ON crucible_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON crucible_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON crucible_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON crucible_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tasks"  ON crucible_tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert all tasks" ON crucible_tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update all tasks" ON crucible_tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete all tasks" ON crucible_tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Rocks policies
CREATE POLICY "Users can view own rocks"   ON crucible_rocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rocks" ON crucible_rocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rocks" ON crucible_rocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rocks" ON crucible_rocks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all rocks"  ON crucible_rocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can insert all rocks" ON crucible_rocks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update all rocks" ON crucible_rocks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete all rocks" ON crucible_rocks FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Allow admins to read/update subscriptions for billing management
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update all subscriptions" ON subscriptions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin check helper (SECURITY DEFINER avoids RLS recursion on profiles self-policy)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Allow admins to view all profiles (for the client-selector dropdown)
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
  USING (public.is_admin());

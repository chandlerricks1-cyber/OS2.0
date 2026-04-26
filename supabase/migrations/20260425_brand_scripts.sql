-- Standalone brand script submissions.
-- Public form (no auth) inserts via supabaseAdmin (service role bypasses RLS).
-- Phone is the dedupe/lookup key — at submit time we attempt to match against
-- existing ghl_contacts and podcast_leads rows so admin can see who used the tool.

CREATE TABLE IF NOT EXISTS brand_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  matched_ghl_contact_id  TEXT REFERENCES ghl_contacts(ghl_id) ON DELETE SET NULL,
  matched_podcast_lead_id UUID REFERENCES podcast_leads(id)    ON DELETE SET NULL,

  hero              TEXT,
  external_problem  TEXT,
  internal_problem  TEXT,
  whats_at_stake    TEXT,
  empathy           TEXT,
  authority         TEXT,
  plan_step_1       TEXT,
  plan_step_2       TEXT,
  plan_step_3       TEXT,
  the_win           TEXT,
  brand_script      TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brand_scripts_created_at_idx ON brand_scripts (created_at DESC);
CREATE INDEX IF NOT EXISTS brand_scripts_phone_idx      ON brand_scripts (phone);
CREATE INDEX IF NOT EXISTS brand_scripts_matched_ghl_idx
  ON brand_scripts (matched_ghl_contact_id) WHERE matched_ghl_contact_id IS NOT NULL;

ALTER TABLE brand_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read brand_scripts" ON brand_scripts
  FOR SELECT USING (public.is_admin());

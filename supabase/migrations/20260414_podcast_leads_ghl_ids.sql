-- Track GHL contact + opportunity ids on podcast leads so intake submissions
-- can advance the existing opportunity in the "Podcast Funnel" pipeline
-- instead of creating duplicates.

ALTER TABLE podcast_leads
  ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS ghl_opportunity_id TEXT;

CREATE INDEX IF NOT EXISTS podcast_leads_ghl_contact_id_idx
  ON podcast_leads (ghl_contact_id);

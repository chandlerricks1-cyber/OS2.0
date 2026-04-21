-- Guest Episode Prep (StoryBrand framework) answers + AI-generated brand script
CREATE TABLE podcast_guest_prep (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id         UUID NOT NULL REFERENCES podcast_leads(id) ON DELETE CASCADE,
  hero            TEXT,
  external_problem TEXT,
  internal_problem TEXT,
  whats_at_stake  TEXT,
  empathy         TEXT,
  authority       TEXT,
  plan_step_1     TEXT,
  plan_step_2     TEXT,
  plan_step_3     TEXT,
  the_win         TEXT,
  brand_script    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- One guest prep per lead
CREATE UNIQUE INDEX podcast_guest_prep_lead_id_idx ON podcast_guest_prep(lead_id);

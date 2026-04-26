-- GHL deep-integration mirror tables.
-- Source of truth = GHL. These tables are kept in sync via webhooks + initial backfill.
-- Admin-only access. INSERT/UPDATE/DELETE happen via service-role key (supabaseAdmin)
-- in API routes that already verify is_admin().

CREATE EXTENSION IF NOT EXISTS citext;

-- ---------- Contacts ----------
CREATE TABLE IF NOT EXISTS ghl_contacts (
  ghl_id            TEXT PRIMARY KEY,
  location_id       TEXT,
  first_name        TEXT,
  last_name         TEXT,
  full_name         TEXT,
  email             CITEXT,
  phone             TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  source            TEXT,
  country           TEXT,
  timezone          TEXT,
  assigned_user_id  TEXT,
  dnd               BOOLEAN NOT NULL DEFAULT FALSE,
  custom_fields     JSONB NOT NULL DEFAULT '{}'::jsonb,
  date_added        TIMESTAMPTZ,
  raw               JSONB,
  synced_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ghl_contacts_email_idx ON ghl_contacts (email);
CREATE INDEX IF NOT EXISTS ghl_contacts_phone_idx ON ghl_contacts (phone);
CREATE INDEX IF NOT EXISTS ghl_contacts_tags_gin   ON ghl_contacts USING GIN (tags);
CREATE INDEX IF NOT EXISTS ghl_contacts_custom_gin ON ghl_contacts USING GIN (custom_fields);
CREATE INDEX IF NOT EXISTS ghl_contacts_active_idx ON ghl_contacts (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ghl_contacts_name_trgm  ON ghl_contacts USING GIN (full_name gin_trgm_ops);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------- Pipelines ----------
CREATE TABLE IF NOT EXISTS ghl_pipelines (
  ghl_id     TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  raw        JSONB,
  synced_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ghl_pipeline_stages (
  ghl_id       TEXT PRIMARY KEY,
  pipeline_id  TEXT NOT NULL REFERENCES ghl_pipelines(ghl_id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0,
  synced_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ghl_pipeline_stages_pipeline_idx
  ON ghl_pipeline_stages (pipeline_id, position);

-- ---------- Opportunities ----------
CREATE TABLE IF NOT EXISTS ghl_opportunities (
  ghl_id           TEXT PRIMARY KEY,
  pipeline_id      TEXT REFERENCES ghl_pipelines(ghl_id) ON DELETE SET NULL,
  stage_id         TEXT REFERENCES ghl_pipeline_stages(ghl_id) ON DELETE SET NULL,
  contact_id       TEXT REFERENCES ghl_contacts(ghl_id) ON DELETE SET NULL,
  name             TEXT,
  status           TEXT,
  monetary_value   NUMERIC(14,2),
  assigned_to      TEXT,
  source           TEXT,
  custom_fields    JSONB NOT NULL DEFAULT '{}'::jsonb,
  date_created     TIMESTAMPTZ,
  date_updated     TIMESTAMPTZ,
  raw              JSONB,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ghl_opportunities_stage_idx ON ghl_opportunities (pipeline_id, stage_id);
CREATE INDEX IF NOT EXISTS ghl_opportunities_contact_idx ON ghl_opportunities (contact_id);
CREATE INDEX IF NOT EXISTS ghl_opportunities_status_idx ON ghl_opportunities (status);
CREATE INDEX IF NOT EXISTS ghl_opportunities_active_idx ON ghl_opportunities (deleted_at) WHERE deleted_at IS NULL;

-- ---------- Calendars + Appointments ----------
CREATE TABLE IF NOT EXISTS ghl_calendars (
  ghl_id          TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  slot_duration   INTEGER,
  slot_interval   INTEGER,
  timezone        TEXT,
  team_members    JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw             JSONB,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ghl_appointments (
  ghl_id                 TEXT PRIMARY KEY,
  calendar_id            TEXT REFERENCES ghl_calendars(ghl_id) ON DELETE SET NULL,
  contact_id             TEXT REFERENCES ghl_contacts(ghl_id) ON DELETE SET NULL,
  assigned_user_id       TEXT,
  title                  TEXT,
  appointment_status     TEXT,
  start_time             TIMESTAMPTZ,
  end_time               TIMESTAMPTZ,
  address                TEXT,
  notes                  TEXT,
  meeting_location_type  TEXT,
  raw                    JSONB,
  synced_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at             TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ghl_appointments_cal_start_idx
  ON ghl_appointments (calendar_id, start_time);
CREATE INDEX IF NOT EXISTS ghl_appointments_contact_idx
  ON ghl_appointments (contact_id);
CREATE INDEX IF NOT EXISTS ghl_appointments_active_idx
  ON ghl_appointments (deleted_at) WHERE deleted_at IS NULL;

-- ---------- Conversations + Messages ----------
CREATE TABLE IF NOT EXISTS ghl_conversations (
  ghl_id             TEXT PRIMARY KEY,
  contact_id         TEXT REFERENCES ghl_contacts(ghl_id) ON DELETE SET NULL,
  last_message_type  TEXT,
  last_message_body  TEXT,
  last_message_at    TIMESTAMPTZ,
  unread_count       INTEGER NOT NULL DEFAULT 0,
  inbox_status       TEXT,
  assigned_to        TEXT,
  raw                JSONB,
  synced_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ghl_conversations_contact_idx ON ghl_conversations (contact_id);
CREATE INDEX IF NOT EXISTS ghl_conversations_recent_idx  ON ghl_conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS ghl_conversations_unread_idx  ON ghl_conversations (unread_count) WHERE unread_count > 0;

CREATE TABLE IF NOT EXISTS ghl_messages (
  ghl_id           TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL REFERENCES ghl_conversations(ghl_id) ON DELETE CASCADE,
  contact_id       TEXT REFERENCES ghl_contacts(ghl_id) ON DELETE SET NULL,
  direction        TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type     TEXT,
  body             TEXT,
  status           TEXT,
  attachments      JSONB NOT NULL DEFAULT '[]'::jsonb,
  from_addr        TEXT,
  to_addr          TEXT,
  message_at       TIMESTAMPTZ NOT NULL,
  meta             JSONB,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ghl_messages_conv_time_idx
  ON ghl_messages (conversation_id, message_at DESC);

-- ---------- Webhook event log (idempotency) ----------
CREATE TABLE IF NOT EXISTS ghl_webhook_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      TEXT UNIQUE NOT NULL,
  event_type    TEXT NOT NULL,
  payload       JSONB NOT NULL,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ,
  error         TEXT
);
CREATE INDEX IF NOT EXISTS ghl_webhook_events_unprocessed_idx
  ON ghl_webhook_events (received_at) WHERE processed_at IS NULL;

-- ---------- Outbound send idempotency ----------
CREATE TABLE IF NOT EXISTS ghl_outbound_sends (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_dedupe_key  TEXT UNIQUE NOT NULL,
  conversation_id    TEXT,
  ghl_message_id     TEXT,
  status             TEXT NOT NULL DEFAULT 'pending',
  error              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at       TIMESTAMPTZ
);

-- ---------- Sync state (cursors, webhook ids, etc) ----------
CREATE TABLE IF NOT EXISTS ghl_sync_state (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- RLS (admin-only SELECT; writes via service role) ----------
ALTER TABLE ghl_contacts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_pipelines         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_pipeline_stages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_opportunities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_calendars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_webhook_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_outbound_sends    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_sync_state        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read ghl_contacts"        ON ghl_contacts        FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_pipelines"       ON ghl_pipelines       FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_pipeline_stages" ON ghl_pipeline_stages FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_opportunities"   ON ghl_opportunities   FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_calendars"       ON ghl_calendars       FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_appointments"    ON ghl_appointments    FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_conversations"   ON ghl_conversations   FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_messages"        ON ghl_messages        FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_webhook_events"  ON ghl_webhook_events  FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_outbound_sends"  ON ghl_outbound_sends  FOR SELECT USING (public.is_admin());
CREATE POLICY "admins read ghl_sync_state"      ON ghl_sync_state      FOR SELECT USING (public.is_admin());

-- ---------- Realtime publication ----------
-- Enable Realtime on the tables that drive sub-10s UI updates.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE ghl_messages;       EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE ghl_conversations;  EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE ghl_opportunities;  EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE ghl_appointments;   EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE ghl_contacts;       EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

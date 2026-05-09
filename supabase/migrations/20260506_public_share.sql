-- Adds a per-profile public share link for the Money Model section.
-- Employees of a client can view (read-only) the client's Money Model + Classroom
-- via /m/<slug>, with no login required. Reads bypass RLS via the service-role
-- client and are gated on (slug match AND public_share_enabled = true).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS public_share_slug    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS public_share_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS profiles_public_share_slug_idx
  ON profiles (public_share_slug)
  WHERE public_share_slug IS NOT NULL;

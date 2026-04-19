-- Backfill: copy ghl_contact_id from podcast_leads to profiles
-- for existing users where profiles.ghl_contact_id is null.
-- Uses the most recent non-null lead record per email to avoid ambiguity.
UPDATE profiles p
SET ghl_contact_id = sub.ghl_contact_id
FROM (
  SELECT DISTINCT ON (lower(email)) lower(email) AS email_lower, ghl_contact_id
  FROM podcast_leads
  WHERE ghl_contact_id IS NOT NULL
  ORDER BY lower(email), created_at DESC
) sub
WHERE lower(p.email) = sub.email_lower
  AND p.ghl_contact_id IS NULL;

-- Add Crucible Pro status tracking to profiles
-- null = not requested, 'pending' = requested upgrade, 'active' = admin-granted access
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS crucible_pro_status TEXT
    CHECK (crucible_pro_status IN ('pending', 'active')),
  ADD COLUMN IF NOT EXISTS crucible_pro_granted_at TIMESTAMPTZ;

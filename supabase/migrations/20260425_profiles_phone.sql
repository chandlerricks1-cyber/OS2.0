-- Add phone column to profiles so it has a single home outside of auth.users.user_metadata.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Backfill phone from auth.users.raw_user_meta_data for existing rows.
UPDATE profiles p
SET phone = u.raw_user_meta_data->>'phone'
FROM auth.users u
WHERE u.id = p.id
  AND p.phone IS NULL
  AND u.raw_user_meta_data->>'phone' IS NOT NULL;

-- Update the new-user trigger to also copy phone from user_metadata on signup.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

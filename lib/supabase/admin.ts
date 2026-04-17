import { createClient } from '@supabase/supabase-js'

// Standalone admin client that does NOT depend on cookies().
// Safe to use in fire-and-forget contexts after the HTTP response is sent.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

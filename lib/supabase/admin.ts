import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Standalone admin client that does NOT depend on cookies().
// Safe to use in fire-and-forget contexts after the HTTP response is sent.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export type ResolvedContext = {
  supabase: SupabaseClient
  userId: string
  targetUserId: string
  isAdmin: boolean
}

export async function resolveContext(requestedUserId?: string | null): Promise<
  | { ok: true; ctx: ResolvedContext }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let targetUserId = user.id
  if (requestedUserId && requestedUserId !== user.id) {
    if (!isAdmin) {
      return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    targetUserId = requestedUserId
  }

  return {
    ok: true,
    ctx: { supabase: supabase as unknown as SupabaseClient, userId: user.id, targetUserId, isAdmin },
  }
}

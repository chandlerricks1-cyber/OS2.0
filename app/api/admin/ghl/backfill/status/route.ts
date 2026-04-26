import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const ENTITIES = ['contacts', 'pipelines', 'opportunities', 'calendars', 'appointments', 'conversations'] as const

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const keys = ENTITIES.map((e) => `backfill:${e}`)
  const { data } = await supabaseAdmin
    .from('ghl_sync_state')
    .select('key, value, updated_at')
    .in('key', keys)

  const byEntity: Record<string, unknown> = {}
  for (const e of ENTITIES) byEntity[e] = null
  for (const row of data ?? []) {
    const e = row.key.replace(/^backfill:/, '')
    byEntity[e] = { ...(row.value as object), updatedAt: row.updated_at }
  }

  return NextResponse.json({ entities: byEntity })
}

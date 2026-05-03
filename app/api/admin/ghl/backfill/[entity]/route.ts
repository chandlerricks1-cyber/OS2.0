import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isGhlConfigured } from '@/lib/ghl/client'
import { searchContactsPage } from '@/lib/ghl/contacts'
import { mapContactRow } from '@/lib/ghl/webhooks/contacts'
import { searchConversationsPage, getMessages } from '@/lib/ghl/conversations'
import { mapConversationRow, mapMessageRow } from '@/lib/ghl/webhooks/conversations'

export const runtime = 'nodejs'
export const maxDuration = 60

const PAGE_SIZE = 100
const MAX_PAGES_PER_REQUEST = 8 // ~800 contacts per /backfill call to stay under timeout

type Entity = 'contacts' | 'pipelines' | 'opportunities' | 'calendars' | 'appointments' | 'conversations'

function syncStateKey(entity: Entity) {
  return `backfill:${entity}`
}

interface BackfillState {
  cursor: string | null
  done: boolean
  syncedCount: number
  total: number | null
  startedAt: string
  updatedAt: string
  lastError?: string | null
}

async function readState(entity: Entity): Promise<BackfillState | null> {
  const { data } = await supabaseAdmin
    .from('ghl_sync_state')
    .select('value')
    .eq('key', syncStateKey(entity))
    .maybeSingle()
  return (data?.value as BackfillState | null) ?? null
}

async function writeState(entity: Entity, value: BackfillState) {
  await supabaseAdmin
    .from('ghl_sync_state')
    .upsert({
      key: syncStateKey(entity),
      value: value as unknown as never,
      updated_at: new Date().toISOString(),
    })
}

async function backfillConversations(state: BackfillState | null): Promise<BackfillState> {
  let cursor = state?.cursor ?? null
  let synced = state?.syncedCount ?? 0
  let total = state?.total ?? null
  const startedAt = state?.startedAt ?? new Date().toISOString()

  for (let i = 0; i < 4; i++) {
    const page = await searchConversationsPage({ limit: 50, startAfterDate: cursor })
    if (total === null && page.total !== null) total = page.total

    if (page.items.length === 0) {
      return {
        cursor: null,
        done: true,
        syncedCount: synced,
        total,
        startedAt,
        updatedAt: new Date().toISOString(),
        lastError: null,
      }
    }

    const convRows = page.items.map(mapConversationRow)
    const { error: convErr } = await supabaseAdmin
      .from('ghl_conversations')
      .upsert(convRows, { onConflict: 'ghl_id' })
    if (convErr) throw new Error(`upsert ghl_conversations failed: ${convErr.message}`)

    // Pull last 30 messages per conversation
    for (const conv of page.items) {
      try {
        const { messages } = await getMessages(conv.id, { limit: 30 })
        if (messages.length === 0) continue
        const rows = messages.map((m) =>
          mapMessageRow(m, { conversationId: conv.id, contactId: conv.contactId ?? null })
        )
        const { error: msgErr } = await supabaseAdmin
          .from('ghl_messages')
          .upsert(rows, { onConflict: 'ghl_id' })
        if (msgErr) throw new Error(`upsert ghl_messages failed: ${msgErr.message}`)
      } catch (err) {
        console.warn('[backfill conv messages]', conv.id, err)
      }
    }

    synced += page.items.length
    cursor = page.nextCursor

    if (!cursor) {
      return {
        cursor: null,
        done: true,
        syncedCount: synced,
        total,
        startedAt,
        updatedAt: new Date().toISOString(),
        lastError: null,
      }
    }
  }

  return {
    cursor,
    done: false,
    syncedCount: synced,
    total,
    startedAt,
    updatedAt: new Date().toISOString(),
    lastError: null,
  }
}

async function backfillContacts(state: BackfillState | null): Promise<BackfillState> {
  let cursor = state?.cursor ?? null
  let synced = state?.syncedCount ?? 0
  let total = state?.total ?? null
  const startedAt = state?.startedAt ?? new Date().toISOString()

  for (let i = 0; i < MAX_PAGES_PER_REQUEST; i++) {
    const page = await searchContactsPage({ pageLimit: PAGE_SIZE, startAfterId: cursor })
    if (total === null && page.total !== null) total = page.total

    if (page.items.length === 0) {
      return {
        cursor: null,
        done: true,
        syncedCount: synced,
        total,
        startedAt,
        updatedAt: new Date().toISOString(),
        lastError: null,
      }
    }

    const rows = page.items.map(mapContactRow)
    const { error } = await supabaseAdmin.from('ghl_contacts').upsert(rows, { onConflict: 'ghl_id' })
    if (error) throw new Error(`upsert ghl_contacts failed: ${error.message}`)

    synced += rows.length
    cursor = page.nextCursor

    if (!cursor) {
      return {
        cursor: null,
        done: true,
        syncedCount: synced,
        total,
        startedAt,
        updatedAt: new Date().toISOString(),
        lastError: null,
      }
    }
  }

  return {
    cursor,
    done: false,
    syncedCount: synced,
    total,
    startedAt,
    updatedAt: new Date().toISOString(),
    lastError: null,
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ entity: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  if (!isGhlConfigured()) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 400 })
  }

  const { entity } = await ctx.params
  const reset = req.nextUrl.searchParams.get('reset') === '1'
  const prevState = reset ? null : await readState(entity as Entity)

  try {
    let nextState: BackfillState
    switch (entity) {
      case 'contacts':
        nextState = await backfillContacts(prevState)
        break
      case 'conversations':
        nextState = await backfillConversations(prevState)
        break
      case 'pipelines':
      case 'opportunities':
      case 'calendars':
      case 'appointments':
        return NextResponse.json(
          { error: `backfill for ${entity} ships in a later phase` },
          { status: 501 }
        )
      default:
        return NextResponse.json({ error: `unknown entity: ${entity}` }, { status: 400 })
    }

    await writeState(entity as Entity, nextState)
    return NextResponse.json({
      done: nextState.done,
      cursor: nextState.cursor,
      synced: nextState.syncedCount,
      total: nextState.total,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'backfill failed'
    if (prevState) {
      await writeState(entity as Entity, { ...prevState, lastError: msg, updatedAt: new Date().toISOString() })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

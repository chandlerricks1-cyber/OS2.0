import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { upsertContact } from '@/lib/ghl/client'
import { upsertGhlContact } from '@/lib/ghl/webhooks/contacts'
import { getContact } from '@/lib/ghl/contacts'

export const runtime = 'nodejs'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() ?? ''
  const tag = sp.get('tag')?.trim() ?? ''
  const cursor = sp.get('cursor') // ISO date_added cursor for pagination
  const limit = Math.min(Number(sp.get('limit') ?? PAGE_SIZE), 200)

  let query = supabaseAdmin
    .from('ghl_contacts')
    .select('ghl_id, full_name, first_name, last_name, email, phone, tags, source, date_added, synced_at, deleted_at')
    .is('deleted_at', null)
    .order('date_added', { ascending: false, nullsFirst: false })
    .order('ghl_id', { ascending: false })
    .limit(limit + 1)

  if (q) {
    const like = `%${q}%`
    query = query.or(
      `full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`
    )
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }
  if (cursor) {
    query = query.lt('date_added', cursor)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = (data ?? []).slice(0, limit)
  const nextCursor =
    (data ?? []).length > limit && items.length > 0
      ? items[items.length - 1].date_added
      : null

  return NextResponse.json({ items, nextCursor })
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const body = await req.json().catch(() => null) as {
    firstName?: string
    lastName?: string
    email: string
    phone?: string
    tags?: string[]
    source?: string
  } | null
  if (!body || !body.email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  try {
    const res = await upsertContact({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      tags: body.tags,
      source: body.source ?? 'Admin dashboard',
    })
    const id = res.contact?.id
    if (!id) {
      return NextResponse.json({ error: 'GHL upsert returned no contact id' }, { status: 502 })
    }
    // Pull canonical record and mirror it so the UI sees it without waiting for webhook.
    const fresh = await getContact(id)
    if (fresh) await upsertGhlContact(fresh)
    return NextResponse.json({ id })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'create failed' }, { status: 500 })
  }
}

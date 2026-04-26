import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'
import type { GhlContact } from '../contacts'

type GhlContactRow = Database['public']['Tables']['ghl_contacts']['Insert']

interface ContactPayload extends GhlContact {
  type?: string
}

export function mapContactRow(c: GhlContact): GhlContactRow {
  const fullName =
    c.contactName ||
    [c.firstName, c.lastName].filter(Boolean).join(' ').trim() ||
    null
  const customFieldsObj: Record<string, unknown> = {}
  if (Array.isArray(c.customFields)) {
    for (const f of c.customFields) {
      const key = f.key || f.id
      if (!key) continue
      customFieldsObj[key] = f.value ?? f.field_value
    }
  }
  return {
    ghl_id: c.id,
    location_id: (c.locationId as string | undefined) ?? null,
    first_name: c.firstName ?? null,
    last_name: c.lastName ?? null,
    full_name: fullName,
    email: c.email ?? null,
    phone: c.phone ?? null,
    tags: Array.isArray(c.tags) ? c.tags : [],
    source: c.source ?? null,
    country: c.country ?? null,
    timezone: c.timezone ?? null,
    assigned_user_id: (c.assignedTo as string | undefined) ?? null,
    dnd: c.dnd ?? false,
    custom_fields: customFieldsObj as never,
    date_added: c.dateAdded ?? null,
    raw: c as never,
    synced_at: new Date().toISOString(),
    deleted_at: null,
  }
}

export async function upsertGhlContact(c: GhlContact) {
  const row = mapContactRow(c)
  const { error } = await supabaseAdmin
    .from('ghl_contacts')
    .upsert(row, { onConflict: 'ghl_id' })
  if (error) throw new Error(`upsert ghl_contacts failed: ${error.message}`)
}

export async function softDeleteGhlContact(ghlId: string) {
  const { error } = await supabaseAdmin
    .from('ghl_contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('ghl_id', ghlId)
  if (error) throw new Error(`soft-delete ghl_contacts failed: ${error.message}`)
}

export async function handleContactWebhook(eventType: string, payload: ContactPayload) {
  const id = payload.id
  if (!id) throw new Error('contact webhook missing id')

  switch (eventType) {
    case 'ContactCreate':
    case 'ContactUpdate':
    case 'ContactTagUpdate':
    case 'ContactDndUpdate':
      await upsertGhlContact(payload)
      return
    case 'ContactDelete':
      await softDeleteGhlContact(id)
      return
    default:
      // unknown contact event — store raw via upsert if shape looks contact-like
      if (payload.email || payload.phone || payload.firstName) {
        await upsertGhlContact(payload)
      }
  }
}

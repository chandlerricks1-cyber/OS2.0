import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'
import { getContact, type GhlContact } from '../contacts'

type GhlContactRow = Database['public']['Tables']['ghl_contacts']['Insert']

// GHL Workflow webhooks send snake_case fields; REST API + our backfill use camelCase.
// Accept either shape.
interface ContactPayload {
  // REST shape
  id?: string
  // Workflow shape
  contact_id?: string
  // any other fields we might inspect
  [k: string]: unknown
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
  const id = (payload.id as string | undefined) ?? (payload.contact_id as string | undefined)
  if (!id) throw new Error('contact webhook missing contact id')

  if (eventType === 'ContactDelete') {
    await softDeleteGhlContact(id)
    return
  }

  // For everything else (Create/Update/Tag/Dnd/etc), the webhook payload is sparse
  // and shape varies (REST vs Workflow). Fetch the canonical record from GHL and
  // upsert that — one mapper, one source of truth.
  const fresh = await getContact(id)
  if (fresh) {
    await upsertGhlContact(fresh)
  } else {
    // Contact no longer exists in GHL — treat as soft delete.
    await softDeleteGhlContact(id)
  }
}

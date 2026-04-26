import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Database, Json } from '@/types/database'
import type { PrimaryOffer, CROBlocker } from '@/types/intake'
import { parseInteger, parseMoney, parsePercent, parseRevenueRange } from './parsers'

type BusinessMetricsInsert = Database['public']['Tables']['business_metrics']['Insert']

export interface SeedResult {
  seeded: boolean
  fields: string[]
  reason?: string
}

// Idempotently upserts a business_metrics row for `userId` from the
// answers in the matching `podcast_intake` row. Best-effort: per-field
// parse failures are silently skipped, leaving those columns NULL so
// the user can fill them via MetricsEditor or the full intake chat.
export async function seedBusinessMetricsFromPodcast(
  userId: string,
  leadId: string
): Promise<SeedResult> {
  const { data: intake, error: intakeErr } = await supabaseAdmin
    .from('podcast_intake')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle()

  if (intakeErr) return { seeded: false, fields: [], reason: intakeErr.message }
  if (!intake) return { seeded: false, fields: [], reason: 'no podcast_intake row' }

  const payload: BusinessMetricsInsert = { user_id: userId }
  const fields: string[] = []

  const companyName = intake.business_name?.trim()
  if (companyName) { payload.company_name = companyName; fields.push('company_name') }

  const businessType = intake.business_type?.trim()
  if (businessType) { payload.business_type = businessType; fields.push('business_type') }

  const industry = intake.industry?.trim()
  if (industry) { payload.industry = industry; fields.push('industry') }

  const monthlyRevenue = parseRevenueRange(intake.monthly_revenue)
  if (monthlyRevenue !== null) { payload.monthly_revenue = monthlyRevenue; fields.push('monthly_revenue') }

  const cac = parseMoney(intake.estimated_cac)
  if (cac !== null) { payload.cac = cac; fields.push('cac') }

  const closeRate = parsePercent(intake.close_rate)
  if (closeRate !== null) { payload.close_rate = closeRate; fields.push('close_rate') }

  const customerCount = parseInteger(intake.customer_count)
  if (customerCount !== null) { payload.monthly_new_customers = customerCount; fields.push('monthly_new_customers') }

  const primaryOfferName = intake.primary_offer?.trim()
  if (primaryOfferName) {
    const offers: PrimaryOffer[] = [{
      name: primaryOfferName,
      price: null,
      price_type: null,
      description: null,
    }]
    payload.primary_offers = offers as unknown as Json
    fields.push('primary_offers')
  }

  const constraint = intake.biggest_constraint?.trim()
  if (constraint) {
    const blockers: CROBlocker[] = [{
      rank: 1,
      title: constraint,
      explanation: intake.tried_and_failed?.trim() || 'Identified as the #1 growth constraint in the podcast questionnaire.',
      cro_lever: 'discovery',
    }]
    payload.cro_blockers = blockers as unknown as Json
    fields.push('cro_blockers')
  }

  const { error: upsertErr } = await supabaseAdmin
    .from('business_metrics')
    .upsert(payload, { onConflict: 'user_id' })

  if (upsertErr) return { seeded: false, fields: [], reason: upsertErr.message }
  return { seeded: true, fields }
}

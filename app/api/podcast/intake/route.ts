import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  addContactNote,
  createOpportunity,
  findStageId,
  getPodcastPipeline,
  isGhlConfigured,
  updateOpportunity,
  upsertContact,
} from '@/lib/ghl/client'

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function formatIntakeNote(answers: Record<string, string | null | undefined>): string {
  const labels: Array<[string, string]> = [
    ['Business name', 'business_name'],
    ['Business type', 'business_type'],
    ['Industry', 'industry'],
    ['Years in business', 'years_in_business'],
    ['Description', 'business_description'],
    ['Monthly revenue', 'monthly_revenue'],
    ['Revenue model', 'revenue_model'],
    ['Avg. transaction value', 'average_transaction_value'],
    ['Customer count', 'customer_count'],
    ['Pricing structure', 'pricing_structure'],
    ['Primary acquisition channels', 'primary_acquisition_channels'],
    ['Monthly ad spend', 'monthly_ad_spend'],
    ['Estimated CAC', 'estimated_cac'],
    ['Close rate', 'close_rate'],
    ['Sales process', 'sales_process'],
    ['Primary offer', 'primary_offer'],
    ['Secondary offers', 'secondary_offers'],
    ['Differentiator', 'differentiator'],
    ['Biggest constraint', 'biggest_constraint'],
    ['Tried & failed', 'tried_and_failed'],
    ['Goal (next 90 days)', 'goal_next_90_days'],
    ['Anything else', 'anything_else'],
  ]
  const lines = labels
    .map(([label, key]) => {
      const val = answers[key]?.toString().trim()
      return val ? `${label}: ${val}` : null
    })
    .filter(Boolean)
  return `Podcast Intake Submitted\n\n${lines.join('\n')}`
}

async function pushIntakeToGhl(params: {
  lead: { full_name: string; email: string; phone: string | null; ghl_contact_id: string | null; ghl_opportunity_id: string | null; preferred_date: string | null }
  answers: Record<string, string | null | undefined>
}): Promise<{ error?: string; opportunityId?: string }> {
  if (!isGhlConfigured()) return { error: 'GHL not configured' }
  try {
    const pipeline = await getPodcastPipeline()
    const stageId = findStageId(pipeline, 'Intake Submitted')

    let contactId = params.lead.ghl_contact_id
    if (!contactId) {
      const { firstName, lastName } = splitName(params.lead.full_name)
      const upserted = await upsertContact({
        firstName,
        lastName,
        email: params.lead.email,
        phone: params.lead.phone ?? undefined,
        source: 'Podcast intake',
        tags: ['podcast-lead', 'podcast-intake'],
      })
      contactId = upserted.contact?.id ?? null
    }

    let opportunityId = params.lead.ghl_opportunity_id
    if (opportunityId) {
      await updateOpportunity(opportunityId, { pipelineStageId: stageId })
    } else if (contactId) {
      const nameBase = params.answers.business_name?.toString().trim() || params.lead.full_name
      const created = await createOpportunity({
        pipelineId: pipeline.id,
        pipelineStageId: stageId,
        contactId,
        name: `${nameBase} — Podcast`,
        status: 'open',
        source: 'Podcast intake',
      })
      opportunityId = created.opportunity?.id ?? created.id ?? null
    } else {
      return { error: 'No contact id available to attach opportunity' }
    }

    if (contactId) {
      try {
        await addContactNote({ contactId, body: formatIntakeNote(params.answers) })
      } catch (noteErr) {
        console.warn('[ghl] failed to add intake note:', noteErr instanceof Error ? noteErr.message : noteErr)
      }
    }

    return { opportunityId: opportunityId ?? undefined }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'GHL push failed' }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lead_id, _honey, ...answers } = body

    // Honeypot spam check
    if (_honey) {
      return NextResponse.json({ success: true }, { status: 201 })
    }

    // Validate required fields
    const errors: Record<string, string> = {}
    if (!lead_id) errors.lead_id = 'Missing lead reference'
    if (!answers.business_name?.trim()) errors.business_name = 'Business name is required'
    if (!answers.business_description?.trim()) errors.business_description = 'Business description is required'
    if (!answers.primary_offer?.trim()) errors.primary_offer = 'Primary offer is required'
    if (!answers.biggest_constraint?.trim()) errors.biggest_constraint = 'Biggest constraint is required'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Verify the lead exists
    const { data: lead } = await supabase
      .from('podcast_leads')
      .select('id, full_name, email, phone, preferred_date, ghl_contact_id, ghl_opportunity_id')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Invalid lead reference. Please start from the podcast page.' }, { status: 400 })
    }

    // Insert intake answers
    const { error: insertError } = await supabase
      .from('podcast_intake')
      .insert({
        lead_id,
        business_name: answers.business_name?.trim() || null,
        business_type: answers.business_type?.trim() || null,
        industry: answers.industry?.trim() || null,
        years_in_business: answers.years_in_business?.trim() || null,
        business_description: answers.business_description?.trim() || null,
        monthly_revenue: answers.monthly_revenue?.trim() || null,
        revenue_model: answers.revenue_model?.trim() || null,
        average_transaction_value: answers.average_transaction_value?.trim() || null,
        customer_count: answers.customer_count?.trim() || null,
        pricing_structure: answers.pricing_structure?.trim() || null,
        primary_acquisition_channels: answers.primary_acquisition_channels?.trim() || null,
        monthly_ad_spend: answers.monthly_ad_spend?.trim() || null,
        estimated_cac: answers.estimated_cac?.trim() || null,
        close_rate: answers.close_rate?.trim() || null,
        sales_process: answers.sales_process?.trim() || null,
        primary_offer: answers.primary_offer?.trim() || null,
        secondary_offers: answers.secondary_offers?.trim() || null,
        differentiator: answers.differentiator?.trim() || null,
        biggest_constraint: answers.biggest_constraint?.trim() || null,
        tried_and_failed: answers.tried_and_failed?.trim() || null,
        goal_next_90_days: answers.goal_next_90_days?.trim() || null,
        anything_else: answers.anything_else?.trim() || null,
      })

    if (insertError) {
      console.error('Failed to insert podcast intake:', insertError)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    // Update lead status
    await supabase
      .from('podcast_leads')
      .update({ status: 'intake_complete', updated_at: new Date().toISOString() })
      .eq('id', lead_id)

    // Advance the GHL opportunity to "Intake Submitted"
    const ghl = await pushIntakeToGhl({
      lead: {
        full_name: lead.full_name,
        email: lead.email,
        phone: lead.phone,
        preferred_date: lead.preferred_date,
        ghl_contact_id: lead.ghl_contact_id,
        ghl_opportunity_id: lead.ghl_opportunity_id,
      },
      answers,
    })
    if (ghl.error) {
      console.warn('[ghl] podcast intake sync failed:', ghl.error)
    } else {
      console.log('[ghl] podcast intake synced:', { leadId: lead_id, opportunityId: ghl.opportunityId })
      if (ghl.opportunityId && !lead.ghl_opportunity_id) {
        await supabase
          .from('podcast_leads')
          .update({ ghl_opportunity_id: ghl.opportunityId })
          .eq('id', lead_id)
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

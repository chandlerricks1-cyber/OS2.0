import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
      .select('id')
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

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

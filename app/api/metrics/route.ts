import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT /api/metrics — update editable metric fields
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const {
    company_name,
    website,
    revenue_goal_1yr,
    business_type,
    industry,
    cac,
    ltv,
    gross_profit_per_customer,
    gross_profit_first_30_days,
    lifetime_gross_profit_per_customer,
    cash_collected_first_30_days,
    monthly_revenue,
    monthly_new_customers,
    close_rate,
  } = body

  // Derive calculated fields
  const ltv_cac_ratio = cac && ltv ? ltv / cac : null
  const cac_payback_months = cac && gross_profit_per_customer ? cac / gross_profit_per_customer : null
  const required_30_day_revenue = cac && cash_collected_first_30_days ? cac - cash_collected_first_30_days : null

  const { error: metricsError } = await supabase
    .from('business_metrics')
    .update({
      company_name: company_name || null,
      website: website || null,
      revenue_goal_1yr: revenue_goal_1yr ?? null,
      business_type: business_type || null,
      industry: industry || null,
      cac: cac ?? null,
      ltv: ltv ?? null,
      ltv_cac_ratio,
      gross_profit_per_customer: gross_profit_per_customer ?? null,
      gross_profit_first_30_days: gross_profit_first_30_days ?? null,
      lifetime_gross_profit_per_customer: lifetime_gross_profit_per_customer ?? null,
      cash_collected_first_30_days: cash_collected_first_30_days ?? null,
      monthly_revenue: monthly_revenue ?? null,
      monthly_new_customers: monthly_new_customers ?? null,
      close_rate: close_rate ?? null,
      cac_payback_months,
      required_30_day_revenue,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (metricsError) {
    return NextResponse.json({ error: metricsError.message }, { status: 500 })
  }

  // Invalidate cached report so next visit regenerates
  await supabase.from('reports').delete().eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}

// DELETE /api/metrics — clear all metrics and cached report
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await Promise.all([
    supabase.from('business_metrics').delete().eq('user_id', user.id),
    supabase.from('reports').delete().eq('user_id', user.id),
  ])

  return NextResponse.json({ ok: true })
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CrucibleProShell } from '@/components/crucible-pro/CrucibleProShell'
import { CrucibleProUpgrade } from '@/components/crucible-pro/CrucibleProUpgrade'
import type {
  Appointment,
  CallRecording,
  ClientOption,
  Rock,
  Task,
  TeamMember,
  BillingSnapshot,
  Invoice,
} from '@/types/cruciblePro'

const VALID_TABS = new Set(['appointments', 'recordings', 'goals', 'billing'])

export default async function CrucibleProPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; client?: string }>
}) {
  const { tab, client: clientParam } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, crucible_pro_status')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const hasProAccess = isAdmin || profile?.crucible_pro_status === 'active'

  if (!hasProAccess) {
    return <CrucibleProUpgrade isPending={profile?.crucible_pro_status === 'pending'} />
  }

  let clients: ClientOption[] = []
  let targetUserId = user.id

  if (isAdmin) {
    const { data: list } = await supabase
      .from('profiles')
      .select('id, email, full_name, crucible_pro_status')
      .eq('role', 'client')
      .order('full_name', { ascending: true, nullsFirst: false })
      .order('email')
    clients = (list as ClientOption[] | null) ?? []
    if (clientParam && clients.some((c) => c.id === clientParam)) {
      targetUserId = clientParam
    } else if (clients.length > 0) {
      targetUserId = clients[0].id
    }
  }

  const [
    { data: appointments },
    { data: recordings },
    { data: tasks },
    { data: teamMembers },
    { data: rocks },
    { data: metrics },
    { data: subscription },
    { data: invoices },
  ] = await Promise.all([
    supabase
      .from('crucible_appointments')
      .select('*')
      .eq('user_id', targetUserId)
      .order('starts_at', { ascending: true }),
    supabase
      .from('crucible_call_recordings')
      .select('*')
      .eq('user_id', targetUserId)
      .order('call_date', { ascending: false }),
    supabase
      .from('crucible_tasks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('crucible_team_members')
      .select('*')
      .eq('user_id', targetUserId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('crucible_rocks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false }),
    supabase
      .from('business_metrics')
      .select('monthly_revenue, required_30_day_revenue, revenue_goal_1yr, raw_extraction')
      .eq('user_id', targetUserId)
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select(
        'monthly_consulting_fee, client_agreement_url, next_billing_date, current_period_end, status, plan_type, stripe_customer_id, stripe_subscription_id, stripe_product_id, stripe_price_id'
      )
      .eq('user_id', targetUserId)
      .maybeSingle(),
    supabase
      .from('crucible_pro_invoices')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Resolve client display name for accountability assignment
  let clientName = 'Client'
  if (isAdmin) {
    const match = clients.find((c) => c.id === targetUserId)
    clientName = match?.full_name ?? match?.email ?? 'Client'
  } else {
    clientName = profile?.full_name ?? profile?.email ?? 'Client'
  }

  const revenueGoal = extractRevenueGoal(metrics)

  const billing: BillingSnapshot = {
    monthly_consulting_fee: subscription?.monthly_consulting_fee ?? null,
    client_agreement_url: subscription?.client_agreement_url ?? null,
    next_billing_date: subscription?.next_billing_date ?? null,
    current_period_end: subscription?.current_period_end ?? null,
    status: subscription?.status ?? 'inactive',
    plan_type: subscription?.plan_type ?? null,
    stripe_customer_id: subscription?.stripe_customer_id ?? null,
    stripe_subscription_id: subscription?.stripe_subscription_id ?? null,
    stripe_product_id: subscription?.stripe_product_id ?? null,
    stripe_price_id: subscription?.stripe_price_id ?? null,
    has_stripe_subscription: Boolean(subscription?.stripe_subscription_id),
  }

  const initialTab =
    tab && VALID_TABS.has(tab) ? (tab as 'appointments' | 'recordings' | 'goals' | 'billing') : 'appointments'

  return (
    <CrucibleProShell
      isAdmin={isAdmin}
      clients={clients}
      targetUserId={targetUserId}
      clientName={clientName}
      initialTab={initialTab}
      appointments={(appointments as Appointment[] | null) ?? []}
      recordings={(recordings as CallRecording[] | null) ?? []}
      tasks={(tasks as Task[] | null) ?? []}
      teamMembers={(teamMembers as TeamMember[] | null) ?? []}
      rocks={(rocks as Rock[] | null) ?? []}
      revenueGoal={revenueGoal}
      billing={billing}
      invoices={(invoices as Invoice[] | null) ?? []}
    />
  )
}

function extractRevenueGoal(metrics: unknown): number | null {
  if (!metrics || typeof metrics !== 'object') return null
  const m = metrics as Record<string, unknown>
  // Explicit override takes priority
  if (typeof m.revenue_goal_1yr === 'number') return m.revenue_goal_1yr
  // Fallback to intake-derived values
  if (typeof m.required_30_day_revenue === 'number') {
    return m.required_30_day_revenue * 12
  }
  const raw = m.raw_extraction
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    if (typeof r.annual_revenue_goal === 'number') return r.annual_revenue_goal
    if (typeof r.revenue_goal === 'number') return r.revenue_goal
  }
  return null
}

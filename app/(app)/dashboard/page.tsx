import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PaybackChart } from '@/components/dashboard/PaybackChart'
import { ProjectionChart } from '@/components/dashboard/ProjectionChart'
import { MetricsEditor } from '@/components/dashboard/MetricsEditor'
import { OpenEditorButton } from '@/components/dashboard/OpenEditorButton'
import { formatCurrency, formatMonths, formatPercent, formatNumber } from '@/lib/utils/metrics'
import type { PrimaryOffer, CROBlocker } from '@/types/intake'
import type { BusinessMetrics } from '@/types/metrics'
import Link from 'next/link'
import { Package, AlertTriangle, LayoutGrid, ArrowRight } from 'lucide-react'
import { OFFER_TYPES, OFFER_TYPE_LABELS, type OfferType } from '@/types/offer'
import { BookCallButton } from '@/components/dashboard/BookCallButton'
import { AdminClientSearch } from '@/components/dashboard/AdminClientSearch'
import type { ClientOption } from '@/types/cruciblePro'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client: clientParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

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

  const { data: metricsRow } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  const metrics: BusinessMetrics | null = (metricsRow as BusinessMetrics | null) ?? null

  // Admin viewing a client without metrics: show a contextual notice rather than empty editable cards
  // (admins can't edit client metrics through this UI — only clients can fill in their own).
  const viewingOtherClient = isAdmin && targetUserId !== user.id

  const offers = (metrics?.primary_offers ?? null) as PrimaryOffer[] | null
  const blockers = (metrics?.cro_blockers ?? null) as CROBlocker[] | null

  const { data: moneyOffers } = await supabase
    .from('offers')
    .select('offer_type')
    .eq('user_id', targetUserId)
    .eq('is_active', true)
  const { count: milestoneCount } = await supabase
    .from('milestones')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', targetUserId)
  const counts: Record<OfferType, number> = { attraction: 0, core: 0, upsell: 0, downsell: 0, continuity: 0 }
  for (const row of (moneyOffers as { offer_type: OfferType }[] | null) ?? []) {
    counts[row.offer_type] = (counts[row.offer_type] ?? 0) + 1
  }
  const totalMoneyOffers = Object.values(counts).reduce((a, b) => a + b, 0)
  const gaps: string[] = []
  if (counts.attraction === 0) gaps.push('No attraction offer')
  if (counts.core === 0) gaps.push('No core offer')
  if (counts.continuity === 0) gaps.push('No continuity offer')
  if ((milestoneCount ?? 0) === 0 && totalMoneyOffers > 0) gaps.push('No milestones mapped')

  const reportHref = viewingOtherClient
    ? `/dashboard/report?client=${targetUserId}`
    : '/dashboard/report'

  // Report is generatable once the four core unit-economics inputs are set.
  const reportReady = Boolean(
    metrics?.cac && metrics?.ltv && metrics?.gross_profit_per_customer && metrics?.close_rate
  )

  const clientName = viewingOtherClient
    ? (clients.find((c) => c.id === targetUserId)?.full_name ?? clients.find((c) => c.id === targetUserId)?.email ?? 'This client')
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {isAdmin && <AdminClientSearch clients={clients} targetUserId={targetUserId} />}

      {/* Identity Header */}
      <div className="bg-white border border-gray-200 rounded-[25px] px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {metrics?.company_name ? metrics.company_name[0].toUpperCase() : '?'}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {metrics?.company_name ?? 'Your Company'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {metrics?.website && (
                <a
                  href={metrics.website.startsWith('http') ? metrics.website : `https://${metrics.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-700 truncate"
                >
                  {metrics.website}
                </a>
              )}
              {(metrics?.business_type || metrics?.industry) && (
                <span className="text-xs text-gray-400">
                  {metrics.business_type}{metrics.industry ? ` · ${metrics.industry}` : ''}
                </span>
              )}
              {!metrics && !viewingOtherClient && (
                <span className="text-xs text-gray-400">Add your company info to get started</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap sm:flex-shrink-0">
          {metrics?.revenue_goal_1yr && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">1-Year Revenue Goal</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(metrics.revenue_goal_1yr)}</p>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {!viewingOtherClient && (
              <OpenEditorButton className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
                Edit Metrics
              </OpenEditorButton>
            )}
            {reportReady ? (
              <Link
                href={reportHref}
                className="btn-gradient px-4 py-2 inline-block text-sm whitespace-nowrap"
              >
                View Report →
              </Link>
            ) : (
              <span
                className="px-4 py-2 inline-block text-sm whitespace-nowrap rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
                title="Fill in CAC, LTV, monthly gross profit, and close rate to generate your report"
              >
                View Report →
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics editor — hidden until opened via the header button or any empty card */}
      {!viewingOtherClient && <MetricsEditor metrics={metrics} />}

      {/* Onboarding banner when no metrics row exists yet */}
      {!metrics && !viewingOtherClient && (
        <div className="bg-brand-cream-100 border border-brand-orange-dark/20 rounded-[25px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Welcome — let's set up your dashboard.</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Fill in your numbers below (or run the guided intake). Once the core fields are in, you can generate your custom CRO report.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OpenEditorButton className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
              Fill in metrics
            </OpenEditorButton>
            <Link
              href="/intake"
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 whitespace-nowrap"
            >
              Use guided intake
            </Link>
          </div>
        </div>
      )}

      {viewingOtherClient && !metrics && (
        <div className="bg-white border border-gray-200 rounded-[25px] p-5 text-center">
          <p className="text-sm text-gray-700 font-medium">{clientName} hasn&rsquo;t filled in metrics yet.</p>
          <p className="text-xs text-gray-500 mt-1">They can complete the intake or fill the dashboard cards manually.</p>
        </div>
      )}

      {/* Row 1: Core unit economics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="CAC Payback"
          value={formatMonths(metrics?.cac_payback_months ?? null)}
          description="Months to recoup CAC"
          highlight
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="CAC"
          value={formatCurrency(metrics?.cac ?? null)}
          description="Cost to acquire a customer"
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="LTV"
          value={formatCurrency(metrics?.ltv ?? null)}
          description="Customer lifetime value"
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="LTV:CAC Ratio"
          value={metrics?.ltv_cac_ratio ? `${metrics.ltv_cac_ratio.toFixed(2)}x` : '—'}
          description="Target: 3x or higher"
          editable={!viewingOtherClient}
        />
      </div>

      {/* Row 2: Revenue & sales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Monthly Revenue"
          value={formatCurrency(metrics?.monthly_revenue ?? null)}
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="Cash Collected First 30 Days"
          value={formatCurrency(metrics?.cash_collected_first_30_days ?? null)}
          description="Per new customer"
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="New Customers/Mo"
          value={formatNumber(metrics?.monthly_new_customers ?? null, 0)}
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="Close Rate"
          value={formatPercent(metrics?.close_rate ?? null)}
          editable={!viewingOtherClient}
        />
      </div>

      {/* Row 3: Gross profit split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label="30-Day Gross Profit"
          value={formatCurrency(metrics?.gross_profit_first_30_days ?? null)}
          description="Cash collected in 30 days minus delivery costs"
          editable={!viewingOtherClient}
        />
        <MetricCard
          label="Lifetime Gross Profit / Customer"
          value={formatCurrency(metrics?.lifetime_gross_profit_per_customer ?? null)}
          description="Total gross profit over customer lifetime"
          editable={!viewingOtherClient}
        />
      </div>

      {/* Charts */}
      {metrics?.cac && metrics.cash_collected_first_30_days && metrics.gross_profit_per_customer && metrics.cac_payback_months ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PaybackChart
            cac={metrics.cac}
            cashCollectedFirst30Days={metrics.cash_collected_first_30_days}
            grossProfitPerCustomer={metrics.gross_profit_per_customer}
            paybackMonths={metrics.cac_payback_months}
          />
          {metrics.ltv && (
            <ProjectionChart
              currentPaybackMonths={metrics.cac_payback_months}
              ltv={metrics.ltv}
              cac={metrics.cac}
            />
          )}
        </div>
      ) : null}

      {/* Money Model tile */}
      <Link
        href="/dashboard/money-model"
        className="block bg-white border border-gray-200 rounded-[25px] p-6 hover:border-brand-gradient-end/40 hover:shadow-elevated transition-all"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Money Model</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalMoneyOffers === 0
                  ? 'Organize your offers and map the customer journey'
                  : `${totalMoneyOffers} offer${totalMoneyOffers === 1 ? '' : 's'} · ${milestoneCount ?? 0} milestone${milestoneCount === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
        </div>
        {totalMoneyOffers > 0 && (
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-3">
            {OFFER_TYPES.map((t) => (
              <div
                key={t}
                className="border border-gray-100 rounded-xl px-2 py-2 bg-gray-50 text-center"
              >
                <div className="text-xs text-gray-500">{OFFER_TYPE_LABELS[t]}</div>
                <div className="text-lg font-bold text-gray-900">{counts[t]}</div>
              </div>
            ))}
          </div>
        )}
        {gaps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {gaps.map((g) => (
              <span
                key={g}
                className="text-[11px] font-medium text-brand-orange-dark bg-brand-cream-100 px-2.5 py-1 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Primary Offers */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Primary Offers</h2>
          </div>
          {!viewingOtherClient && (
            <OpenEditorButton className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5">
              {offers && offers.length > 0 ? 'Edit offers' : '+ Add offers'}
            </OpenEditorButton>
          )}
        </div>
        {offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {offers.map((offer, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <p className="font-medium text-gray-900 text-sm">{offer.name}</p>
                {offer.price != null && (
                  <p className="text-gray-600 text-sm mt-0.5">
                    {formatCurrency(offer.price)}
                    {offer.price_type && offer.price_type !== 'one_time'
                      ? `/${offer.price_type === 'monthly' ? 'mo' : offer.price_type === 'annual' ? 'yr' : offer.price_type}`
                      : ''}
                  </p>
                )}
                {offer.description && (
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{offer.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {viewingOtherClient ? 'No offers listed yet.' : 'No offers yet — add the products or services you sell.'}
          </p>
        )}
      </div>

      {/* Growth Blockers */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Top Growth Blockers</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by estimated revenue impact</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {blockers && blockers.length > 0 && (
              <span className="text-xs font-medium text-brand-orange-dark bg-brand-cream-100 px-2.5 py-1 rounded-full">
                {blockers.length} identified
              </span>
            )}
            {!viewingOtherClient && (
              <OpenEditorButton className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5">
                {blockers && blockers.length > 0 ? 'Edit blockers' : '+ Add blockers'}
              </OpenEditorButton>
            )}
          </div>
        </div>
        {blockers && blockers.length > 0 ? (
          <ol className="space-y-4">
            {[...blockers]
              .sort((a, b) => a.rank - b.rank)
              .map((blocker, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {blocker.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{blocker.title}</p>
                      {blocker.cro_lever && (
                        <span className="text-xs font-medium text-brand-orange-dark bg-brand-cream-100 px-2 py-0.5 rounded-full capitalize">
                          {blocker.cro_lever}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{blocker.explanation}</p>
                  </div>
                </li>
              ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-400">
            {viewingOtherClient
              ? 'No blockers listed yet.'
              : 'No blockers yet — list the things slowing your growth, ranked by impact.'}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end rounded-[25px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_8px_24px_rgba(255,136,0,0.2)]">
        <div>
          <p className="font-bold text-white text-base">Want help executing this plan?</p>
          <p className="text-white/85 text-sm mt-0.5">Book a strategy call to review your numbers and build your roadmap together.</p>
        </div>
        <BookCallButton />
      </div>
    </div>
  )
}

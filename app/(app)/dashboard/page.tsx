import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PaybackChart } from '@/components/dashboard/PaybackChart'
import { ProjectionChart } from '@/components/dashboard/ProjectionChart'
import { MetricsEditor } from '@/components/dashboard/MetricsEditor'
import { formatCurrency, formatMonths, formatPercent, formatNumber } from '@/lib/utils/metrics'
import type { PrimaryOffer, CROBlocker } from '@/types/intake'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: metrics } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!metrics) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No data yet</h2>
        <p className="text-gray-500 mb-6">Complete the intake analysis to see your metrics.</p>
        <Link href="/intake" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">
          Start Intake
        </Link>
      </div>
    )
  }

  const offers = metrics.primary_offers as PrimaryOffer[] | null
  const blockers = metrics.cro_blockers as CROBlocker[] | null

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Identity Header */}
      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {metrics.company_name ? metrics.company_name[0].toUpperCase() : '?'}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {metrics.company_name ?? 'Your Company'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {metrics.website && (
                <a
                  href={metrics.website.startsWith('http') ? metrics.website : `https://${metrics.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-700 truncate"
                >
                  {metrics.website}
                </a>
              )}
              {(metrics.business_type || metrics.industry) && (
                <span className="text-xs text-gray-400">
                  {metrics.business_type}{metrics.industry ? ` · ${metrics.industry}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {metrics.revenue_goal_1yr && (
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">1-Year Revenue Goal</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(metrics.revenue_goal_1yr)}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MetricsEditor metrics={metrics} />
            <Link
              href="/dashboard/report"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              View Full Report →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Core unit economics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="CAC Payback"
          value={formatMonths(metrics.cac_payback_months)}
          description="Months to recoup CAC"
          highlight
        />
        <MetricCard
          label="CAC"
          value={formatCurrency(metrics.cac)}
          description="Cost to acquire a customer"
        />
        <MetricCard
          label="LTV"
          value={formatCurrency(metrics.ltv)}
          description="Customer lifetime value"
        />
        <MetricCard
          label="LTV:CAC Ratio"
          value={metrics.ltv_cac_ratio ? `${metrics.ltv_cac_ratio.toFixed(2)}x` : '—'}
          description="Target: 3x or higher"
        />
      </div>

      {/* Row 2: Revenue & sales */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Monthly Revenue"
          value={formatCurrency(metrics.monthly_revenue)}
        />
        <MetricCard
          label="New Customers/Mo"
          value={formatNumber(metrics.monthly_new_customers, 0)}
        />
        <MetricCard
          label="Close Rate"
          value={formatPercent(metrics.close_rate)}
        />
      </div>

      {/* Row 3: Gross profit split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label="30-Day Gross Profit"
          value={formatCurrency(metrics.gross_profit_first_30_days)}
          description="Cash collected in 30 days minus delivery costs"
        />
        <MetricCard
          label="Lifetime Gross Profit / Customer"
          value={formatCurrency(metrics.lifetime_gross_profit_per_customer)}
          description="Total gross profit over customer lifetime"
        />
      </div>

      {/* Charts */}
      {metrics.cac && metrics.cash_collected_first_30_days && metrics.gross_profit_per_customer && metrics.cac_payback_months ? (
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

      {/* Primary Offers */}
      {offers && offers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Your Primary Offers</h2>
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
        </div>
      )}

      {/* CRO Blockers */}
      {blockers && blockers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Your Top CRO Blockers</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by estimated revenue impact</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {blockers.length} identified
            </span>
          </div>
          <ol className="space-y-4">
            {[...blockers]
              .sort((a, b) => a.rank - b.rank)
              .map((blocker, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {blocker.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{blocker.title}</p>
                      {blocker.cro_lever && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                          {blocker.cro_lever}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{blocker.explanation}</p>
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-medium text-white text-sm">Want help executing this plan?</p>
          <p className="text-gray-400 text-sm mt-0.5">Book a strategy call to review your numbers and build your roadmap together.</p>
        </div>
        <a
          href="https://calendly.com/YOUR_LINK_HERE"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          Book a Strategy Call
        </a>
      </div>
    </div>
  )
}

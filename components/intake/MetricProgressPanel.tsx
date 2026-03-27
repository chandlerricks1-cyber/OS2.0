'use client'

import type { ExtractedMetrics, PrimaryOffer } from '@/types/intake'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMonths,
} from '@/lib/utils/metrics'

interface MetricProgressPanelProps {
  partialMetrics: Partial<ExtractedMetrics>
}

interface MetricCardConfig {
  label: string
  description: string
  getValue: (m: Partial<ExtractedMetrics>) => string
  isDiscovered: (m: Partial<ExtractedMetrics>) => boolean
}

const METRIC_CARDS: MetricCardConfig[] = [
  {
    label: 'CAC',
    description: 'Cost to acquire a customer',
    getValue: (m) => formatCurrency(m.cac ?? null),
    isDiscovered: (m) => m.cac != null,
  },
  {
    label: 'LTV per Customer',
    description: 'Customer lifetime value',
    getValue: (m) => formatCurrency(m.ltv ?? null),
    isDiscovered: (m) => m.ltv != null,
  },
  {
    label: 'LTV:CAC Ratio',
    description: 'Target 3:1 or higher',
    getValue: (m) => {
      const ltv = m.ltv ?? null
      const cac = m.cac ?? null
      if (ltv != null && cac != null && cac > 0) {
        return `${(ltv / cac).toFixed(1)}x`
      }
      return '—'
    },
    isDiscovered: (m) => m.ltv != null && m.cac != null,
  },
  {
    label: 'Monthly Revenue',
    description: 'Current monthly revenue',
    getValue: (m) => formatCurrency(m.monthly_revenue ?? null),
    isDiscovered: (m) => m.monthly_revenue != null,
  },
  {
    label: 'New Customers / Mo',
    description: 'Monthly acquisition volume',
    getValue: (m) => formatNumber(m.monthly_new_customers ?? null, 0),
    isDiscovered: (m) => m.monthly_new_customers != null,
  },
  {
    label: 'Gross Profit / Customer',
    description: 'Per-customer profitability',
    getValue: (m) => formatCurrency(m.gross_profit_per_customer ?? null),
    isDiscovered: (m) => m.gross_profit_per_customer != null,
  },
  {
    label: 'CAC Breakeven',
    description: 'Months to recoup CAC',
    getValue: (m) => {
      const cac = m.cac ?? null
      const gp = m.gross_profit_per_customer ?? null
      if (cac != null && gp != null && gp > 0) {
        return formatMonths(cac / gp)
      }
      return '—'
    },
    isDiscovered: (m) => m.cac != null && m.gross_profit_per_customer != null,
  },
  {
    label: 'Close Rate',
    description: 'Lead-to-customer conversion',
    getValue: (m) => formatPercent(m.close_rate ?? null),
    isDiscovered: (m) => m.close_rate != null,
  },
]

function MetricCard({ config, metrics }: { config: MetricCardConfig; metrics: Partial<ExtractedMetrics> }) {
  const discovered = config.isDiscovered(metrics)
  const value = config.getValue(metrics)

  return (
    <div
      className={`
        rounded-xl p-4 transition-all duration-500
        ${discovered
          ? 'bg-[#1a1208] border border-brand-orange/40 shadow-[0_0_12px_rgba(232,101,48,0.08)]'
          : 'bg-[#141414] border border-dashed border-white/10'
        }
      `}
    >
      <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${discovered ? 'text-brand-orange/70' : 'text-white/30'}`}>
        {config.label}
      </div>
      <div className={`text-xl font-bold tracking-tight transition-all duration-300 ${discovered ? 'text-white' : 'text-white/15'}`}>
        {value}
      </div>
      <div className={`text-[10px] mt-1 transition-colors duration-300 ${discovered ? 'text-white/40' : 'text-white/20'}`}>
        {config.description}
      </div>
    </div>
  )
}

function OfferPill({ offer }: { offer: PrimaryOffer }) {
  const priceLabel = offer.price != null
    ? formatCurrency(offer.price) + (offer.price_type === 'monthly' ? '/mo' : offer.price_type === 'annual' ? '/yr' : '')
    : null

  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#1a1208] border border-brand-orange/30 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-white truncate">{offer.name}</div>
        {priceLabel && (
          <div className="text-xs text-brand-orange/70 mt-0.5">{priceLabel}</div>
        )}
        {offer.description && (
          <div className="text-[11px] text-white/40 mt-1 line-clamp-2">{offer.description}</div>
        )}
      </div>
    </div>
  )
}

export function MetricProgressPanel({ partialMetrics }: MetricProgressPanelProps) {
  const discoveredCount = METRIC_CARDS.filter((c) => c.isDiscovered(partialMetrics)).length
  const offers = partialMetrics.primary_offers ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <h2 className="text-sm font-semibold text-white/80">Your Business Profile</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-amber transition-all duration-700"
              style={{ width: `${Math.round((discoveredCount / METRIC_CARDS.length) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-white/30 tabular-nums shrink-0">
            {discoveredCount}/{METRIC_CARDS.length}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {METRIC_CARDS.map((config) => (
            <MetricCard key={config.label} config={config} metrics={partialMetrics} />
          ))}
        </div>

        {/* Primary Offers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Primary Offers</h3>
            {offers.length > 0 && (
              <span className="text-[10px] bg-brand-orange/20 text-brand-orange rounded-full px-2 py-0.5">
                {offers.length}
              </span>
            )}
          </div>

          {offers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-[#141414] px-4 py-5 text-center">
              <div className="text-[11px] text-white/20">Offers will appear here as they&apos;re identified</div>
            </div>
          ) : (
            <div className="space-y-2">
              {offers.map((offer, i) => (
                <OfferPill key={i} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import type { ExtractedMetrics } from '@/types/intake'

export function calculateDerivedMetrics(raw: ExtractedMetrics) {
  const {
    cac,
    ltv,
    gross_profit_per_customer,
    cash_collected_first_30_days,
    monthly_revenue,
    monthly_new_customers,
    close_rate,
  } = raw

  const ltv_cac_ratio =
    ltv && cac && cac > 0 ? ltv / cac : null

  // CAC payback = CAC / gross profit per customer per month
  // Assuming gross profit per customer is monthly
  const cac_payback_months =
    cac && gross_profit_per_customer && gross_profit_per_customer > 0
      ? cac / gross_profit_per_customer
      : null

  // Required 30-day revenue to cover CAC at current close rate
  // If close rate = 20% and CAC = $1000, need $1000 / 0.20 = $5000 in pipeline
  // Simpler: revenue needed so that cash collected in 30 days >= CAC
  const required_30_day_revenue =
    cac && close_rate && close_rate > 0 ? cac / close_rate : null

  return {
    ltv_cac_ratio,
    cac_payback_months,
    required_30_day_revenue,
  }
}

export function formatCurrency(value: number | null, decimals = 0): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatNumber(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—'
  // value is a decimal (0.0 - 1.0)
  return `${(value * 100).toFixed(1)}%`
}

export function formatMonths(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)} mo`
}

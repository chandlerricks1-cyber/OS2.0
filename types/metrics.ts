export interface BusinessMetrics {
  id: string
  user_id: string
  company_name: string | null
  website: string | null
  revenue_goal_1yr: number | null
  business_type: string | null
  industry: string | null
  cac: number | null
  ltv: number | null
  ltv_cac_ratio: number | null
  gross_profit_per_customer: number | null
  gross_profit_first_30_days: number | null
  lifetime_gross_profit_per_customer: number | null
  cash_collected_first_30_days: number | null
  monthly_revenue: number | null
  monthly_new_customers: number | null
  close_rate: number | null
  cac_payback_months: number | null
  required_30_day_revenue: number | null
  extraction_confidence: Record<string, number> | null
  raw_extraction: Record<string, unknown> | null
  updated_at: string
}

export interface MetricCardData {
  label: string
  value: string | number | null
  unit?: string
  description?: string
  trend?: 'up' | 'down' | 'neutral'
}

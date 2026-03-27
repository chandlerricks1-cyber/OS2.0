export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface IntakeSession {
  id: string
  user_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  started_at: string
  completed_at: string | null
}

export interface PrimaryOffer {
  name: string
  price: number | null
  price_type: 'one_time' | 'monthly' | 'annual' | 'custom' | null
  description: string | null
}

export interface CROBlocker {
  rank: number
  title: string
  explanation: string
  cro_lever: string
}

export interface ExtractedMetrics {
  cac?: number | null
  ltv?: number | null
  gross_profit_per_customer?: number | null
  cash_collected_first_30_days?: number | null
  monthly_revenue?: number | null
  monthly_new_customers?: number | null
  close_rate?: number | null
  extraction_confidence?: Record<string, number>
  business_type?: string | null
  industry?: string | null
  primary_offers?: PrimaryOffer[] | null
  cro_blockers?: CROBlocker[] | null
}

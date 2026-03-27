export interface BenchmarkRow {
  metric: string
  their_value: string
  industry_avg: string
  status: 'critical' | 'warning' | 'good'
  context: string
}

export interface Bottleneck {
  rank: number
  title: string
  severity: 'critical' | 'high' | 'medium'
  diagnosis: string
  root_cause: string
  revenue_impact: string
}

export interface Opportunity {
  rank: number
  title: string
  effort: 'quick-win' | 'medium' | 'strategic'
  estimated_impact: string
  description: string
  specific_action: string
}

export interface ActionPlanItem {
  period: string
  priority: string
  actions: string[]
}

export interface Projection {
  scenario: string
  metric: string
  current: string
  projected: string
  timeframe: string
}

export interface CROReport {
  health_score: number
  health_label: 'Critical' | 'Concerning' | 'Moderate' | 'Healthy' | 'Excellent'
  health_summary: string
  benchmarks: BenchmarkRow[]
  bottlenecks: Bottleneck[]
  opportunities: Opportunity[]
  action_plan: ActionPlanItem[]
  projections: Projection[]
}

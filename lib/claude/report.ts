import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BusinessMetrics } from '@/types/metrics'
import type { CROReport } from '@/types/report'
import { formatCurrency, formatMonths, formatPercent } from '@/lib/utils/metrics'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const BENCHMARK_REFERENCE = `
INDUSTRY BENCHMARK REFERENCE (use to compare their metrics):

LTV:CAC RATIO
- Excellent: 5x or higher
- Healthy: 3x–5x
- Concerning: 1x–3x
- Critical: below 1x

CAC PAYBACK PERIOD
- Excellent: under 6 months
- Healthy: 6–12 months
- Concerning: 12–24 months
- Critical: over 24 months

CLOSE RATE (B2B / service businesses)
- Excellent: 30%+
- Healthy: 20%–30%
- Concerning: 10%–20%
- Critical: below 10%

GROSS PROFIT MARGIN BY BUSINESS TYPE
- SaaS / Software: 70%–85% healthy
- Agency / Consulting: 50%–70% healthy
- Service business (non-software): 40%–60% healthy
- E-commerce / product: 30%–50% healthy

CASH COLLECTED IN FIRST 30 DAYS vs CAC
- Healthy: 50%+ of CAC recovered in first 30 days
- Concerning: 25%–50% recovered
- Critical: less than 25% recovered

REVENUE PER CUSTOMER vs CAC
- If monthly gross profit per customer × 12 < CAC: structural profitability problem
`

function buildCROPrompt(metrics: BusinessMetrics, intakeContext: string): string {
  const ltvCacRatio = metrics.ltv_cac_ratio?.toFixed(2) ?? 'unknown'
  const paybackMonths = metrics.cac_payback_months ?? null
  const cashVsCac =
    metrics.cash_collected_first_30_days && metrics.cac
      ? ((metrics.cash_collected_first_30_days / metrics.cac) * 100).toFixed(0) + '%'
      : 'unknown'

  return `You are a Chief Revenue Officer conducting a structured business health audit. You have been given a business's key unit economics extracted from an intake interview. Your job is to:
1. Score overall revenue health
2. Compare each metric against industry benchmarks
3. Identify the specific bottlenecks causing cash flow and growth problems
4. Prescribe high-leverage opportunities ranked by impact
5. Give a concrete 90-day action plan based solely on their actual numbers

${BENCHMARK_REFERENCE}

BUSINESS DATA:
- Business type: ${metrics.business_type ?? 'not specified'}
- Industry: ${metrics.industry ?? 'not specified'}
- CAC (Customer Acquisition Cost): ${formatCurrency(metrics.cac)}
- LTV (Lifetime Value): ${formatCurrency(metrics.ltv)}
- LTV:CAC Ratio: ${ltvCacRatio}x
- Gross Profit per Customer (monthly): ${formatCurrency(metrics.gross_profit_per_customer)}
- Cash Collected in First 30 Days: ${formatCurrency(metrics.cash_collected_first_30_days)}
- Cash vs CAC Recovery (first 30 days): ${cashVsCac}
- Monthly Revenue: ${formatCurrency(metrics.monthly_revenue)}
- Monthly New Customers: ${metrics.monthly_new_customers ?? 'unknown'}
- Close Rate: ${formatPercent(metrics.close_rate)}
- CAC Payback Period: ${formatMonths(paybackMonths)}
- Required 30-Day Revenue to Break Even on CAC: ${formatCurrency(metrics.required_30_day_revenue)}

INTAKE CONVERSATION (for context on how numbers were derived):
${intakeContext}

HEALTH SCORING GUIDE:
- health_score 0–25 = Critical
- health_score 26–45 = Concerning
- health_score 46–65 = Moderate
- health_score 66–80 = Healthy
- health_score 81–100 = Excellent

Base the health_score on a weighted blend: LTV:CAC ratio (40%), payback period (35%), close rate (15%), first-30-day cash recovery (10%).

OUTPUT INSTRUCTIONS:
Return ONLY a single valid JSON object. No preamble. No explanation. No markdown code fences. Just the raw JSON.

The JSON must match this exact schema:

{
  "health_score": <integer 0–100>,
  "health_label": <"Critical" | "Concerning" | "Moderate" | "Healthy" | "Excellent">,
  "health_summary": "<2–3 sentence CRO-level diagnosis of where this business stands and what the core problem is>",

  "benchmarks": [
    {
      "metric": "<metric name>",
      "their_value": "<formatted value>",
      "industry_avg": "<benchmark range>",
      "status": <"critical" | "warning" | "good">,
      "context": "<one sentence explaining what this means for their business specifically>"
    }
  ],

  "bottlenecks": [
    {
      "rank": <integer starting at 1>,
      "title": "<short name for the bottleneck>",
      "severity": <"critical" | "high" | "medium">,
      "diagnosis": "<what is broken — use their specific numbers>",
      "root_cause": "<why it is happening — the upstream reason, not the symptom>",
      "revenue_impact": "<what this specific bottleneck is costing them in concrete terms>"
    }
  ],

  "opportunities": [
    {
      "rank": <integer starting at 1>,
      "title": "<short name>",
      "effort": <"quick-win" | "medium" | "strategic">,
      "estimated_impact": "<specific projection using their numbers, e.g. 'Cuts payback from 14 to 9 months'>",
      "description": "<what this opportunity is and why it works for their situation>",
      "specific_action": "<the concrete first step they can take this week>"
    }
  ],

  "action_plan": [
    {
      "period": "<e.g. 'Days 1–14' or 'Month 1'>",
      "priority": "<the main focus for this period>",
      "actions": ["<specific action>", "<specific action>"]
    }
  ],

  "projections": [
    {
      "scenario": "<e.g. 'If you implement Opportunity 1'>",
      "metric": "<metric being projected>",
      "current": "<their current value>",
      "projected": "<realistic projected value>",
      "timeframe": "<e.g. '90 days'>"
    }
  ]
}

RULES:
- benchmarks: include LTV:CAC Ratio, CAC Payback Period, Close Rate, and First-30-Day Cash Recovery at minimum
- bottlenecks: identify 2–4, ranked by severity. Each must reference their actual numbers, not generic observations
- opportunities: provide exactly 3, ranked by estimated revenue impact. Each must tie directly to a bottleneck
- action_plan: cover 3 time periods (Days 1–14, Month 1, Month 2–3)
- projections: provide 2–3 scenarios corresponding to the top opportunities
- Be a CRO, not a consultant. Be direct, use their numbers, skip the caveats.`
}

export async function generateReport(
  metrics: BusinessMetrics,
  intakeMessages: Array<{ role: string; content: string }>
): Promise<string> {
  const intakeContext = intakeMessages
    .slice(-20)
    .map((m) => `${m.role === 'user' ? 'Business Owner' : 'Analyst'}: ${m.content}`)
    .join('\n\n')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(buildCROPrompt(metrics, intakeContext))
  const text = result.response.text()

  // Strip markdown code fences if Gemini wrapped the JSON anyway
  let raw = text.trim()
  const fenceMatch = raw.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/)
  if (fenceMatch) {
    raw = fenceMatch[1].trim()
  }

  // Validate the JSON before returning
  try {
    JSON.parse(raw) as CROReport
  } catch {
    throw new Error('Report generation returned invalid JSON')
  }

  return raw
}

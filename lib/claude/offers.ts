import { GoogleGenerativeAI } from '@google/generative-ai'
import { formatCurrency, formatPercent } from '@/lib/utils/metrics'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface GeneratedOffer {
  name: string
  offer_type: 'attraction' | 'upsell' | 'downsell' | 'continuity'
  price: string
  what_customer_gets: string
  why_do_it: string
  when_offered: string
  trigger: string
  sales_pitch: string
}

const VALID_TYPES = ['attraction', 'upsell', 'downsell', 'continuity'] as const

const OFFER_TYPE_STRATEGIES: Record<string, string> = {
  attraction: `Choose from these ATTRACTION strategies:
1. **Win Your Money Back** — Customer pays, hits a goal, gets money back as cash or store credit.
2. **Giveaways** — Advertise a grand prize. One person wins free. Everyone else gets a promotional discount.
3. **Decoy Offer** — Advertise something free or deeply discounted. Present a premium version side-by-side.
4. **Buy X Get Y Free** — Bundle multiple units and give extras free. "Buy 6 months, get 6 months free" beats "50% off."
5. **Pay Less Now or Pay More Later** — Free trial with delayed billing, or discount for paying today. Gets card on file.`,
  upsell: `Choose from these UPSELL strategies:
1. **Classic Upsell** — "You can't have X without Y." Solve the next problem after the first purchase. BAMFAM.
2. **Menu Upsell** — Unsell what they don't need, prescribe what they do, A/B choice (not yes/no), card on file.
3. **Anchor Upsell** — Present the most expensive option first (5-10x main offer). Get "The Gasp."
4. **Rollover Upsell** — Credit previous purchases toward the next offer. Price next offer at least 4x the credit amount.`,
  downsell: `Choose from these DOWNSELL strategies (never drop the price for the same thing — downsells are trades, not discounts):
1. **Payment Plan Downsells** — Same product, same price, spread over time.
2. **Trial With Penalty** — Free trial with conditions. If they meet terms, it stays free. If not, they pay fees.
3. **Feature Downsells** — Lower the price by removing features (not discounting the same thing).`,
  continuity: `Choose from these CONTINUITY strategies:
1. **Continuity Bonus Offers** — Give an awesome thing free if they sign up today. Focus marketing on the bonus.
2. **Continuity Discount Offers** — Give free time if they commit. Bill in 4-week cycles (13/year vs 12 months).
3. **Waived Fee Offers** — Month-to-month with a setup fee (3-5x monthly rate), OR waive the fee with a commitment.`,
}

function buildSingleOfferPrompt(
  offerType: string,
  metrics: Record<string, unknown>,
  existingOfferNames: string[],
  intakeContext: string
): string {
  return `You are a strategic offer architect. Generate ONE new "${offerType}" offer idea for this business.

# MONEY MODEL CONTEXT

A Money Model is a sequence of offers engineered to maximize gross profit in the first 30 days after acquiring a customer.
- **Attraction Offer** — the entry point that converts a lead into a customer
- **Upsell Offer** — a higher-value offer presented after the initial purchase
- **Downsell Offer** — a lower-barrier alternative when the upsell is declined
- **Continuity Offer** — an ongoing subscription that stabilizes monthly cash flow

# VALUE EQUATION

Value = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice)

# RULES

- Simple scales. Complex stalls.
- Focus on the first 30 days of the customer journey.
- Offer name must be descriptive — a stranger should understand what it is. No creative branding names.
- Embed Grand Slam Offer principles: increase perceived likelihood, shorten time delay, increase dream outcome, decrease effort.
${offerType === 'continuity' ? '- Continuity must be simple, sticky, solve an ongoing need, and logically extend from the initial transaction.' : ''}

# STRATEGY CATALOG

${OFFER_TYPE_STRATEGIES[offerType] ?? ''}

# BUSINESS DATA

- Business type: ${metrics.business_type ?? 'not specified'}
- Industry: ${metrics.industry ?? 'not specified'}
- Company: ${metrics.company_name ?? 'not specified'}
- CAC: ${formatCurrency(metrics.cac as number | null)}
- LTV: ${formatCurrency(metrics.ltv as number | null)}
- Gross Profit per Customer: ${formatCurrency(metrics.gross_profit_per_customer as number | null)}
- Cash Collected in First 30 Days: ${formatCurrency(metrics.cash_collected_first_30_days as number | null)}
- Monthly Revenue: ${formatCurrency(metrics.monthly_revenue as number | null)}
- Monthly New Customers: ${metrics.monthly_new_customers ?? 'unknown'}
- Close Rate: ${formatPercent(metrics.close_rate as number | null)}
- Current Offers: ${JSON.stringify(metrics.primary_offers ?? [])}

INTAKE CONVERSATION (for context):
${intakeContext}

# EXISTING OFFERS TO AVOID DUPLICATING

The business already has these offers: ${existingOfferNames.length > 0 ? existingOfferNames.join(', ') : 'none yet'}. Generate something DIFFERENT from these — use a different strategy or angle.

# OUTPUT

Return ONLY a single valid JSON object. No preamble. No explanation. No markdown code fences.

{
  "name": "<descriptive offer name>",
  "offer_type": "${offerType}",
  "price": "<pricing string>",
  "what_customer_gets": "<specific deliverables>",
  "why_do_it": "<value proposition / pain avoided>",
  "when_offered": "<timing in customer journey>",
  "trigger": "<what signals it's time to present this offer>",
  "sales_pitch": "<talking points to sell it + how to present it>"
}`
}

export async function generateSingleOffer(
  offerType: string,
  metrics: Record<string, unknown>,
  existingOfferNames: string[],
  intakeMessages: Array<{ role: string; content: string }>
): Promise<GeneratedOffer> {
  if (!VALID_TYPES.includes(offerType as typeof VALID_TYPES[number])) {
    throw new Error(`Invalid offer_type: ${offerType}`)
  }

  const intakeContext = intakeMessages
    .slice(-20)
    .map((m) => `${m.role === 'user' ? 'Business Owner' : 'Analyst'}: ${m.content}`)
    .join('\n\n')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(
    buildSingleOfferPrompt(offerType, metrics, existingOfferNames, intakeContext)
  )
  const text = result.response.text()

  let raw = text.trim()
  const fenceMatch = raw.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/)
  if (fenceMatch) {
    raw = fenceMatch[1].trim()
  }

  const offer = JSON.parse(raw) as GeneratedOffer

  if (!offer.name || !offer.offer_type) {
    throw new Error('Generated offer missing required fields')
  }

  // Force the correct type in case the model deviated
  offer.offer_type = offerType as GeneratedOffer['offer_type']

  return offer
}

function buildOfferPrompt(
  metrics: Record<string, unknown>,
  intakeContext: string
): string {
  return `You are a strategic offer architect and money model engineer. Your job is to generate 8 "Crucible Approved" offer ideas — 2 per offer type — based on the business data below.

# WHAT A MONEY MODEL IS

A Money Model is a sequence of offers presented to customers, engineered to:
1. Increase LTV of customers
2. Increase 30-day gross profit — the gross profit generated within the first 30 days after converting a lead
3. Lower CAC — cost to acquire a customer
4. Stabilize cash flow via recurring payments

The purpose: change the customer acquisition economics so that the business makes significantly more gross profit from a customer within the first 30 days than it costs to acquire that customer.

The first 30 days of the customer journey matter most.

# THE 4 OFFER TYPES

1. **Attraction Offer** — the entry point that converts a lead into a customer
2. **Upsell Offer** — a higher-value offer presented after the initial purchase
3. **Downsell Offer** — a lower-barrier alternative when the upsell is declined
4. **Continuity Offer** — an ongoing subscription that stabilizes monthly cash flow

# VALUE EQUATION (Use When Evaluating Every Offer)

Value = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice)

- Dream Outcome (increase): What result does the customer actually want? Frame in terms of status gain.
- Perceived Likelihood of Achievement (increase): How certain are they it will work for THEM?
- Time Delay (decrease): How fast do they see results? Create fast emotional wins early.
- Effort & Sacrifice (decrease): How much work/pain is required? Done-for-you beats do-it-yourself.

# OFFER CREATION RULES

- Simple scales. Complex stalls.
- Focus on what happens in the first 30 days of the customer journey.
- Embed Grand Slam Offer principles: increase perceived likelihood of achievement, shorten time delay, increase dream outcome, decrease effort and sacrifice.
- Continuity must be simple, sticky, solve an ongoing need, and logically extend from the initial transaction.
- Offer names must be descriptive — a stranger should understand what the offer is by reading the name alone. No creative branding names.
  - Bad: "The Chroma Club Membership"
  - Good: "Monthly Discounted Accent Pack Membership"

# GRAND SLAM OFFER CONSTRUCTION

1. Identify the dream outcome (sell the vacation, not the plane flight)
2. List ALL problems/obstacles the customer will encounter
3. Turn each problem into a solution
4. Create delivery vehicles for each solution (1-on-1, group, DIY/DWY/DFY, live/recorded)
5. Trim (remove high cost/low value) and Stack (keep high value items)

# OFFER ENHANCEMENT TOOLS

- Scarcity: Limited spots, limited bonuses, never available again.
- Urgency: Rolling cohorts, seasonal deadlines, pricing/bonus expiration.
- Bonuses: Break offer into components and present as stacked bonuses. Each bonus should address a specific obstacle.
- Guarantees: Unconditional, Conditional, Anti-guarantee, Implied. Stack multiple guarantees.

# ATTRACTION OFFER STRATEGIES (choose from these)

1. **Win Your Money Back** — Customer pays, hits a goal, gets money back as cash or store credit. Works best with programs requiring continuous effort.
2. **Giveaways** — Advertise a grand prize. One person wins free. Everyone else gets a promotional discount. Use urgency deadlines and qualifying actions.
3. **Decoy Offer** — Advertise something free or deeply discounted. When leads engage, present a premium version side-by-side. The decoy makes the premium the obvious choice.
4. **Buy X Get Y Free** — Bundle multiple units and give extras free. "Buy 6 months, get 6 months free" beats "50% off."
5. **Pay Less Now or Pay More Later** — Free trial with delayed billing, or discount for paying today. Gets card on file.

# UPSELL OFFER STRATEGIES (choose from these)

1. **Classic Upsell** — "You can't have X without Y." Solve the next problem after the first purchase. BAMFAM — book a meeting from every meeting.
2. **Menu Upsell** — Unsell what they don't need, prescribe what they do, A/B choice (not yes/no), card on file.
3. **Anchor Upsell** — Present the most expensive option first (5-10x main offer). Get "The Gasp." Come to the rescue with the main offer.
4. **Rollover Upsell** — Credit previous purchases toward the next offer. Price next offer at least 4x the credit amount.

# DOWNSELL OFFER STRATEGIES (choose from these)

Rules: Never drop the price for the same thing. Downsells are trades, not discounts.

1. **Payment Plan Downsells** — Same product, same price, spread over time.
2. **Trial With Penalty** — Free trial with conditions. If they meet terms, it stays free. If not, they pay fees. Get card on file.
3. **Feature Downsells** — Lower the price by removing features (not discounting the same thing). Remove highest-value features first.

# CONTINUITY OFFER STRATEGIES (choose from these)

1. **Continuity Bonus Offers** — Give an awesome thing free if they sign up today. Focus marketing on the bonus, not the membership.
2. **Continuity Discount Offers** — Give free time if they commit. Bill in 4-week cycles (13/year vs 12 months = 8.3% more revenue).
3. **Waived Fee Offers** — Month-to-month with a setup fee (3-5x monthly rate), OR waive the fee with a commitment.

# BUSINESS DATA

- Business type: ${metrics.business_type ?? 'not specified'}
- Industry: ${metrics.industry ?? 'not specified'}
- Company: ${metrics.company_name ?? 'not specified'}
- CAC (Customer Acquisition Cost): ${formatCurrency(metrics.cac as number | null)}
- LTV (Lifetime Value): ${formatCurrency(metrics.ltv as number | null)}
- Gross Profit per Customer: ${formatCurrency(metrics.gross_profit_per_customer as number | null)}
- Cash Collected in First 30 Days: ${formatCurrency(metrics.cash_collected_first_30_days as number | null)}
- Monthly Revenue: ${formatCurrency(metrics.monthly_revenue as number | null)}
- Monthly New Customers: ${metrics.monthly_new_customers ?? 'unknown'}
- Close Rate: ${formatPercent(metrics.close_rate as number | null)}
- Current Offers: ${JSON.stringify(metrics.primary_offers ?? [])}
- CRO Blockers: ${JSON.stringify(metrics.cro_blockers ?? [])}

INTAKE CONVERSATION (for deeper context):
${intakeContext}

# YOUR TASK

Generate exactly 8 offer ideas — 2 for each of the 4 types (attraction, upsell, downsell, continuity).

For each type, the 2 offers MUST use DIFFERENT strategies from the reference catalogs above. Do not generate two variations of the same strategy.

Each offer should be tailored to this specific business — use their industry, business type, metrics, current offers, and blockers to make the offers concrete and actionable.

The "sales_pitch" field should include both talking points to sell the offer AND how to organically present it to the customer.

# OUTPUT

Return ONLY a single valid JSON object. No preamble. No explanation. No markdown code fences. Just the raw JSON.

{
  "offers": [
    {
      "name": "<descriptive offer name>",
      "offer_type": "attraction",
      "price": "<pricing string, e.g. '$499 one-time', '$99/mo', 'Free'>",
      "what_customer_gets": "<specific deliverables>",
      "why_do_it": "<value proposition / pain avoided>",
      "when_offered": "<timing in customer journey>",
      "trigger": "<what signals it's time to present this offer>",
      "sales_pitch": "<talking points to sell it + how to present it>"
    }
  ]
}

The offers array must contain exactly 8 objects: 2 attraction, 2 upsell, 2 downsell, 2 continuity. Order them: attraction first, then upsell, downsell, continuity.`
}

export async function generateCrucibleOffers(
  metrics: Record<string, unknown>,
  intakeMessages: Array<{ role: string; content: string }>
): Promise<GeneratedOffer[]> {
  const intakeContext = intakeMessages
    .slice(-20)
    .map((m) => `${m.role === 'user' ? 'Business Owner' : 'Analyst'}: ${m.content}`)
    .join('\n\n')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(buildOfferPrompt(metrics, intakeContext))
  const text = result.response.text()

  // Strip markdown code fences if Gemini wrapped the JSON
  let raw = text.trim()
  const fenceMatch = raw.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/)
  if (fenceMatch) {
    raw = fenceMatch[1].trim()
  }

  const parsed = JSON.parse(raw) as { offers: GeneratedOffer[] }
  const offers = parsed.offers

  if (!Array.isArray(offers) || offers.length !== 8) {
    throw new Error(`Expected 8 offers, got ${Array.isArray(offers) ? offers.length : 'non-array'}`)
  }

  // Validate each offer has the required type
  for (const offer of offers) {
    if (!VALID_TYPES.includes(offer.offer_type as typeof VALID_TYPES[number])) {
      throw new Error(`Invalid offer_type: ${offer.offer_type}`)
    }
  }

  // Validate 2 per type
  for (const type of VALID_TYPES) {
    const count = offers.filter((o) => o.offer_type === type).length
    if (count !== 2) {
      throw new Error(`Expected 2 ${type} offers, got ${count}`)
    }
  }

  return offers
}

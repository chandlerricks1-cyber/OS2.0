// Parsers for the free-text answers in the podcast intake questionnaire.
// All parsers return null when the input is ambiguous — leaving a metric
// blank is preferable to fabricating a number on the dashboard.

const REVENUE_BUCKET_MIDPOINTS: Record<string, number> = {
  'Under $10k': 5000,
  '$10k-$25k': 17500,
  '$25k-$50k': 37500,
  '$50k-$100k': 75000,
  '$100k-$250k': 175000,
  '$250k-$500k': 375000,
  '$500k+': 500000,
}

export function parseRevenueRange(input: string | null | undefined): number | null {
  if (!input) return null
  const value = REVENUE_BUCKET_MIDPOINTS[input.trim()]
  return value ?? null
}

export function parseMoney(input: string | null | undefined): number | null {
  if (!input) return null
  const cleaned = input.replace(/[$,\s]/g, '').toLowerCase()
  const match = cleaned.match(/(\d+(?:\.\d+)?)(k|m)?/)
  if (!match) return null
  const num = parseFloat(match[1])
  if (!Number.isFinite(num)) return null
  const unit = match[2]
  if (unit === 'k') return num * 1000
  if (unit === 'm') return num * 1_000_000
  return num
}

export function parsePercent(input: string | null | undefined): number | null {
  if (!input) return null
  const trimmed = input.trim()
  const match = trimmed.match(/(\d+(?:\.\d+)?)\s*%/)
  if (!match) {
    const bare = trimmed.match(/^(\d+(?:\.\d+)?)$/)
    if (!bare) return null
    const num = parseFloat(bare[1])
    if (!Number.isFinite(num)) return null
    if (num > 1 && num <= 100) return num / 100
    if (num >= 0 && num <= 1) return num
    return null
  }
  const num = parseFloat(match[1])
  if (!Number.isFinite(num)) return null
  if (num < 0 || num > 100) return null
  return num / 100
}

export function parseInteger(input: string | null | undefined): number | null {
  if (!input) return null
  const cleaned = input.replace(/,/g, '')
  const match = cleaned.match(/(\d+)/)
  if (!match) return null
  const num = parseInt(match[1], 10)
  return Number.isFinite(num) ? num : null
}

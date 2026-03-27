'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'monthly',
    name: 'Crucible CRO Plan',
    price: '$3,000',
    period: '/month',
    description: 'Full access, cancel anytime',
    features: [
      'Complete CAC payback analysis',
      'AI-generated 90-day action plan',
      'All 7 business metrics tracked',
      'Payback curve visualization',
      'Scenario modeling',
      'Monthly re-analysis',
    ],
    planType: 'monthly' as const,
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'one_time',
    name: 'Scaling Roadmap',
    price: '$499',
    period: 'one time',
    description: 'Lifetime access to your analysis',
    features: [
      'Everything in the CRO Plan',
      'Permanent access — no subscription',
      'Report PDF export (coming soon)',
      'Priority support',
    ],
    planType: 'one_time' as const,
    cta: 'Buy Once',
    highlighted: true,
  },
]

export default function UpgradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(planType: 'monthly' | 'one_time') {
    setLoading(planType)
    setError(null)

    const priceId =
      planType === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID

    if (!priceId) {
      setError('Price configuration missing. Contact support.')
      setLoading(null)
      return
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planType }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Checkout failed')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Unlock your full analysis
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Your intake is complete. Subscribe to see your personalized CAC report,
          90-day action plan, and scenario modeling.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm text-center">
          {error}
        </div>
      )}

      {/* Teaser metrics */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          From your intake — preview
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">CAC Payback Period</p>
            <p className="text-2xl font-bold text-gray-900 filter blur-sm select-none">
              8.4 mo
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">LTV:CAC Ratio</p>
            <p className="text-2xl font-bold text-gray-900 filter blur-sm select-none">
              2.8x
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Subscribe to unlock your real numbers
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 border ${
              plan.highlighted
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="mb-5">
              <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm mt-1 ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                {plan.description}
              </p>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className={`flex items-start gap-2 text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan.planType)}
              disabled={loading !== null}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                plan.highlighted
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {loading === plan.planType ? 'Redirecting…' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Secure checkout via Stripe. Cancel monthly plan anytime.
      </p>
    </div>
  )
}

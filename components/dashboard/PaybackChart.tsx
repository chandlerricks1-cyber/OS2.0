'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

interface PaybackChartProps {
  cac: number
  cashCollectedFirst30Days: number
  grossProfitPerCustomer: number
  paybackMonths: number
}

export function PaybackChart({
  cac,
  cashCollectedFirst30Days,
  grossProfitPerCustomer,
  paybackMonths,
}: PaybackChartProps) {
  const months = Math.ceil(paybackMonths) + 2
  const data = Array.from({ length: months + 1 }, (_, i) => {
    const cumulativeRevenue =
      i === 0
        ? 0
        : cashCollectedFirst30Days + (i - 1) * grossProfitPerCustomer
    return {
      month: `M${i}`,
      revenue: Math.round(cumulativeRevenue),
      cac: cac,
    }
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-1">CAC Payback Curve</h3>
      <p className="text-xs text-gray-500 mb-4">
        Cumulative cash collected vs. your CAC of ${cac.toLocaleString()}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === 'revenue' ? 'Cash Collected' : 'CAC',
            ]}
          />
          <ReferenceLine
            y={cac}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{ value: 'CAC', position: 'right', fontSize: 11, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#111827"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

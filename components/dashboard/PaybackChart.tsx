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
      i === 0 ? 0 : cashCollectedFirst30Days + (i - 1) * grossProfitPerCustomer
    return {
      month: i,
      revenue: Math.round(cumulativeRevenue),
      cac: cac,
    }
  })

  const pillText = `$${cac.toLocaleString()} CAC`

  return (
    <div className="bg-white rounded-[25px] border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-1">CAC Payback Curve</h3>
      <p className="text-xs text-gray-500 mb-4">
        Cumulative cash collected vs. your CAC of ${cac.toLocaleString()}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => (v === 0 ? 'Start' : `Month ${v}`)}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            labelFormatter={(v: number) => (v === 0 ? 'Start' : `Month ${v}`)}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === 'revenue' ? 'Cash Collected' : 'CAC',
            ]}
          />
          <ReferenceLine
            y={cac}
            stroke="#ef4444"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={(props: { viewBox?: { x?: number; y?: number; width?: number } }) => {
              const vb = props.viewBox ?? {}
              const lineRight = (vb.x ?? 0) + (vb.width ?? 0)
              const lineY = vb.y ?? 0
              const pillW = pillText.length * 6.5 + 20
              const pillH = 22
              const gap = 10
              // Prefer pill above the line; if not enough headroom, place it below.
              const placeAbove = lineY > pillH + gap + 4
              const pillX = lineRight - pillW - 4
              const pillY = placeAbove ? lineY - pillH - gap : lineY + gap
              const tetherY1 = placeAbove ? pillY + pillH : pillY
              return (
                <g>
                  {/* Tether from pill to the dotted line */}
                  <line
                    x1={pillX + pillW / 2}
                    y1={tetherY1}
                    x2={pillX + pillW / 2}
                    y2={lineY}
                    stroke="#ef4444"
                    strokeWidth={1.5}
                  />
                  {/* Pill */}
                  <rect
                    x={pillX}
                    y={pillY}
                    width={pillW}
                    height={pillH}
                    rx={pillH / 2}
                    ry={pillH / 2}
                    fill="#ef4444"
                  />
                  <text
                    x={pillX + pillW / 2}
                    y={pillY + pillH / 2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill="#fff"
                  >
                    {pillText}
                  </text>
                </g>
              )
            }}
          />
          <Line type="monotone" dataKey="revenue" stroke="#ff8800" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

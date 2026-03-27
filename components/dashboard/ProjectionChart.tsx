'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ProjectionChartProps {
  currentPaybackMonths: number
  ltv: number
  cac: number
}

export function ProjectionChart({ currentPaybackMonths, ltv, cac }: ProjectionChartProps) {
  const scenarios = [
    {
      label: 'Current',
      payback: currentPaybackMonths,
      ltvCac: ltv / cac,
      fill: '#9ca3af',
    },
    {
      label: '+10% Cash',
      payback: currentPaybackMonths * 0.9,
      ltvCac: (ltv / cac) * 1.1,
      fill: '#6b7280',
    },
    {
      label: '+20% Margin',
      payback: currentPaybackMonths * 0.8,
      ltvCac: (ltv / cac) * 1.2,
      fill: '#374151',
    },
    {
      label: 'Crucible',
      payback: 1,
      ltvCac: ltv / cac,
      fill: '#111827',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-1">Payback Scenarios</h3>
      <p className="text-xs text-gray-500 mb-4">
        What your payback period looks like with Crucible Coaching — CAC fully recovered in month 1
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={scenarios} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(1)}mo`}
          />
          <Tooltip
            formatter={(value: number, _name: string, props: { payload?: { label?: string } }) => {
              const label = props?.payload?.label
              if (label === 'Crucible') return ['1 month (CAC recovered at conversion)', 'Payback Period']
              return [`${value.toFixed(1)} months`, 'Payback Period']
            }}
          />
          <Bar dataKey="payback" radius={[4, 4, 0, 0]}>
            {scenarios.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

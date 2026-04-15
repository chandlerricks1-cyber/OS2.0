'use client'

import { TrendingDown, Zap, Flame } from 'lucide-react'

interface ProjectionChartProps {
  currentPaybackMonths: number
  ltv: number
  cac: number
}

type Scenario = {
  key: 'current' | 'better' | 'best'
  label: string
  sublabel: string
  months: number
  tag: string
  bar: string // tailwind bg class for the bar
  chip: string // tailwind classes for the tag chip
  icon: React.ReactNode
}

function formatDuration(months: number): { primary: string; unit: string } {
  if (months < 1) {
    const days = Math.max(1, Math.round(months * 30))
    return { primary: String(days), unit: days === 1 ? 'day' : 'days' }
  }
  const m = months < 10 ? months.toFixed(1) : months.toFixed(0)
  return { primary: m, unit: Number(m) === 1 ? 'month' : 'months' }
}

export function ProjectionChart({ currentPaybackMonths }: ProjectionChartProps) {
  const better = currentPaybackMonths / 1.1 // +10% pricing → faster payback
  const best = currentPaybackMonths * 0.2 // Crucible: 80% reduction

  const scenarios: Scenario[] = [
    {
      key: 'current',
      label: 'Today',
      sublabel: 'Your current payback period',
      months: currentPaybackMonths,
      tag: 'Current',
      bar: 'bg-gray-300',
      chip: 'bg-gray-100 text-gray-600',
      icon: <TrendingDown className="w-4 h-4" />,
    },
    {
      key: 'better',
      label: 'Better',
      sublabel: 'Raise pricing by 10%',
      months: better,
      tag: '−9%',
      bar: 'bg-gradient-to-r from-amber-300 to-amber-400',
      chip: 'bg-amber-50 text-amber-700',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      key: 'best',
      label: 'Best',
      sublabel: 'With Crucible — 80% faster payback',
      months: best,
      tag: '−80%',
      bar: 'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end',
      chip: 'bg-brand-cream-100 text-brand-orange-dark',
      icon: <Flame className="w-4 h-4" />,
    },
  ]

  const max = Math.max(...scenarios.map((s) => s.months))

  return (
    <div className="bg-white rounded-[25px] border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Payback Scenarios</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            How fast you recover CAC — today vs. what&apos;s possible
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {scenarios.map((s) => {
          const { primary, unit } = formatDuration(s.months)
          const widthPct = max > 0 ? Math.max(4, (s.months / max) * 100) : 0
          const isBest = s.key === 'best'
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${s.chip}`}
                  >
                    {s.icon}
                    {s.tag}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-sm font-bold truncate ${isBest ? 'text-brand-orange-dark' : 'text-gray-900'}`}>
                      {s.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{s.sublabel}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-2xl font-black tabular-nums ${isBest ? 'text-brand-orange-dark' : 'text-gray-900'}`}>
                    {primary}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">{unit}</span>
                </div>
              </div>
              <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${s.bar} ${
                    isBest ? 'shadow-[0_2px_12px_rgba(255,136,0,0.35)]' : ''
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <Flame className="w-3.5 h-3.5 text-brand-gradient-end flex-shrink-0" />
        <span>
          Faster payback means more cash to reinvest into acquisition — client-financed growth, not debt-financed.
        </span>
      </div>
    </div>
  )
}

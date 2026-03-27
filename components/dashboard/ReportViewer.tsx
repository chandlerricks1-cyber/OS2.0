'use client'

import { useState, useEffect } from 'react'
import type { CROReport, Bottleneck, Opportunity, ActionPlanItem, Projection, BenchmarkRow } from '@/types/report'

interface ReportViewerProps {
  userId: string
}

// ─── Health Score Banner ──────────────────────────────────────────────────────

const HEALTH_CONFIG = {
  Critical:   { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    bar: 'bg-red-500' },
  Concerning: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  Moderate:   { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  Healthy:    { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  bar: 'bg-green-500' },
  Excellent:  { bg: 'bg-emerald-50',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
}

function HealthBanner({ report }: { report: CROReport }) {
  const cfg = HEALTH_CONFIG[report.health_label] ?? HEALTH_CONFIG.Moderate
  return (
    <div className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${cfg.badge}`}>
              {report.health_label}
            </span>
            <span className="text-2xl font-bold text-gray-900">{report.health_score}<span className="text-sm font-normal text-gray-500">/100</span></span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{report.health_summary}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${cfg.bar}`}
            style={{ width: `${report.health_score}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Benchmarks ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  critical: { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200' },
  warning:  { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  good:     { dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200' },
}

function BenchmarksSection({ benchmarks }: { benchmarks: BenchmarkRow[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Benchmark Comparison</h2>
      <p className="text-xs text-gray-400 mb-4">Your numbers vs industry averages</p>
      <div className="space-y-3">
        {benchmarks.map((row, i) => {
          const s = STATUS_STYLES[row.status] ?? STATUS_STYLES.warning
          return (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 items-start py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <span className="text-sm font-medium text-gray-900">{row.metric}</span>
                </div>
                <p className="text-xs text-gray-400 ml-4 leading-relaxed">{row.context}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Yours</p>
                <p className="text-sm font-semibold text-gray-900">{row.their_value}</p>
              </div>
              <div className="text-right min-w-[90px]">
                <p className="text-xs text-gray-400 mb-0.5">Benchmark</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.badge}`}>
                  {row.industry_avg}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Bottlenecks ──────────────────────────────────────────────────────────────

const SEVERITY_STYLES = {
  critical: { bar: 'bg-red-500',    label: 'text-red-600',    bg: 'bg-red-50 border-red-100' },
  high:     { bar: 'bg-orange-500', label: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  medium:   { bar: 'bg-yellow-500', label: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-100' },
}

function BottlenecksSection({ bottlenecks }: { bottlenecks: Bottleneck[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Revenue Bottlenecks</h2>
      <p className="text-xs text-gray-400 mb-4">Root causes ranked by business impact</p>
      <div className="space-y-4">
        {bottlenecks.map((b) => {
          const s = SEVERITY_STYLES[b.severity] ?? SEVERITY_STYLES.medium
          return (
            <div key={b.rank} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className="flex items-start gap-3">
                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${s.bar}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{b.title}</span>
                    <span className={`text-xs font-medium capitalize ${s.label}`}>{b.severity}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">{b.diagnosis}</p>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Root Cause — </span>
                      <span className="text-xs text-gray-600">{b.root_cause}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue Impact — </span>
                      <span className="text-xs text-gray-600">{b.revenue_impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Opportunities ────────────────────────────────────────────────────────────

const EFFORT_STYLES = {
  'quick-win': { badge: 'bg-green-100 text-green-700',  label: 'Quick Win' },
  'medium':    { badge: 'bg-blue-100 text-blue-700',    label: 'Medium Lift' },
  'strategic': { badge: 'bg-purple-100 text-purple-700', label: 'Strategic' },
}

function OpportunitiesSection({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">High-Impact Opportunities</h2>
      <p className="text-xs text-gray-400 mb-4">Ranked by estimated revenue impact</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunities.map((op) => {
          const e = EFFORT_STYLES[op.effort] ?? EFFORT_STYLES.medium
          return (
            <div key={op.rank} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {op.rank}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${e.badge}`}>
                  {e.label}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{op.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{op.description}</p>
              </div>
              <div className="mt-auto">
                <div className="bg-gray-50 rounded-lg p-2.5 mb-2">
                  <p className="text-xs font-semibold text-gray-700">{op.estimated_impact}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">First step</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{op.specific_action}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Action Plan ──────────────────────────────────────────────────────────────

function ActionPlanSection({ plan }: { plan: ActionPlanItem[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">90-Day Action Plan</h2>
      <p className="text-xs text-gray-400 mb-5">Prioritized execution roadmap based on your numbers</p>
      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          {plan.map((item, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute left-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{item.period}</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">{item.priority}</p>
                <ul className="space-y-1.5">
                  {item.actions.map((action, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 mt-2" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Projections ──────────────────────────────────────────────────────────────

function ProjectionsSection({ projections }: { projections: Projection[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Projected Impact</h2>
      <p className="text-xs text-gray-400 mb-4">What executing these opportunities could look like</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projections.map((p, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col min-w-0">
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{p.scenario}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{p.metric}</p>
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-400 line-through break-words">{p.current}</span>
              <span className="text-gray-400 flex-shrink-0">→</span>
              <span className="text-sm font-bold text-gray-900 break-words">{p.projected}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">{p.timeframe}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Fallback: legacy markdown report ─────────────────────────────────────────

function LegacyReport({ content }: { content: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportViewer({ userId }: ReportViewerProps) {
  const [report, setReport] = useState<CROReport | null>(null)
  const [legacyContent, setLegacyContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadReport(refresh = false) {
    setLoading(true)
    setError(null)
    try {
      const url = refresh ? '/api/report?refresh=true' : '/api/report'
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to load report')
      }
      const data = await res.json()
      const raw = data.report?.content ?? null

      if (!raw) {
        throw new Error('No report content returned')
      }

      try {
        setReport(JSON.parse(raw) as CROReport)
        setLegacyContent(null)
      } catch {
        // Older report stored as markdown — render as-is
        setLegacyContent(raw)
        setReport(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-3">
        <div className="text-gray-400 text-sm animate-pulse">Generating your CRO analysis…</div>
        <p className="text-xs text-gray-300">This takes 20–30 seconds. Hang tight.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )
  }

  if (legacyContent) {
    return (
      <div className="space-y-4">
        <LegacyReport content={legacyContent} />
        <div className="text-center">
          <button
            onClick={() => loadReport(true)}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Regenerate with new analysis format
          </button>
        </div>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="space-y-6">
      <HealthBanner report={report} />
      <BenchmarksSection benchmarks={report.benchmarks} />
      <BottlenecksSection bottlenecks={report.bottlenecks} />
      <OpportunitiesSection opportunities={report.opportunities} />
      <ActionPlanSection plan={report.action_plan} />
      <ProjectionsSection projections={report.projections} />
      <div className="flex items-center justify-between pb-4">
        <p className="text-xs text-gray-300">
          Report generated by Crucible AI · Based on your intake session
        </p>
        <button
          onClick={() => loadReport(true)}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          Regenerate report
        </button>
      </div>
    </div>
  )
}

'use client'

interface MetricCardProps {
  label: string
  value: string
  description?: string
  highlight?: boolean
  editable?: boolean
}

export function MetricCard({ label, value, description, highlight, editable }: MetricCardProps) {
  const isEmpty = value === '—'
  const baseClass = `rounded-[25px] p-5 border transition-all ${
    highlight
      ? 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white border-transparent shadow-[0_8px_24px_rgba(255,136,0,0.18)]'
      : 'bg-white border-gray-200'
  } ${editable ? 'cursor-pointer hover:shadow-elevated hover:border-brand-gradient-end/40' : ''}`

  const content = (
    <>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${highlight ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {description ? (
        <p className={`text-xs mt-1 ${highlight ? 'text-white/75' : 'text-gray-400'}`}>
          {description}
        </p>
      ) : editable && isEmpty ? (
        <p className={`text-xs mt-1 ${highlight ? 'text-white/75' : 'text-gray-400'}`}>
          Click to fill in
        </p>
      ) : null}
    </>
  )

  if (!editable) {
    return <div className={baseClass}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('crucible:open-metrics-editor'))}
      className={`${baseClass} text-left w-full`}
    >
      {content}
    </button>
  )
}

interface MetricCardProps {
  label: string
  value: string
  description?: string
  highlight?: boolean
}

export function MetricCard({ label, value, description, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-[25px] p-5 border ${
        highlight
          ? 'bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end text-white border-transparent shadow-[0_8px_24px_rgba(255,136,0,0.18)]'
          : 'bg-white border-gray-200'
      }`}
    >
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${highlight ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {description && (
        <p className={`text-xs mt-1 ${highlight ? 'text-white/75' : 'text-gray-400'}`}>
          {description}
        </p>
      )}
    </div>
  )
}

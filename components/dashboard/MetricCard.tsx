interface MetricCardProps {
  label: string
  value: string
  description?: string
  highlight?: boolean
}

export function MetricCard({ label, value, description, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        highlight
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white border-gray-200'
      }`}
    >
      <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {description && (
        <p className={`text-xs mt-1 ${highlight ? 'text-gray-400' : 'text-gray-400'}`}>
          {description}
        </p>
      )}
    </div>
  )
}

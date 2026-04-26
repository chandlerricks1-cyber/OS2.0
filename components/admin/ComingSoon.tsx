import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function ComingSoon({
  title,
  description,
  phase,
}: {
  title: string
  description: string
  phase: string
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange mb-4">
          <Sparkles className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Coming in {phase}</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          This page is part of the GoHighLevel deep integration. Phase 1 (Contacts) is live; this view ships
          when {phase} is built.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <Link
            href="/dashboard/admin/contacts"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Go to Contacts →
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/dashboard/admin/integrations"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Integrations →
          </Link>
        </div>
      </div>
    </div>
  )
}

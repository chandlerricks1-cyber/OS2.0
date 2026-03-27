'use client'

import Link from 'next/link'

interface PaywallGateProps {
  children: React.ReactNode
  isActive: boolean
}

export function PaywallGate({ children, isActive }: PaywallGateProps) {
  if (isActive) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none filter blur-sm opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center max-w-sm mx-4">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-gray-900 mb-2">Unlock your full report</h3>
          <p className="text-sm text-gray-500 mb-6">
            Subscribe to see your complete CAC analysis, personalized report, and 90-day action plan.
          </p>
          <Link
            href="/upgrade"
            className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  )
}

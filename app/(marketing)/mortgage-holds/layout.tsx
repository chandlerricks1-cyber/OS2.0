import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crucible — Eliminate Mortgage Holds for Good',
  description:
    'Stop waiting weeks for mortgage companies to endorse insurance checks. Crucible sets up third-party indemnification so contractors can deposit multi-party checks the same day. One-time setup, no recurring fees.',
  themeColor: '#FF8800',
}

export default function MortgageHoldsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

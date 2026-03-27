import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crucible — Reduce Your CAC Payback Period',
  description: 'AI-powered analysis to help business owners reduce their customer acquisition cost payback period.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{children}</body>
    </html>
  )
}

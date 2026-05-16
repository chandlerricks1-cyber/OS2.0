import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import FacebookPixel from '@/components/shared/FacebookPixel'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Crucible — Reduce Your CAC Payback Period',
  description: 'AI-powered analysis to help business owners reduce their customer acquisition cost payback period.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crucible',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF8800',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <FacebookPixel />
        {children}
      </body>
    </html>
  )
}

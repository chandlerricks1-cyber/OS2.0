import type { Metadata, Viewport } from 'next'
import { PrelaunchLanding } from './PrelaunchLanding'

export const viewport: Viewport = {
  themeColor: '#FF8800',
}

export const metadata: Metadata = {
  title: 'POV Pro Prelaunch — Get Paid for the Skill of Capturing the Work',
  description:
    'A community for technicians and tradesmen who want to master capturing job-site content — and turn that skill into a higher income. Join the prelaunch for early access. First 20 founding members get a free pair of Meta glasses or a DJI Osmo Nano ($400 value).',
  alternates: { canonical: '/pov-pro-prelaunch' },
  openGraph: {
    title: 'POV Pro Prelaunch — The Skill Every Tradesman Will Wish They Learned First',
    description:
      'Learn to capture the work you already do and turn it into real income. Join the prelaunch for early access — first 20 founding members get free Meta glasses or a DJI Osmo Nano ($400 value).',
    type: 'website',
    siteName: 'Crucible',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POV Pro Prelaunch — Get Paid for the Skill of Capturing the Work',
    description:
      'A community for technicians and tradesmen. Join the prelaunch — first 20 founding members get free Meta glasses or a DJI Osmo Nano ($400 value).',
  },
}

export default function PovProPrelaunchPage() {
  return <PrelaunchLanding />
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crucible Podcast - Book your episode to solve your biggest bottleneck!',
  description:
    'Find out how to make more money per customer, lower the cost to acquire them, and unlock permission to scale your business.',
  openGraph: {
    title: 'Crucible Podcast - Book your episode to solve your biggest bottleneck!',
    description:
      'Find out how to make more money per customer, lower the cost to acquire them, and unlock permission to scale your business.',
    images: [
      {
        url: '/brand-icon.png',
        width: 512,
        height: 512,
        alt: 'Crucible Logo',
      },
    ],
    type: 'website',
    siteName: 'Crucible',
  },
  twitter: {
    card: 'summary',
    title: 'Crucible Podcast - Book your episode to solve your biggest bottleneck!',
    description:
      'Find out how to make more money per customer, lower the cost to acquire them, and unlock permission to scale your business.',
    images: ['/brand-icon.png'],
  },
}

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

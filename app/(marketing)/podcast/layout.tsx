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
        url: '/Podcast%20Hero%20Section.png',
        alt: 'The Crucible Podcast - Solve your biggest growth constraint',
      },
    ],
    type: 'website',
    siteName: 'Crucible',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crucible Podcast - Book your episode to solve your biggest bottleneck!',
    description:
      'Find out how to make more money per customer, lower the cost to acquire them, and unlock permission to scale your business.',
    images: ['/Podcast%20Hero%20Section.png'],
  },
}

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { getPublicOfferForSlug } from '@/lib/money-model/public'
import { PublicClassroomDetail } from '@/components/money-model/public/PublicClassroomDetail'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PublicClassroomOfferPage({
  params,
}: {
  params: Promise<{ slug: string; offerId: string }>
}) {
  const { slug, offerId } = await params

  const data = await getPublicOfferForSlug(slug, offerId)
  if (!data) notFound()

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="text-[10px] font-bold uppercase tracking-wide text-brand-gradient-end">
            Money Model — Training Library
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-0.5">{data.ownerLabel}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        <Link
          href={`/m/${slug}?tab=classroom`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-gradient-end transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to classroom
        </Link>

        <PublicClassroomDetail offer={data.offer} />
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-gray-400 text-center">
        Powered by Crucible Coaching
      </footer>
    </div>
  )
}

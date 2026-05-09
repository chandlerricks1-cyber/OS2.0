import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicMoneyModelBySlug } from '@/lib/money-model/public'
import { PublicMoneyModelTabs } from '@/components/money-model/public/PublicMoneyModelTabs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PublicMoneyModelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab } = await searchParams

  const data = await getPublicMoneyModelBySlug(slug)
  if (!data) notFound()

  const initialTab = tab === 'journey' || tab === 'classroom' ? tab : 'overview'

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

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <PublicMoneyModelTabs
          initialTab={initialTab}
          basePath={`/m/${slug}`}
          offers={data.offers}
          milestones={data.milestones}
          links={data.links}
        />
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-xs text-gray-400 text-center">
        Powered by Crucible Coaching
      </footer>
    </div>
  )
}

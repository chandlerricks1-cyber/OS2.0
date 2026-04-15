import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ClassroomDetail } from '@/components/money-model/ClassroomDetail'
import type { Offer } from '@/types/offer'

export default async function ClassroomOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>
}) {
  const { offerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: offer } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .eq('user_id', user.id)
    .single()

  if (!offer) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link
        href="/dashboard/money-model?tab=classroom"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Classroom
      </Link>

      <ClassroomDetail offer={offer as Offer} />
    </div>
  )
}

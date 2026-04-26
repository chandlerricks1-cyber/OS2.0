import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { FinishForm } from './FinishForm'

export const dynamic = 'force-dynamic'

export default async function PodcastFinishPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>
}) {
  const { lead: leadId } = await searchParams
  if (!leadId) notFound()

  const { data: lead } = await supabaseAdmin
    .from('podcast_leads')
    .select('id, full_name, email, phone')
    .eq('id', leadId)
    .single()

  if (!lead) notFound()

  return (
    <FinishForm
      leadId={lead.id}
      defaultFullName={lead.full_name}
      defaultEmail={lead.email}
      defaultPhone={lead.phone ?? ''}
    />
  )
}

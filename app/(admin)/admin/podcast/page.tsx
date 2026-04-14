import { createAdminClient } from '@/lib/supabase/server'
import { PodcastLeadsTable } from '@/components/admin/PodcastLeadsTable'

export default async function AdminPodcastPage() {
  const supabase = await createAdminClient()

  const { data: leads } = await supabase
    .from('podcast_leads')
    .select('*, podcast_intake(id), podcast_lead_tags(tag)')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Podcast Leads</h1>
        <p className="text-sm text-gray-500">{leads?.length ?? 0} total leads</p>
      </div>

      <PodcastLeadsTable leads={leads ?? []} />
    </div>
  )
}

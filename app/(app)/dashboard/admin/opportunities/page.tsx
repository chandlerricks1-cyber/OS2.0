import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComingSoon } from '@/components/admin/ComingSoon'

export const dynamic = 'force-dynamic'

export default async function AdminOpportunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <ComingSoon
      title="Opportunities"
      description="Drag-and-drop pipelines synced bidirectionally with GoHighLevel"
      phase="Phase 3"
    />
  )
}

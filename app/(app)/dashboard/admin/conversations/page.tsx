import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComingSoon } from '@/components/admin/ComingSoon'

export const dynamic = 'force-dynamic'

export default async function AdminConversationsPage() {
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
      title="Conversations"
      description="SMS, Email, FB Messenger, Instagram DM — synced from GoHighLevel"
      phase="Phase 2"
    />
  )
}

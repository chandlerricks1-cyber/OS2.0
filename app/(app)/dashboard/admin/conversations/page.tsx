import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationsApp } from '@/components/admin/conversations/ConversationsApp'

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
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]">
      <ConversationsApp />
    </div>
  )
}

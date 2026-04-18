import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GhlSetupPanel } from '@/components/admin/GhlSetupPanel'

export default async function IntegrationsPage() {
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500">Connect external services to your pipeline</p>
      </div>

      <GhlSetupPanel />
    </div>
  )
}

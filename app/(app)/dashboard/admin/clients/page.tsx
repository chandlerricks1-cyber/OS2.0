import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ClientTable } from '@/components/admin/ClientTable'

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const adminSupabase = await createAdminClient()

  const { data: clients } = await adminSupabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      crucible_pro_status,
      intake_sessions(status, completed_at),
      subscriptions(status, plan_type),
      business_metrics(cac, ltv, cac_payback_months),
      client_tags!client_tags_user_id_fkey(tag)
    `)
    .eq('role', 'client')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500">{clients?.length ?? 0} total clients</p>
      </div>

      <ClientTable clients={clients ?? []} />
    </div>
  )
}

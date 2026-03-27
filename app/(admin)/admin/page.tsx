import { createAdminClient } from '@/lib/supabase/server'
import { ClientTable } from '@/components/admin/ClientTable'

export default async function AdminPage() {
  const supabase = await createAdminClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      intake_sessions(status, completed_at),
      subscriptions(status, plan_type),
      business_metrics(cac, ltv, cac_payback_months),
      client_tags(tag)
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

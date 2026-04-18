import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PendingProList } from '@/components/admin/PendingProList'

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  intake_complete: 'bg-green-100 text-green-700',
  scheduled: 'bg-purple-100 text-purple-700',
  recorded: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-500',
}

export default async function AdminDashboardPage() {
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

  const [{ data: leads }, { data: pendingClients }, { data: proActiveClients }] = await Promise.all([
    adminSupabase
      .from('podcast_leads')
      .select('*, podcast_intake(id)')
      .order('created_at', { ascending: false })
      .limit(100),
    adminSupabase
      .from('profiles')
      .select('id, email, full_name, crucible_pro_status, created_at')
      .eq('role', 'client')
      .eq('crucible_pro_status', 'pending')
      .order('updated_at', { ascending: false }),
    adminSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'client')
      .eq('crucible_pro_status', 'active'),
  ])

  const allLeads = leads ?? []
  const stats = {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new').length,
    intake_complete: allLeads.filter((l) => l.status === 'intake_complete').length,
    scheduled: allLeads.filter((l) => l.status === 'scheduled').length,
    recorded: allLeads.filter((l) => l.status === 'recorded').length,
  }

  const pendingList = pendingClients ?? []
  const activeProCount = proActiveClients?.length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your pipeline and client management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <StatCard label="Total Leads" value={stats.total} color="text-gray-900" />
        <StatCard label="New" value={stats.new} color="text-blue-600" />
        <StatCard label="Intake Done" value={stats.intake_complete} color="text-green-600" />
        <StatCard label="Pro Clients" value={activeProCount} color="text-purple-600" />
        <StatCard label="Pending Pro" value={pendingList.length} color="text-amber-600" />
      </div>

      {/* Pending Pro Upgrades */}
      {pendingList.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Pending Pro Upgrades</h2>
            <Link href="/dashboard/admin/clients" className="text-sm text-brand-gradient-end hover:underline font-medium">
              All clients &rarr;
            </Link>
          </div>
          <PendingProList clients={pendingList} />
        </div>
      )}

      {/* Recent Leads */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent Podcast Leads</h2>
        <Link href="/dashboard/admin/podcast" className="text-sm text-brand-gradient-end hover:underline font-medium">
          View all &rarr;
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {allLeads.slice(0, 20).map((lead) => {
          const hasIntake = Array.isArray(lead.podcast_intake)
            ? lead.podcast_intake.length > 0
            : !!lead.podcast_intake
          return (
            <Link
              key={lead.id}
              href={`/dashboard/admin/podcast/${lead.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{lead.full_name}</p>
                  <p className="text-gray-500 text-xs truncate">{lead.email}</p>
                </div>
                <span className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || statusColors.new}`}>
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <span>{lead.phone}</span>
                <span>
                  {hasIntake ? <span className="text-green-600 font-medium">Intake complete</span> : 'Intake pending'}
                </span>
              </div>
            </Link>
          )
        })}
        {allLeads.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            No podcast leads yet. Share your <a href="/podcast" className="text-brand-gradient-end hover:underline">podcast page</a>.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Preferred Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Intake</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Submitted</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allLeads.slice(0, 20).map((lead) => {
                const hasIntake = Array.isArray(lead.podcast_intake)
                  ? lead.podcast_intake.length > 0
                  : !!lead.podcast_intake
                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(lead.preferred_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || statusColors.new}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasIntake ? (
                        <span className="text-green-600 font-medium text-xs">Complete</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/admin/podcast/${lead.id}`} className="text-brand-gradient-end hover:underline text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {allLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No podcast leads yet. Share your <a href="/podcast" className="text-brand-gradient-end hover:underline">podcast page</a> to start collecting leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { formatCurrency, formatMonths, formatPercent } from '@/lib/utils/metrics'
import Link from 'next/link'

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createAdminClient()

  const [
    { data: profile },
    { data: metrics },
    { data: subscription },
    { data: tags },
    { data: session },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('business_metrics').select('*').eq('user_id', params.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', params.id).single(),
    supabase.from('client_tags').select('tag').eq('user_id', params.id),
    supabase.from('intake_sessions').select('id, status, started_at, completed_at').eq('user_id', params.id).single(),
  ])

  if (!profile) notFound()

  const messages = session
    ? (await supabase
        .from('intake_messages')
        .select('role, content, created_at')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })).data
    : []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
          ← All Clients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          {profile.full_name ?? profile.email}
        </h1>
        <p className="text-sm text-gray-500">{profile.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Subscription</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            subscription?.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {subscription?.status ?? 'inactive'}
          </span>
          <p className="text-sm text-gray-500 mt-2">{subscription?.plan_type ?? 'No plan'}</p>
        </div>

        {/* Intake */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Intake</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            session?.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {session?.status ?? 'not started'}
          </span>
          {session?.completed_at && (
            <p className="text-sm text-gray-500 mt-2">
              Completed {new Date(session.completed_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Tags</p>
          <div className="flex flex-wrap gap-1">
            {tags && tags.length > 0
              ? tags.map((t) => (
                  <span key={t.tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {t.tag}
                  </span>
                ))
              : <span className="text-sm text-gray-400">No tags</span>
            }
          </div>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Business Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CAC', value: formatCurrency(metrics.cac) },
              { label: 'LTV', value: formatCurrency(metrics.ltv) },
              { label: 'CAC Payback', value: formatMonths(metrics.cac_payback_months) },
              { label: 'LTV:CAC', value: metrics.ltv_cac_ratio ? `${Number(metrics.ltv_cac_ratio).toFixed(2)}x` : '—' },
              { label: 'Monthly Revenue', value: formatCurrency(metrics.monthly_revenue) },
              { label: 'New Customers/Mo', value: metrics.monthly_new_customers?.toString() ?? '—' },
              { label: 'Close Rate', value: formatPercent(metrics.close_rate) },
              { label: 'Gross Profit/Customer', value: formatCurrency(metrics.gross_profit_per_customer) },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs text-gray-400">{m.label}</p>
                <p className="font-semibold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intake Transcript */}
      {messages && messages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Intake Transcript</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-50 border border-gray-200 text-gray-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

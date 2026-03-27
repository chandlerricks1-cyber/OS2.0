import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReportViewer } from '@/components/dashboard/ReportViewer'
import Link from 'next/link'

export default async function ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  if (profile?.role !== 'admin' && (!subscription || subscription.status !== 'active')) {
    redirect('/upgrade')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 mb-1 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your CAC Analysis Report</h1>
          <p className="text-sm text-gray-500">AI-generated based on your intake responses</p>
        </div>
      </div>

      <ReportViewer userId={user.id} />
    </div>
  )
}

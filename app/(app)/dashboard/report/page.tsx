import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReportViewer } from '@/components/dashboard/ReportViewer'
import Link from 'next/link'

export default async function ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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

      <div className="bg-gray-900 rounded-2xl p-6 text-center">
        <p className="font-medium text-white mb-1">Want help executing this plan?</p>
        <p className="text-gray-400 text-sm mb-5">Book a call to review your report and build your implementation roadmap together.</p>
        <a
          href="https://calendly.com/YOUR_LINK_HERE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-gray-900 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Book a Strategy Call
        </a>
      </div>
    </div>
  )
}

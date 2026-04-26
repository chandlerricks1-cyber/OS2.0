import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ContactDetail } from '@/components/admin/contacts/ContactDetail'

export const dynamic = 'force-dynamic'

export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
  const [contactRes, apptsRes, oppsRes, convosRes] = await Promise.all([
    adminSupabase.from('ghl_contacts').select('*').eq('ghl_id', id).maybeSingle(),
    adminSupabase
      .from('ghl_appointments')
      .select('ghl_id, title, start_time, end_time, appointment_status, calendar_id')
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('start_time', { ascending: false })
      .limit(25),
    adminSupabase
      .from('ghl_opportunities')
      .select('ghl_id, name, status, monetary_value, pipeline_id, stage_id, date_updated')
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('date_updated', { ascending: false })
      .limit(25),
    adminSupabase
      .from('ghl_conversations')
      .select('ghl_id, last_message_type, last_message_body, last_message_at, unread_count')
      .eq('contact_id', id)
      .order('last_message_at', { ascending: false })
      .limit(25),
  ])

  if (!contactRes.data) notFound()

  return (
    <div>
      <Link
        href="/dashboard/admin/contacts"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back to contacts
      </Link>
      <ContactDetail
        contact={contactRes.data}
        appointments={apptsRes.data ?? []}
        opportunities={oppsRes.data ?? []}
        conversations={convosRes.data ?? []}
      />
    </div>
  )
}

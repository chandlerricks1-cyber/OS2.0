import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContactsApp } from '@/components/admin/contacts/ContactsApp'

export const dynamic = 'force-dynamic'

export default async function AdminContactsPage() {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-sm text-gray-500">Synced from GoHighLevel</p>
      </div>
      <ContactsApp />
    </div>
  )
}

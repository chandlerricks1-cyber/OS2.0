import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="font-bold text-lg">Crucible Admin</span>
          <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">Clients</a>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

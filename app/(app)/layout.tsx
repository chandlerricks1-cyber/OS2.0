import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/shared/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { data: session }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('intake_sessions').select('status').eq('user_id', user.id).maybeSingle(),
  ])

  const intakeIncomplete = !session || session.status !== 'completed'

  return <AppShell user={profile} intakeIncomplete={intakeIncomplete}>{children}</AppShell>
}

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { AdminTodosBoard, type AdminTodo, type AdminTodoClient } from '@/components/admin/AdminTodosBoard'

export const dynamic = 'force-dynamic'

export default async function AdminTodosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const admin = await createAdminClient()

  const [{ data: tasks }, { data: clients }] = await Promise.all([
    admin
      .from('crucible_tasks')
      .select('*, owner:profiles!crucible_tasks_user_id_fkey(id, full_name, email, role)')
      .order('created_at', { ascending: false }),
    admin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client')
      .order('full_name', { ascending: true }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My To-Dos</h1>
        <p className="text-sm text-gray-500">All tasks across your clients, plus your personal to-dos.</p>
      </div>
      <AdminTodosBoard
        initialTasks={(tasks ?? []) as unknown as AdminTodo[]}
        clients={(clients ?? []) as AdminTodoClient[]}
        adminId={user.id}
      />
    </div>
  )
}

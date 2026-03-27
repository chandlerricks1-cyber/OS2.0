'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClientTag(userId: string, tag: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const adminSupabase = await createAdminClient()
  await adminSupabase.from('client_tags').insert({
    user_id: userId,
    tag: tag.trim(),
    created_by: user.id,
  })

  revalidatePath(`/admin/clients/${userId}`)
}

export async function removeClientTag(userId: string, tag: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const adminSupabase = await createAdminClient()
  await adminSupabase
    .from('client_tags')
    .delete()
    .eq('user_id', userId)
    .eq('tag', tag)

  revalidatePath(`/admin/clients/${userId}`)
}

export async function updateProfile(fullName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  revalidatePath('/dashboard')
}

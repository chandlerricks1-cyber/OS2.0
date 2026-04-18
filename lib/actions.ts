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

  revalidatePath(`/dashboard/admin/clients/${userId}`)
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

  revalidatePath(`/dashboard/admin/clients/${userId}`)
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

export async function requestCrucibleProUpgrade() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('profiles')
    .update({ crucible_pro_status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', user.id)

  revalidatePath('/dashboard/crucible-pro')
}

export async function grantCrucibleProAccess(userId: string) {
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
    .from('profiles')
    .update({
      crucible_pro_status: 'active',
      crucible_pro_granted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/admin/clients')
  revalidatePath('/dashboard/admin')
}

export async function revokeCrucibleProAccess(userId: string) {
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
    .from('profiles')
    .update({
      crucible_pro_status: null,
      crucible_pro_granted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/admin/clients')
  revalidatePath('/dashboard/admin')
}

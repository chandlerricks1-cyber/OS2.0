'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

export async function convertLeadToClient(leadId: string) {
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

  // Fetch the podcast lead
  const { data: lead, error: leadError } = await adminSupabase
    .from('podcast_leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) return { error: 'Podcast lead not found' }

  // Check if a profile already exists with this email
  const { data: existingProfile } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  if (existingProfile) {
    redirect(`/dashboard/admin/clients/${existingProfile.id}`)
  }

  // Create auth user (sends invite email) — the handle_new_user trigger
  // auto-creates the profiles and subscriptions rows
  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email: lead.email,
    email_confirm: true,
    user_metadata: { full_name: lead.full_name },
  })

  if (createError || !newUser.user) {
    return { error: createError?.message ?? 'Failed to create user' }
  }

  // Send a password reset so the new client can set their password
  await adminSupabase.auth.admin.generateLink({
    type: 'magiclink',
    email: lead.email,
  })

  revalidatePath('/dashboard/admin/clients')
  revalidatePath('/dashboard/admin/podcast')
  redirect(`/dashboard/admin/clients/${newUser.user.id}`)
}

export async function deleteClient(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Prevent deleting yourself
  if (userId === user.id) throw new Error('Cannot delete your own account')

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Delete intake messages (need session id first)
  const { data: session } = await supabaseAdmin
    .from('intake_sessions')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (session) {
    await supabaseAdmin.from('intake_messages').delete().eq('session_id', session.id)
  }

  // Delete all related rows
  await Promise.all([
    supabaseAdmin.from('intake_sessions').delete().eq('user_id', userId),
    supabaseAdmin.from('business_metrics').delete().eq('user_id', userId),
    supabaseAdmin.from('client_tags').delete().eq('user_id', userId),
    supabaseAdmin.from('reports').delete().eq('user_id', userId),
    supabaseAdmin.from('subscriptions').delete().eq('user_id', userId),
    supabaseAdmin.from('user_preferences').delete().eq('user_id', userId),
    supabaseAdmin.from('offers').delete().eq('user_id', userId),
    supabaseAdmin.from('milestones').delete().eq('user_id', userId),
    supabaseAdmin.from('crucible_tasks').delete().eq('user_id', userId),
    supabaseAdmin.from('crucible_rocks').delete().eq('user_id', userId),
    supabaseAdmin.from('crucible_team_members').delete().eq('user_id', userId),
    supabaseAdmin.from('crucible_appointments').delete().eq('user_id', userId),
    supabaseAdmin.from('crucible_call_recordings').delete().eq('user_id', userId),
  ])

  // Delete profile then auth user
  await supabaseAdmin.from('profiles').delete().eq('id', userId)
  await supabaseAdmin.auth.admin.deleteUser(userId)

  revalidatePath('/dashboard/admin/clients')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard/admin/clients')
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

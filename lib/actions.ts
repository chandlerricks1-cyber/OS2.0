'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  ensureStripeCustomer,
  ensureMonthlyPrice,
  createSubscriptionCheckoutSession,
  updateActiveSubscriptionPrice,
  sendOneOffInvoice,
} from '@/lib/stripe/retainer'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return user
}

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

  await supabaseAdmin.from('client_tags').insert({
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

  await supabaseAdmin
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

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      crucible_pro_status: 'active',
      crucible_pro_granted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw new Error(`Failed to grant access: ${error.message}`)

  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/admin/clients')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/crucible-pro')
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

  // Fetch the podcast lead
  const { data: lead, error: leadError } = await supabaseAdmin
    .from('podcast_leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) return { error: 'Podcast lead not found' }

  // Check if a profile already exists with this email
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', lead.email)
    .single()

  if (existingProfile) {
    redirect(`/dashboard/admin/clients/${existingProfile.id}`)
  }

  // Create auth user (sends invite email) — the handle_new_user trigger
  // auto-creates the profiles and subscriptions rows
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: lead.email,
    email_confirm: true,
    user_metadata: { full_name: lead.full_name },
  })

  if (createError || !newUser.user) {
    return { error: createError?.message ?? 'Failed to create user' }
  }

  // Send a password reset so the new client can set their password
  await supabaseAdmin.auth.admin.generateLink({
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

export async function updateRevenueGoal(targetUserId: string, goal: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Allow the user to edit their own goal, or admin to edit any
  const isAdmin = profile?.role === 'admin'
  if (user.id !== targetUserId && !isAdmin) throw new Error('Forbidden')

  const client = isAdmin ? supabaseAdmin : supabase
  const { error } = await client
    .from('business_metrics')
    .update({ revenue_goal_1yr: goal, updated_at: new Date().toISOString() })
    .eq('user_id', targetUserId)

  if (error) throw new Error(`Failed to update revenue goal: ${error.message}`)

  revalidatePath('/dashboard/crucible-pro')
}

export async function setMonthlyRetainerFee(userId: string, amountUsd: number | null) {
  await requireAdmin()

  const normalized =
    amountUsd === null || amountUsd === undefined || Number.isNaN(amountUsd)
      ? null
      : Number(amountUsd)
  if (normalized !== null && (!Number.isFinite(normalized) || normalized < 0)) {
    throw new Error('Retainer must be a non-negative number')
  }

  const { data: existing, error: loadError } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id, stripe_subscription_id, status')
    .eq('user_id', userId)
    .maybeSingle()
  if (loadError) throw new Error(`Failed to load subscription: ${loadError.message}`)

  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      monthly_consulting_fee: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (updateError) throw new Error(`Failed to update retainer: ${updateError.message}`)

  // If a Stripe customer already exists and the new amount is non-null, sync
  // a Stripe Price under the client's Product. Push the new price to the
  // active subscription if there is one (effective next billing cycle).
  if (normalized !== null && normalized > 0 && existing?.stripe_customer_id) {
    const { priceId } = await ensureMonthlyPrice(userId, normalized)
    if (existing.stripe_subscription_id && existing.status === 'active') {
      await updateActiveSubscriptionPrice(userId, priceId)
    }
  }

  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/crucible-pro')
}

export async function startRetainerSubscription(userId: string): Promise<{ url: string }> {
  await requireAdmin()
  const { url } = await createSubscriptionCheckoutSession(userId)
  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/crucible-pro')
  return { url }
}

export async function sendRetainerOneOffInvoice(
  userId: string,
  amountUsd: number,
  description: string
): Promise<{ hostedUrl: string | null; invoiceId: string }> {
  await requireAdmin()

  await ensureStripeCustomer(userId)
  const invoice = await sendOneOffInvoice(userId, amountUsd, description)

  const amountCents =
    typeof invoice.amount_due === 'number' && invoice.amount_due > 0
      ? invoice.amount_due
      : Math.round(amountUsd * 100)

  // Insert immediately so the in-app history reflects the action even before
  // the webhook fires. Webhook handlers upsert on stripe_invoice_id.
  const { error: insertError } = await supabaseAdmin
    .from('crucible_pro_invoices')
    .upsert(
      {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: typeof invoice.customer === 'string' ? invoice.customer : null,
        stripe_subscription_id: null,
        invoice_type: 'one_off',
        amount_cents: amountCents,
        currency: invoice.currency ?? 'usd',
        status: invoice.status ?? 'open',
        description: description.trim(),
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        invoice_pdf_url: invoice.invoice_pdf ?? null,
        number: invoice.number ?? null,
        finalized_at: invoice.status_transitions?.finalized_at
          ? new Date(invoice.status_transitions.finalized_at * 1000).toISOString()
          : null,
        sent_at: new Date().toISOString(),
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        metadata: { source: 'sendRetainerOneOffInvoice' },
      },
      { onConflict: 'stripe_invoice_id' }
    )
  if (insertError) {
    throw new Error(`Invoice sent on Stripe but failed to record locally: ${insertError.message}`)
  }

  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/crucible-pro')

  return { hostedUrl: invoice.hosted_invoice_url ?? null, invoiceId: invoice.id }
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

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      crucible_pro_status: null,
      crucible_pro_granted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw new Error(`Failed to revoke access: ${error.message}`)

  revalidatePath(`/dashboard/admin/clients/${userId}`)
  revalidatePath('/dashboard/admin/clients')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/crucible-pro')
}

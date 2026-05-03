import type Stripe from 'stripe'
import { stripe } from './client'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SubscriptionRow = {
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  stripe_product_id: string | null
  monthly_consulting_fee: number | null
  status: string
}

type ProfileForBilling = {
  id: string
  email: string
  full_name: string | null
}

async function loadSubscription(userId: string): Promise<SubscriptionRow> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select(
      'user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_product_id, monthly_consulting_fee, status'
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to load subscription: ${error.message}`)
  if (!data) {
    // The handle_new_user trigger normally creates this row at signup. Insert
    // a placeholder so retainer flows work for older accounts without one.
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: userId })
      .select(
        'user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_product_id, monthly_consulting_fee, status'
      )
      .single()
    if (insertError) throw new Error(`Failed to create subscription row: ${insertError.message}`)
    return inserted as SubscriptionRow
  }
  return data as SubscriptionRow
}

async function loadProfile(userId: string): Promise<ProfileForBilling> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .single()
  if (error || !data) throw new Error(`Profile not found for user ${userId}`)
  return data as ProfileForBilling
}

export async function ensureStripeCustomer(userId: string): Promise<string> {
  const sub = await loadSubscription(userId)
  if (sub.stripe_customer_id) return sub.stripe_customer_id

  const profile = await loadProfile(userId)
  const customer = await stripe.customers.create({
    email: profile.email,
    name: profile.full_name ?? undefined,
    metadata: { user_id: userId },
  })

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) throw new Error(`Failed to persist Stripe customer id: ${error.message}`)

  return customer.id
}

export async function ensureStripeProductForClient(userId: string): Promise<string> {
  const sub = await loadSubscription(userId)
  if (sub.stripe_product_id) return sub.stripe_product_id

  const profile = await loadProfile(userId)
  const displayName = profile.full_name?.trim() || profile.email
  const product = await stripe.products.create({
    name: `Crucible Pro – ${displayName}`,
    metadata: { user_id: userId },
  })

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ stripe_product_id: product.id, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) throw new Error(`Failed to persist Stripe product id: ${error.message}`)

  return product.id
}

function toCents(amountUsd: number): number {
  return Math.round(amountUsd * 100)
}

export async function ensureMonthlyPrice(
  userId: string,
  monthlyAmountUsd: number
): Promise<{ priceId: string; productId: string; amountCents: number }> {
  if (!Number.isFinite(monthlyAmountUsd) || monthlyAmountUsd <= 0) {
    throw new Error('Monthly retainer must be a positive number')
  }
  const amountCents = toCents(monthlyAmountUsd)
  const productId = await ensureStripeProductForClient(userId)
  const sub = await loadSubscription(userId)

  if (sub.stripe_price_id) {
    try {
      const existing = await stripe.prices.retrieve(sub.stripe_price_id)
      const matches =
        existing.unit_amount === amountCents &&
        existing.recurring?.interval === 'month' &&
        existing.product === productId &&
        existing.active
      if (matches) return { priceId: existing.id, productId, amountCents }
    } catch {
      // fall through and create a new price
    }
  }

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amountCents,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { user_id: userId },
  })

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ stripe_price_id: price.id, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) throw new Error(`Failed to persist Stripe price id: ${error.message}`)

  return { priceId: price.id, productId, amountCents }
}

export async function createSubscriptionCheckoutSession(
  userId: string,
  opts?: { successUrl?: string; cancelUrl?: string }
): Promise<{ url: string; sessionId: string }> {
  const sub = await loadSubscription(userId)
  if (!sub.monthly_consulting_fee || sub.monthly_consulting_fee <= 0) {
    throw new Error('Set a monthly retainer before starting a subscription')
  }
  const customerId = await ensureStripeCustomer(userId)
  const { priceId } = await ensureMonthlyPrice(userId, sub.monthly_consulting_fee)

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: opts?.successUrl ?? `${baseUrl}/dashboard/crucible-pro?tab=billing&checkout=success`,
    cancel_url: opts?.cancelUrl ?? `${baseUrl}/dashboard/crucible-pro?tab=billing&checkout=cancel`,
    metadata: { user_id: userId, price_id: priceId, type: 'crucible_pro_retainer' },
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return { url: session.url, sessionId: session.id }
}

export async function updateActiveSubscriptionPrice(
  userId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const sub = await loadSubscription(userId)
  if (!sub.stripe_subscription_id) {
    throw new Error('No active Stripe subscription on file')
  }
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
  const itemId = stripeSub.items.data[0]?.id
  if (!itemId) throw new Error('Stripe subscription has no line items')

  const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: itemId, price: newPriceId }],
    proration_behavior: 'none',
    metadata: { ...stripeSub.metadata, price_id: newPriceId },
  })
  return updated
}

export async function sendOneOffInvoice(
  userId: string,
  amountUsd: number,
  description: string
): Promise<Stripe.Invoice> {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new Error('Invoice amount must be a positive number')
  }
  const trimmedDescription = description.trim()
  if (!trimmedDescription) throw new Error('Invoice description is required')

  const customerId = await ensureStripeCustomer(userId)
  const amountCents = toCents(amountUsd)

  // Create the invoice first as a draft, then attach a line item to it,
  // then finalize + send. Creating the invoice item with `invoice` set
  // ensures it lands on this exact invoice (vs. the customer's pending pool).
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: 7,
    auto_advance: false,
    description: trimmedDescription,
    metadata: { user_id: userId, type: 'one_off' },
  })

  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoice.id,
    amount: amountCents,
    currency: 'usd',
    description: trimmedDescription,
    metadata: { user_id: userId, type: 'one_off' },
  })

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
  const sent = await stripe.invoices.sendInvoice(finalized.id)
  return sent
}

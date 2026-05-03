import type Stripe from 'stripe'
import { stripe } from './client'
import { supabaseAdmin } from '@/lib/supabase/admin'

type InvoiceUpsert = {
  user_id: string
  stripe_invoice_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  invoice_type: 'subscription_cycle' | 'one_off'
  amount_cents: number
  currency: string
  status: string
  description: string | null
  hosted_invoice_url: string | null
  invoice_pdf_url: string | null
  number: string | null
  finalized_at: string | null
  sent_at: string | null
  paid_at: string | null
  voided_at: string | null
  due_date: string | null
}

function tsToIso(seconds: number | null | undefined): string | null {
  return typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : null
}

async function resolveUserIdForInvoice(invoice: Stripe.Invoice): Promise<string | null> {
  // Prefer explicit metadata if set by our own flows
  const metaUserId = invoice.metadata?.user_id ?? null
  if (metaUserId) return metaUserId

  const customerId = typeof invoice.customer === 'string' ? invoice.customer : null
  if (!customerId) return null

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  return data?.user_id ?? null
}

function inferInvoiceType(invoice: Stripe.Invoice): 'subscription_cycle' | 'one_off' {
  if (invoice.subscription) return 'subscription_cycle'
  if (invoice.metadata?.type === 'one_off') return 'one_off'
  return 'one_off'
}

async function upsertInvoiceRow(
  invoice: Stripe.Invoice,
  patch: Partial<InvoiceUpsert> = {}
): Promise<void> {
  const userId = await resolveUserIdForInvoice(invoice)
  if (!userId) return

  const row: InvoiceUpsert = {
    user_id: userId,
    stripe_invoice_id: invoice.id,
    stripe_subscription_id:
      typeof invoice.subscription === 'string' ? invoice.subscription : null,
    stripe_customer_id: typeof invoice.customer === 'string' ? invoice.customer : null,
    invoice_type: inferInvoiceType(invoice),
    amount_cents: invoice.amount_due ?? invoice.amount_paid ?? 0,
    currency: invoice.currency ?? 'usd',
    status: invoice.status ?? 'open',
    description: invoice.description ?? invoice.lines?.data?.[0]?.description ?? null,
    hosted_invoice_url: invoice.hosted_invoice_url ?? null,
    invoice_pdf_url: invoice.invoice_pdf ?? null,
    number: invoice.number ?? null,
    finalized_at: tsToIso(invoice.status_transitions?.finalized_at),
    sent_at: null,
    paid_at: tsToIso(invoice.status_transitions?.paid_at),
    voided_at: tsToIso(invoice.status_transitions?.voided_at),
    due_date: tsToIso(invoice.due_date),
    ...patch,
  }

  const { error } = await supabaseAdmin
    .from('crucible_pro_invoices')
    .upsert(row, { onConflict: 'stripe_invoice_id' })
  if (error) throw new Error(`Failed to upsert invoice: ${error.message}`)
}

async function maybeAdvanceSubscriptionPeriod(invoice: Stripe.Invoice) {
  if (!invoice.subscription || invoice.billing_reason !== 'subscription_cycle') return
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : null
  if (!subId) return

  const periodEndSec = invoice.lines?.data?.[0]?.period?.end ?? null
  const nextBilling = tsToIso(periodEndSec)
  if (!nextBilling) return

  await supabaseAdmin
    .from('subscriptions')
    .update({
      next_billing_date: nextBilling.slice(0, 10),
      current_period_end: nextBilling,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subId)
}

export async function handleStripeWebhook(body: string, signature: string) {
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`)
  }

  const supabase = supabaseAdmin

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (!userId) break

      const isSubscription = session.mode === 'subscription'
      const planType = isSubscription ? 'monthly' : 'one_time'

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: isSubscription
          ? (session.subscription as string)
          : null,
        stripe_price_id: session.metadata?.price_id ?? null,
        status: 'active',
        plan_type: planType,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (sub) {
        await supabase.from('subscriptions').update({
          status: subscription.status as 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing',
          stripe_price_id: subscription.items.data[0]?.price.id ?? null,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.created':
    case 'invoice.finalized': {
      const invoice = event.data.object as Stripe.Invoice
      await upsertInvoiceRow(invoice)
      break
    }

    case 'invoice.sent': {
      const invoice = event.data.object as Stripe.Invoice
      await upsertInvoiceRow(invoice, { sent_at: new Date().toISOString() })
      break
    }

    case 'invoice.paid':
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await upsertInvoiceRow(invoice, {
        status: 'paid',
        paid_at:
          tsToIso(invoice.status_transitions?.paid_at) ?? new Date().toISOString(),
      })
      await maybeAdvanceSubscriptionPeriod(invoice)
      break
    }

    case 'invoice.voided': {
      const invoice = event.data.object as Stripe.Invoice
      await upsertInvoiceRow(invoice, {
        status: 'void',
        voided_at:
          tsToIso(invoice.status_transitions?.voided_at) ?? new Date().toISOString(),
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await upsertInvoiceRow(invoice, { status: invoice.status ?? 'open' })
      if (invoice.subscription) {
        await supabase.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', invoice.subscription as string)
      }
      break
    }
  }

  return { received: true }
}

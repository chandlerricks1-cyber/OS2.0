import { stripe } from './client'
import { createAdminClient } from '@/lib/supabase/server'

export async function handleStripeWebhook(body: string, signature: string) {
  let event: import('stripe').Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`)
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session
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
      const subscription = event.data.object as import('stripe').Stripe.Subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (sub) {
        await supabase.from('subscriptions').update({
          status: subscription.status as 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as import('stripe').Stripe.Subscription
      await supabase.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as import('stripe').Stripe.Invoice
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

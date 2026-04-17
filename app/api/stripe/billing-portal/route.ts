import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const customerId = (subscription as { stripe_customer_id?: string | null } | null)?.stripe_customer_id
  if (!customerId) {
    return NextResponse.json(
      { error: 'No Stripe customer on file yet. Start a subscription from the Upgrade page first.' },
      { status: 400 }
    )
  }

  // Support dynamic return path (e.g. from settings billing tab)
  let returnPath = '/dashboard/crucible-pro?tab=billing'
  try {
    const body = await request.json().catch(() => null)
    if (body?.return_path && typeof body.return_path === 'string') {
      returnPath = body.return_path
    }
  } catch {
    // No body or invalid JSON — use default return path
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}${returnPath}`,
  })

  return NextResponse.json({ url: session.url })
}

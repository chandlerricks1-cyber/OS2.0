import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface EnsureSignedInOpts {
  email: string
  fullName?: string
  phone?: string
}

export interface EnsureSignedInResult {
  userId?: string
  error?: string
  alreadyHadPassword?: boolean
}

// Idempotently creates the auth user (no email verification required) and
// establishes a cookie session in the current request via a magiclink OTP
// verification. Used by /api/podcast/lead and /api/podcast/finish so a
// podcast guest is silently signed in without a confirmation step.
//
// `alreadyHadPassword` is set when an auth user with this email already
// exists AND has a non-magiclink sign-in history — caller should refuse
// password overwrites in that case.
export async function ensureSignedIn(opts: EnsureSignedInOpts): Promise<EnsureSignedInResult> {
  try {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: opts.email,
      email_confirm: true,
      user_metadata: {
        ...(opts.fullName ? { full_name: opts.fullName } : {}),
        ...(opts.phone ? { phone: opts.phone } : {}),
      },
    })

    let userId = created?.user?.id
    if (createErr && !userId) {
      const msg = createErr.message?.toLowerCase() ?? ''
      const alreadyExists = msg.includes('already') || msg.includes('registered') || msg.includes('exists')
      if (!alreadyExists) return { error: createErr.message }
    }

    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: opts.email,
    })
    if (linkErr || !linkData?.properties?.hashed_token) {
      return { error: linkErr?.message ?? 'Failed to generate sign-in link' }
    }
    if (!userId) userId = linkData.user?.id

    const cookieClient = await createClient()
    const { error: verifyErr } = await cookieClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    })
    if (verifyErr) return { error: verifyErr.message }

    const alreadyHadPassword = userId ? await detectExistingPassword(userId) : false

    return { userId, alreadyHadPassword }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Auth failed' }
  }
}

// Returns true if the auth user has at least one identity provider that
// implies a password was set previously (e.g. an `email` identity with
// `last_sign_in_at` distinct from the just-issued magiclink).
async function detectExistingPassword(userId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
    const user = data?.user
    if (!user) return false
    const identities = user.identities ?? []
    return identities.some((identity) => {
      if (identity.provider !== 'email') return false
      const lastSignIn = identity.last_sign_in_at ? new Date(identity.last_sign_in_at).getTime() : 0
      const created = identity.created_at ? new Date(identity.created_at).getTime() : 0
      // If the identity has been signed in at a moment distinct from creation
      // (more than 60s apart), it implies a real prior signin (password reset
      // or password login), not just the magiclink we issued in this request.
      return lastSignIn > 0 && Math.abs(lastSignIn - created) > 60_000
    })
  } catch {
    return false
  }
}

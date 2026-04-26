import crypto from 'node:crypto'

export interface VerifyResult {
  ok: boolean
  reason?: string
}

// GHL's native Workflow Webhook action can't compute an HMAC, only set static
// header values. So we use a shared-token check: the workflow sends the secret
// as the `x-wh-signature` header, and we constant-time compare it to env.
export function verifyGhlSignature(_rawBody: string, signature: string | null | undefined): VerifyResult {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret) {
    return { ok: false, reason: 'GHL_WEBHOOK_SECRET not configured' }
  }
  if (!signature) {
    return { ok: false, reason: 'missing x-wh-signature header' }
  }
  const provided = signature.trim()
  const a = Buffer.from(secret)
  const b = Buffer.from(provided)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'token mismatch' }
  }
  return { ok: true }
}

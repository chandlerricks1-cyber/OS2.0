import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const upstashConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

if (!upstashConfigured) {
  console.warn(
    '[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting disabled.'
  )
}

const redis = upstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// 10 requests per 60 seconds per user for AI routes
export const aiRatelimit: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'crucible:ai',
    })
  : null

// 30 requests per 60 seconds per user for general API routes
export const apiRatelimit: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      analytics: true,
      prefix: 'crucible:api',
    })
  : null

export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null = aiRatelimit
) {
  if (!limiter) return null

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  return null // no rate limit hit
}

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 10 requests per 60 seconds per user for AI routes
export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'crucible:ai',
})

// 30 requests per 60 seconds per user for general API routes
export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  analytics: true,
  prefix: 'crucible:api',
})

export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = aiRatelimit
) {
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

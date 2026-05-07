import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

/** Max distinct IPs tracked in memory (only when Upstash is not configured). */
const MEMORY_MAX_KEYS = 50_000

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

function getMaxAndWindowSec(): { max: number; windowSec: number } {
  const max = clamp(parseInt(process.env.CHAT_RATE_LIMIT_MAX || '30', 10) || 30, 1, 500)
  const windowSec = clamp(
    parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_SEC || '60', 10) || 60,
    10,
    3600
  )
  return { max, windowSec }
}

/**
 * Stable client id for rate limiting (IP-based). Works behind common proxies / CDNs.
 */
export function getChatRateLimitId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return `ip:${first}`
  }
  const cf = request.headers.get('cf-connecting-ip')?.trim()
  if (cf) return `ip:${cf}`
  const real = request.headers.get('x-real-ip')?.trim()
  if (real) return `ip:${real}`
  return 'ip:unknown'
}

/** In-process sliding window — fine for dev or a single Node instance; use Upstash in production. */
const memoryBuckets = new Map<string, number[]>()

function memorySlidingWindow(identifier: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const { max, windowSec } = getMaxAndWindowSec()
  const windowMs = windowSec * 1000
  const now = Date.now()

  if (memoryBuckets.size > MEMORY_MAX_KEYS && !memoryBuckets.has(identifier)) {
    memoryBuckets.clear()
  }

  let stamps = memoryBuckets.get(identifier) || []
  stamps = stamps.filter((t) => now - t < windowMs)

  if (stamps.length >= max) {
    const oldest = stamps[0]!
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    memoryBuckets.set(identifier, stamps)
    return { ok: false, retryAfterSec }
  }

  stamps.push(now)
  memoryBuckets.set(identifier, stamps)
  return { ok: true }
}

let upstashRatelimit: Ratelimit | null = null
let upstashConfigured = false

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashConfigured) return upstashRatelimit
  upstashConfigured = true
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    upstashRatelimit = null
    return null
  }
  const { max, windowSec } = getMaxAndWindowSec()
  const redis = new Redis({ url, token })
  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
    prefix: 'ahotec:chat',
  })
  return upstashRatelimit
}

function tooManyResponse(retryAfterSec: number): NextResponse {
  const retry = String(retryAfterSec)
  return NextResponse.json(
    {
      error: 'Too many requests',
      message:
        'You are sending messages too quickly. Please wait a moment and try again.',
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retry,
      },
    }
  )
}

/**
 * Enforce per-IP rate limits on the chat API.
 * Uses Upstash when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (recommended for serverless / multiple instances).
 * Otherwise falls back to in-memory limiting (single instance / local dev).
 */
export async function enforceChatRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const id = getChatRateLimitId(request)
  const limiter = getUpstashRatelimit()

  if (limiter) {
    const { success, reset } = await limiter.limit(id)
    if (!success) {
      const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
      return tooManyResponse(retryAfterSec)
    }
    return null
  }

  const mem = memorySlidingWindow(id)
  if (!mem.ok) {
    return tooManyResponse(mem.retryAfterSec)
  }
  return null
}

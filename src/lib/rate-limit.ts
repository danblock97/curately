import { NextRequest } from 'next/server'
import { RateLimitError } from './error-handler'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  windowStart: number
}

// In-memory storage for rate limiting
// In production, you'd want to use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || req.ip || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = config

  return {
    check: (req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } => {
      const key = keyGenerator(req)
      const now = Date.now()
      
      let entry = rateLimitStore.get(key)
      
      // Create new entry if doesn't exist or window expired
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + windowMs,
          windowStart: now
        }
        rateLimitStore.set(key, entry)
      }
      
      // Check if limit exceeded
      if (entry.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime
        }
      }
      
      // Increment count
      entry.count++
      
      return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime
      }
    },
    
    reset: (req: NextRequest): void => {
      const key = keyGenerator(req)
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // General API rate limit
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  }),
  
  // Authentication endpoints (more generous for OAuth flows)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20 // Increased from 5 to handle OAuth flows
  }),
  
  // Link creation endpoints
  linkCreation: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 25 // Increased from 10 to allow rapid page setup
  }),
  
  // QR code generation (more resource intensive)
  qrCode: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20 // Increased from 5 to allow multiple QR codes during setup
  }),
  
  // Profile updates
  profile: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 15 // Increased from 5 to allow profile customization
  }),
  
  // File uploads
  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10 // Increased from 3 to allow multiple avatar/media uploads
  })
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit<T extends any[], R>(
  limiter: ReturnType<typeof rateLimit>,
  handler: (...args: T) => Promise<R>
) {
  return async (req: NextRequest, ...args: T): Promise<R> => {
    const result = limiter.check(req)
    
    if (!result.allowed) {
      const resetDate = new Date(result.resetTime)
      throw new RateLimitError(
        `Rate limit exceeded. Try again at ${resetDate.toISOString()}`
      )
    }
    
    return handler(req, ...args)
  }
}

/**
 * User-specific rate limiter
 */
export function createUserRateLimit(userId: string, config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: () => `user:${userId}`
  })
}

/**
 * Endpoint-specific rate limiter
 */
export function createEndpointRateLimit(endpoint: string, config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (req) => `endpoint:${endpoint}:${defaultKeyGenerator(req)}`
  })
}

/**
 * Sliding window rate limiter (more accurate)
 */
export function slidingWindowRateLimit(config: RateLimitConfig) {
  const requests = new Map<string, number[]>()
  
  return {
    check: (req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } => {
      const key = config.keyGenerator?.(req) || defaultKeyGenerator(req)
      const now = Date.now()
      const windowStart = now - config.windowMs
      
      // Get existing requests for this key
      let userRequests = requests.get(key) || []
      
      // Filter out requests outside the window
      userRequests = userRequests.filter(time => time > windowStart)
      
      // Check if limit exceeded
      if (userRequests.length >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: userRequests[0] + config.windowMs
        }
      }
      
      // Add current request
      userRequests.push(now)
      requests.set(key, userRequests)
      
      return {
        allowed: true,
        remaining: config.maxRequests - userRequests.length,
        resetTime: now + config.windowMs
      }
    }
  }
}

/**
 * Dynamic rate limiter based on user tier
 */
export function createTieredRateLimit(
  getUserTier: (req: NextRequest) => Promise<'free' | 'pro' | 'enterprise'>,
  limits: Record<string, RateLimitConfig>
) {
  return {
    check: async (req: NextRequest) => {
      const tier = await getUserTier(req)
      const config = limits[tier] || limits.free
      
      const limiter = rateLimit(config)
      return limiter.check(req)
    }
  }
}

/**
 * Rate limit headers helper
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    'X-RateLimit-Reset-MS': resetTime.toString()
  }
}

/**
 * Rate limit decorator for API route functions
 */
export function RateLimit(config: RateLimitConfig) {
  return function<T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value!
    const limiter = rateLimit(config)
    
    descriptor.value = async function(...args: T): Promise<R> {
      const req = args[0] as NextRequest
      const result = limiter.check(req)
      
      if (!result.allowed) {
        throw new RateLimitError()
      }
      
      return originalMethod.apply(this, args)
    }
    
    return descriptor
  }
}
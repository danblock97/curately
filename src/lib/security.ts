import { NextRequest } from 'next/server'

/**
 * Security utility functions for the application
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize URL inputs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  // Remove any whitespace
  url = url.trim()
  
  // Return empty string if nothing left after trimming
  if (!url) return ''
  
  // Check for blocked protocols first
  const blockedProtocols = ['javascript:', 'data:', 'vbscript:', 'ftp:']
  if (blockedProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
    throw new Error('Invalid protocol')
  }
  
  // Check for valid protocols
  const validProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  try {
    const urlObj = new URL(url)
    if (!validProtocols.includes(urlObj.protocol)) {
      throw new Error('Invalid protocol')
    }
    return urlObj.toString()
  } catch {
    // If URL parsing fails, assume it's a relative URL and add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }
    try {
      const urlObj = new URL(url)
      return urlObj.toString()
    } catch {
      throw new Error('Invalid URL format')
    }
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Hash a string using SHA-256 (Web Crypto API)
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  return token === expectedToken
}

/**
 * Check if a request is from a valid origin
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  const validOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean)
  
  if (origin && validOrigins.includes(origin)) {
    return true
  }
  
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return validOrigins.includes(refererUrl.origin)
    } catch {
      return false
    }
  }
  
  return false
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'
  return ip.trim()
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 5MB limit' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type' }
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return { isValid: false, error: 'Invalid file extension' }
  }
  
  return { isValid: true }
}

/**
 * Content Security Policy headers
 */
export function getCSPHeaders(): Record<string, string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.supabase.co'
  const supabaseHost = new URL(supabaseUrl).host
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseUrl} wss://${supabaseHost}`,
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { 
  isValid: boolean
  score: number
  feedback: string[] 
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }
  
  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number')
  } else {
    score += 1
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character')
  } else {
    score += 1
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return generateSecureToken(64)
}

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  return /^[A-Za-z0-9]{64}$/.test(token)
}

/**
 * Check for suspicious activity patterns
 */
export function detectSuspiciousActivity(
  userAgent: string,
  ip: string,
  endpoint: string
): { isSuspicious: boolean; reason?: string } {
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /scanner/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { isSuspicious: true, reason: 'Bot detected' }
  }
  
  // Check for suspicious user agents
  if (!userAgent || userAgent.length < 10) {
    return { isSuspicious: true, reason: 'Invalid user agent' }
  }
  
  // Check for private/local IP addresses accessing public endpoints
  if (endpoint.startsWith('/api/') && isPrivateIP(ip)) {
    return { isSuspicious: true, reason: 'Private IP accessing public API' }
  }
  
  return { isSuspicious: false }
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^127\./,
    /^::1$/,
    /^localhost$/
  ]
  
  return privateRanges.some(range => range.test(ip))
}

/**
 * Security middleware wrapper
 */
export function withSecurity<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R> => {
    // Validate origin for non-GET requests
    if (request.method !== 'GET' && !isValidOrigin(request)) {
      throw new Error('Invalid origin')
    }
    
    // Check for suspicious activity
    const userAgent = request.headers.get('user-agent') || ''
    const ip = getClientIP(request)
    const suspiciousActivity = detectSuspiciousActivity(
      userAgent, 
      ip, 
      request.nextUrl.pathname
    )
    
    if (suspiciousActivity.isSuspicious) {
      throw new Error(`Suspicious activity detected: ${suspiciousActivity.reason}`)
    }
    
    return handler(request, ...args)
  }
}

/**
 * Secure headers for API responses
 */
export function getSecureHeaders(): Record<string, string> {
  return {
    ...getCSPHeaders(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive',
  }
}
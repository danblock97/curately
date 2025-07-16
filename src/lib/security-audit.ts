/**
 * Security audit utilities for the application
 */

import { NextRequest } from 'next/server'
import { SECURITY_CONFIG } from './security-config'

export interface SecurityAuditResult {
  passed: boolean
  score: number
  issues: SecurityIssue[]
  recommendations: string[]
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  message: string
  details?: string
}

/**
 * Perform a comprehensive security audit
 */
export function performSecurityAudit(request: NextRequest): SecurityAuditResult {
  const issues: SecurityIssue[] = []
  const recommendations: string[] = []
  let score = 100

  // Check headers
  const headerAudit = auditHeaders(request)
  issues.push(...headerAudit.issues)
  score -= headerAudit.deductions

  // Check user agent
  const userAgentAudit = auditUserAgent(request)
  issues.push(...userAgentAudit.issues)
  score -= userAgentAudit.deductions

  // Check origin
  const originAudit = auditOrigin(request)
  issues.push(...originAudit.issues)
  score -= originAudit.deductions

  // Check for suspicious patterns
  const suspiciousAudit = auditSuspiciousPatterns(request)
  issues.push(...suspiciousAudit.issues)
  score -= suspiciousAudit.deductions

  // Generate recommendations
  if (issues.length > 0) {
    recommendations.push(...generateRecommendations(issues))
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}

/**
 * Audit request headers
 */
function auditHeaders(request: NextRequest): { issues: SecurityIssue[]; deductions: number } {
  const issues: SecurityIssue[] = []
  let deductions = 0

  // Check for required headers
  const userAgent = request.headers.get('user-agent')
  if (!userAgent) {
    issues.push({
      severity: 'medium',
      category: 'Headers',
      message: 'Missing User-Agent header',
      details: 'Requests without User-Agent headers are suspicious',
    })
    deductions += 15
  }

  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'x-remote-ip',
    'x-client-ip',
  ]

  suspiciousHeaders.forEach(header => {
    const value = request.headers.get(header)
    if (value && isPrivateIP(value)) {
      issues.push({
        severity: 'low',
        category: 'Headers',
        message: `Private IP detected in ${header}`,
        details: `Value: ${value}`,
      })
      deductions += 5
    }
  })

  return { issues, deductions }
}

/**
 * Audit user agent
 */
function auditUserAgent(request: NextRequest): { issues: SecurityIssue[]; deductions: number } {
  const issues: SecurityIssue[] = []
  let deductions = 0

  const userAgent = request.headers.get('user-agent') || ''

  // Check length
  if (userAgent.length < SECURITY_CONFIG.USER_AGENT_FILTER.MIN_LENGTH) {
    issues.push({
      severity: 'medium',
      category: 'User Agent',
      message: 'User agent too short',
      details: `Length: ${userAgent.length}, minimum: ${SECURITY_CONFIG.USER_AGENT_FILTER.MIN_LENGTH}`,
    })
    deductions += 10
  }

  // Check for bot patterns
  const botPatterns = SECURITY_CONFIG.USER_AGENT_FILTER.BOT_PATTERNS
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      issues.push({
        severity: 'high',
        category: 'User Agent',
        message: 'Bot detected',
        details: `Pattern matched: ${pattern.source}`,
      })
      deductions += 25
      break
    }
  }

  // Check for common suspicious patterns
  const suspiciousPatterns = [
    /python/i,
    /node/i,
    /go-http/i,
    /java/i,
    /php/i,
    /ruby/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      issues.push({
        severity: 'medium',
        category: 'User Agent',
        message: 'Suspicious programming language detected',
        details: `Pattern: ${pattern.source}`,
      })
      deductions += 10
      break
    }
  }

  return { issues, deductions }
}

/**
 * Audit request origin
 */
function auditOrigin(request: NextRequest): { issues: SecurityIssue[]; deductions: number } {
  const issues: SecurityIssue[] = []
  let deductions = 0

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Check origin for non-GET requests
  if (request.method !== 'GET') {
    if (!origin && !referer) {
      issues.push({
        severity: 'high',
        category: 'Origin',
        message: 'Missing origin and referer for non-GET request',
        details: 'CSRF protection requires origin validation',
      })
      deductions += 20
    }

    if (origin && !SECURITY_CONFIG.CORS.ALLOWED_ORIGINS.includes(origin)) {
      issues.push({
        severity: 'high',
        category: 'Origin',
        message: 'Invalid origin',
        details: `Origin: ${origin}`,
      })
      deductions += 30
    }
  }

  return { issues, deductions }
}

/**
 * Audit for suspicious patterns
 */
function auditSuspiciousPatterns(request: NextRequest): { issues: SecurityIssue[]; deductions: number } {
  const issues: SecurityIssue[] = []
  let deductions = 0

  const url = request.url
  const pathname = request.nextUrl.pathname

  // Check for SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /or\s+1=1/i,
    /drop\s+table/i,
    /exec\s*\(/i,
    /script\s*:/i,
  ]

  for (const pattern of sqlPatterns) {
    if (pattern.test(url)) {
      issues.push({
        severity: 'critical',
        category: 'Injection',
        message: 'Potential SQL injection detected',
        details: `Pattern: ${pattern.source}`,
      })
      deductions += 50
      break
    }
  }

  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /vbscript:/i,
  ]

  for (const pattern of xssPatterns) {
    if (pattern.test(url)) {
      issues.push({
        severity: 'critical',
        category: 'XSS',
        message: 'Potential XSS attack detected',
        details: `Pattern: ${pattern.source}`,
      })
      deductions += 50
      break
    }
  }

  // Check for path traversal
  const pathTraversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
  ]

  for (const pattern of pathTraversalPatterns) {
    if (pattern.test(url)) {
      issues.push({
        severity: 'high',
        category: 'Path Traversal',
        message: 'Potential path traversal detected',
        details: `Pattern: ${pattern.source}`,
      })
      deductions += 30
      break
    }
  }

  // Check for excessive requests to sensitive endpoints
  const sensitiveEndpoints = ['/api/', '/auth/', '/admin/']
  const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => 
    pathname.startsWith(endpoint)
  )

  if (isSensitiveEndpoint) {
    // Additional security checks for sensitive endpoints
    const userAgent = request.headers.get('user-agent') || ''
    if (userAgent.length < 20) {
      issues.push({
        severity: 'medium',
        category: 'Sensitive Endpoint',
        message: 'Suspicious access to sensitive endpoint',
        details: 'Very short user agent on sensitive endpoint',
      })
      deductions += 15
    }
  }

  return { issues, deductions }
}

/**
 * Generate recommendations based on issues
 */
function generateRecommendations(issues: SecurityIssue[]): string[] {
  const recommendations: string[] = []

  const hasHeaderIssues = issues.some(issue => issue.category === 'Headers')
  const hasUserAgentIssues = issues.some(issue => issue.category === 'User Agent')
  const hasOriginIssues = issues.some(issue => issue.category === 'Origin')
  const hasInjectionIssues = issues.some(issue => issue.category === 'Injection')
  const hasXSSIssues = issues.some(issue => issue.category === 'XSS')

  if (hasHeaderIssues) {
    recommendations.push('Implement header validation middleware')
    recommendations.push('Add required security headers to all responses')
  }

  if (hasUserAgentIssues) {
    recommendations.push('Implement user agent filtering')
    recommendations.push('Block known bot patterns')
  }

  if (hasOriginIssues) {
    recommendations.push('Implement proper CORS configuration')
    recommendations.push('Add CSRF protection for state-changing operations')
  }

  if (hasInjectionIssues) {
    recommendations.push('Implement input validation and sanitization')
    recommendations.push('Use parameterized queries for database operations')
  }

  if (hasXSSIssues) {
    recommendations.push('Implement content security policy')
    recommendations.push('Sanitize all user inputs before processing')
  }

  return recommendations
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
    /^localhost$/,
  ]

  return privateRanges.some(range => range.test(ip))
}

/**
 * Log security audit results
 */
export function logSecurityAudit(
  request: NextRequest,
  result: SecurityAuditResult
): void {
  const criticalIssues = result.issues.filter(issue => issue.severity === 'critical')
  const highIssues = result.issues.filter(issue => issue.severity === 'high')

  if (criticalIssues.length > 0 || highIssues.length > 0) {
    console.warn('Security audit failed:', {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.ip,
      score: result.score,
      criticalIssues: criticalIssues.length,
      highIssues: highIssues.length,
      issues: result.issues.map(issue => ({
        severity: issue.severity,
        category: issue.category,
        message: issue.message,
      })),
    })
  }
}

/**
 * Security audit middleware
 */
export function withSecurityAudit<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R> => {
    const auditResult = performSecurityAudit(request)
    
    logSecurityAudit(request, auditResult)
    
    if (!auditResult.passed) {
      const criticalIssues = auditResult.issues.filter(issue => 
        issue.severity === 'critical'
      )
      
      if (criticalIssues.length > 0) {
        throw new Error(`Security audit failed: ${criticalIssues[0].message}`)
      }
    }
    
    return handler(request, ...args)
  }
}
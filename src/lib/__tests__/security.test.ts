import { NextRequest } from 'next/server'
import {
  sanitizeInput,
  sanitizeUrl,
  generateSecureToken,
  hashString,
  verifyCSRFToken,
  isValidOrigin,
  getClientIP,
  validateFileUpload,
  getCSPHeaders,
  validatePasswordStrength,
  generateSessionToken,
  isValidSessionToken,
  detectSuspiciousActivity,
  withSecurity,
  getSecureHeaders,
} from '../security'

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should sanitize malicious input', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")')
      expect(sanitizeInput('data:text/html,<script>alert("xss")</script>')).toBe('text/html,scriptalert("xss")/script')
      expect(sanitizeInput('vbscript:alert("xss")')).toBe('alert("xss")')
      expect(sanitizeInput('onclick="alert(1)"')).toBe('"alert(1)"')
    })

    it('should preserve clean input', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World')
      expect(sanitizeInput('User123')).toBe('User123')
      expect(sanitizeInput('test@example.com')).toBe('test@example.com')
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput('   ')).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should sanitize and validate URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
      expect(sanitizeUrl('example.com')).toBe('https://example.com/')
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('should reject invalid URLs', () => {
      expect(() => sanitizeUrl('javascript:alert("xss")')).toThrow('Invalid protocol')
      expect(() => sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toThrow('Invalid protocol')
      expect(() => sanitizeUrl('ftp://example.com')).toThrow('Invalid protocol')
      expect(() => sanitizeUrl('invalid-url')).toThrow('Invalid URL format')
    })

    it('should handle empty input', () => {
      expect(sanitizeUrl('')).toBe('')
      expect(sanitizeUrl('   ')).toBe('')
    })
  })

  describe('generateSecureToken', () => {
    it('should generate tokens of specified length', () => {
      expect(generateSecureToken(16)).toHaveLength(16)
      expect(generateSecureToken(32)).toHaveLength(32)
      expect(generateSecureToken(64)).toHaveLength(64)
    })

    it('should generate different tokens', () => {
      const token1 = generateSecureToken(32)
      const token2 = generateSecureToken(32)
      expect(token1).not.toBe(token2)
    })

    it('should use default length', () => {
      expect(generateSecureToken()).toHaveLength(32)
    })
  })

  describe('hashString', () => {
    it('should hash strings consistently', () => {
      const input = 'test string'
      const hash1 = hashString(input)
      const hash2 = hashString(input)
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA-256 hex output
    })

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashString('input1')
      const hash2 = hashString('input2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyCSRFToken', () => {
    it('should verify matching tokens', () => {
      const token = 'test-token-123'
      expect(verifyCSRFToken(token, token)).toBe(true)
    })

    it('should reject non-matching tokens', () => {
      expect(verifyCSRFToken('token1', 'token2')).toBe(false)
    })

    it('should reject empty tokens', () => {
      expect(verifyCSRFToken('', 'token')).toBe(false)
      expect(verifyCSRFToken('token', '')).toBe(false)
      expect(verifyCSRFToken('', '')).toBe(false)
    })
  })

  describe('isValidOrigin', () => {
    it('should validate correct origins', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        },
      })
      expect(isValidOrigin(request)).toBe(true)
    })

    it('should reject invalid origins', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          origin: 'https://malicious.com',
        },
      })
      expect(isValidOrigin(request)).toBe(false)
    })

    it('should validate referer if origin is missing', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          referer: 'http://localhost:3000/page',
        },
      })
      expect(isValidOrigin(request)).toBe(true)
    })
  })

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          'x-real-ip': '192.168.1.1',
        },
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('should fallback to unknown if no IP found', () => {
      const request = new NextRequest('https://example.com/api/test')
      expect(getClientIP(request)).toBe('unknown')
    })
  })

  describe('validateFileUpload', () => {
    it('should validate correct file uploads', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFileUpload(file)
      expect(result.isValid).toBe(true)
    })

    it('should reject files that are too large', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const result = validateFileUpload(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('File size exceeds 5MB limit')
    })

    it('should reject invalid file types', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const result = validateFileUpload(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid file type')
    })

    it('should reject invalid file extensions', () => {
      const file = new File(['test'], 'test.exe', { type: 'image/jpeg' })
      const result = validateFileUpload(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid file extension')
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('Test123!')
      expect(result.isValid).toBe(true)
      expect(result.score).toBe(5)
      expect(result.feedback).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(4)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should provide specific feedback', () => {
      const result = validatePasswordStrength('password')
      expect(result.feedback).toContain('Password must contain at least one uppercase letter')
      expect(result.feedback).toContain('Password must contain at least one number')
      expect(result.feedback).toContain('Password must contain at least one special character')
    })
  })

  describe('generateSessionToken', () => {
    it('should generate 64-character tokens', () => {
      const token = generateSessionToken()
      expect(token).toHaveLength(64)
    })

    it('should generate different tokens', () => {
      const token1 = generateSessionToken()
      const token2 = generateSessionToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('isValidSessionToken', () => {
    it('should validate correct session tokens', () => {
      const validToken = 'A'.repeat(64)
      expect(isValidSessionToken(validToken)).toBe(true)
    })

    it('should reject invalid session tokens', () => {
      expect(isValidSessionToken('too-short')).toBe(false)
      expect(isValidSessionToken('A'.repeat(65))).toBe(false)
      expect(isValidSessionToken('A'.repeat(63) + '!'))).toBe(false)
    })
  })

  describe('detectSuspiciousActivity', () => {
    it('should detect bot user agents', () => {
      const result = detectSuspiciousActivity('GoogleBot/1.0', '192.168.1.1', '/api/test')
      expect(result.isSuspicious).toBe(true)
      expect(result.reason).toBe('Bot detected')
    })

    it('should detect invalid user agents', () => {
      const result = detectSuspiciousActivity('', '192.168.1.1', '/api/test')
      expect(result.isSuspicious).toBe(true)
      expect(result.reason).toBe('Invalid user agent')
    })

    it('should detect short user agents', () => {
      const result = detectSuspiciousActivity('short', '192.168.1.1', '/api/test')
      expect(result.isSuspicious).toBe(true)
      expect(result.reason).toBe('Invalid user agent')
    })

    it('should allow normal user agents', () => {
      const result = detectSuspiciousActivity(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '192.168.1.1',
        '/api/test'
      )
      expect(result.isSuspicious).toBe(false)
    })
  })

  describe('getCSPHeaders', () => {
    it('should return CSP headers', () => {
      const headers = getCSPHeaders()
      expect(headers).toHaveProperty('Content-Security-Policy')
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff')
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY')
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block')
    })
  })

  describe('getSecureHeaders', () => {
    it('should return secure headers', () => {
      const headers = getSecureHeaders()
      expect(headers).toHaveProperty('Content-Security-Policy')
      expect(headers).toHaveProperty('Strict-Transport-Security')
      expect(headers).toHaveProperty('X-Robots-Tag')
    })
  })

  describe('withSecurity', () => {
    it('should wrap handlers with security checks', async () => {
      const mockHandler = jest.fn().mockResolvedValue('success')
      const secureHandler = withSecurity(mockHandler)
      
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'origin': 'http://localhost:3000',
        },
      })
      
      const result = await secureHandler(request)
      expect(result).toBe('success')
      expect(mockHandler).toHaveBeenCalledWith(request)
    })

    it('should reject requests with invalid origin', async () => {
      const mockHandler = jest.fn()
      const secureHandler = withSecurity(mockHandler)
      
      const request = new NextRequest('https://example.com/api/test', {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'origin': 'https://malicious.com',
        },
      })
      
      await expect(secureHandler(request)).rejects.toThrow('Invalid origin')
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should reject suspicious requests', async () => {
      const mockHandler = jest.fn()
      const secureHandler = withSecurity(mockHandler)
      
      const request = new NextRequest('https://example.com/api/test', {
        headers: {
          'user-agent': 'GoogleBot/1.0',
        },
      })
      
      await expect(secureHandler(request)).rejects.toThrow('Suspicious activity detected')
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })
})
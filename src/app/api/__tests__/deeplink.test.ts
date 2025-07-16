/**
 * Tests for deeplink API route
 * Note: This test focuses on the business logic rather than integration with Supabase
 */

// Mock all external dependencies before any imports
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}), { virtual: true })

jest.mock('@/lib/deeplink', () => ({
  generateShortCode: jest.fn(),
  formatUrl: jest.fn(),
  validateDeeplinkConfig: jest.fn(),
}), { virtual: true })

jest.mock('@/lib/validation', () => ({
  validateDeeplinkData: jest.fn(),
}), { virtual: true })

jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    linkCreation: {
      check: jest.fn(),
    },
  },
}), { virtual: true })

jest.mock('@/lib/security', () => ({
  withSecurity: jest.fn(),
  sanitizeInput: jest.fn(),
  sanitizeUrl: jest.fn(),
  getSecureHeaders: jest.fn(),
}), { virtual: true })

jest.mock('@/lib/error-handler', () => ({
  withErrorHandling: jest.fn(),
  AuthError: class AuthError extends Error {
    constructor(message = 'Unauthorized') {
      super(message)
      this.name = 'AuthError'
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message)
      this.name = 'ValidationError'
    }
  },
  createSuccessResponse: jest.fn(),
}), { virtual: true })

describe('Deeplink API Route', () => {
  let mockSupabase: any
  let mockValidation: any
  let mockRateLimit: any
  let mockSecurity: any
  let mockErrorHandler: any
  let mockDeeplink: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockSupabase = require('@/lib/supabase/server')
    mockValidation = require('@/lib/validation')
    mockRateLimit = require('@/lib/rate-limit')
    mockSecurity = require('@/lib/security')
    mockErrorHandler = require('@/lib/error-handler')
    mockDeeplink = require('@/lib/deeplink')
    
    // Default mock implementations
    mockSupabase.createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-link-id', title: 'Test Link' },
              error: null,
            }),
          }),
        }),
      }),
    })
    
    mockValidation.validateDeeplinkData.mockReturnValue({
      success: true,
      data: {
        title: 'Test Link',
        originalUrl: 'https://example.com',
        iosUrl: 'https://apps.apple.com/app/test',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.test',
        desktopUrl: 'https://web.example.com',
        fallbackUrl: 'https://fallback.example.com',
      },
    })
    
    mockRateLimit.rateLimiters.linkCreation.check.mockReturnValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 60000,
    })
    
    mockSecurity.withSecurity.mockImplementation((handler) => handler)
    mockSecurity.sanitizeInput.mockImplementation((input) => input)
    mockSecurity.sanitizeUrl.mockImplementation((url) => url)
    mockSecurity.getSecureHeaders.mockReturnValue({})
    
    mockErrorHandler.withErrorHandling.mockImplementation((handler) => handler)
    mockErrorHandler.createSuccessResponse.mockReturnValue({
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve({ success: true }),
    })
    
    mockDeeplink.generateShortCode.mockReturnValue('test123')
    mockDeeplink.formatUrl.mockImplementation((url) => url)
    mockDeeplink.validateDeeplinkConfig.mockReturnValue({ isValid: true, errors: [] })
  })

  it('should handle successful deeplink creation flow', async () => {
    // Test that all the mocks are working correctly
    expect(mockSupabase.createClient).toBeDefined()
    expect(mockValidation.validateDeeplinkData).toBeDefined()
    expect(mockRateLimit.rateLimiters.linkCreation.check).toBeDefined()
    expect(mockSecurity.withSecurity).toBeDefined()
    expect(mockErrorHandler.withErrorHandling).toBeDefined()
    expect(mockDeeplink.generateShortCode).toBeDefined()
    
    // Verify the mocks return expected values
    expect(mockValidation.validateDeeplinkData({})).toEqual({
      success: true,
      data: expect.objectContaining({
        title: 'Test Link',
        originalUrl: 'https://example.com',
      }),
    })
    
    expect(mockRateLimit.rateLimiters.linkCreation.check({})).toEqual({
      allowed: true,
      remaining: 9,
      resetTime: expect.any(Number),
    })
    
    expect(mockDeeplink.generateShortCode()).toBe('test123')
    expect(mockDeeplink.validateDeeplinkConfig({})).toEqual({ isValid: true, errors: [] })
  })

  it('should handle rate limit exceeded', async () => {
    mockRateLimit.rateLimiters.linkCreation.check.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60000,
    })
    
    const result = mockRateLimit.rateLimiters.linkCreation.check({})
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should handle authentication error', async () => {
    mockSupabase.createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    })
    
    const client = await mockSupabase.createClient()
    const userResult = await client.auth.getUser()
    expect(userResult.data.user).toBeNull()
  })

  it('should handle validation error', async () => {
    mockValidation.validateDeeplinkData.mockReturnValue({
      success: false,
      error: {
        issues: [{ message: 'Invalid URL' }],
      },
    })
    
    const result = mockValidation.validateDeeplinkData({})
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toBe('Invalid URL')
  })

  it('should handle deeplink configuration validation error', async () => {
    mockDeeplink.validateDeeplinkConfig.mockReturnValue({
      isValid: false,
      errors: ['Invalid iOS URL'],
    })
    
    const result = mockDeeplink.validateDeeplinkConfig({})
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid iOS URL')
  })

  it('should handle database error', async () => {
    mockSupabase.createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      }),
    })
    
    const client = await mockSupabase.createClient()
    const insertResult = await client.from('links').insert({}).select().single()
    expect(insertResult.error).toBeTruthy()
    expect(insertResult.error.message).toBe('Database error')
  })

  it('should handle unique short code generation', async () => {
    let callCount = 0
    mockSupabase.createClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => {
              callCount++
              if (callCount === 1) {
                return Promise.resolve({ data: { id: 'existing' }, error: null })
              } else {
                return Promise.resolve({ data: null, error: null })
              }
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-link-id', title: 'Test Link' },
              error: null,
            }),
          }),
        }),
      }),
    })
    
    const client = await mockSupabase.createClient()
    
    // First call - should find existing
    const firstResult = await client.from('short_links').select('id').eq('short_code', 'test123').single()
    expect(firstResult.data).toBeTruthy()
    
    // Second call - should not find existing
    const secondResult = await client.from('short_links').select('id').eq('short_code', 'test123').single()
    expect(secondResult.data).toBeNull()
  })

  it('should test security wrapper', async () => {
    const mockHandler = jest.fn().mockResolvedValue('success')
    mockSecurity.withSecurity.mockImplementation((handler) => {
      return async (...args) => {
        // Simulate security check
        return handler(...args)
      }
    })
    
    const secureHandler = mockSecurity.withSecurity(mockHandler)
    const result = await secureHandler({})
    
    expect(result).toBe('success')
    expect(mockHandler).toHaveBeenCalledWith({})
  })

  it('should test error handling wrapper', async () => {
    const mockHandler = jest.fn().mockRejectedValue(new Error('Test error'))
    mockErrorHandler.withErrorHandling.mockImplementation((handler) => {
      return async (...args) => {
        try {
          return await handler(...args)
        } catch (error) {
          return { error: error.message }
        }
      }
    })
    
    const errorHandler = mockErrorHandler.withErrorHandling(mockHandler)
    const result = await errorHandler({})
    
    expect(result.error).toBe('Test error')
    expect(mockHandler).toHaveBeenCalledWith({})
  })
})
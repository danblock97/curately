import { NextRequest } from 'next/server'
import { POST } from '../links/deeplink/route'

// Mock all the dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        count: 'exact',
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-link-id', title: 'Test Link' }, 
            error: null 
          })),
        })),
      })),
    })),
  })),
}))

jest.mock('@/lib/deeplink', () => ({
  generateShortCode: jest.fn(() => 'test123'),
  formatUrl: jest.fn((url) => url),
  validateDeeplinkConfig: jest.fn(() => ({ isValid: true, errors: [] })),
}))

jest.mock('@/lib/validation', () => ({
  validateDeeplinkData: jest.fn(() => ({ 
    success: true, 
    data: {
      title: 'Test Link',
      originalUrl: 'https://example.com',
      iosUrl: 'https://apps.apple.com/app/test',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.test',
      desktopUrl: 'https://web.example.com',
      fallbackUrl: 'https://fallback.example.com',
    }
  })),
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    linkCreation: {
      check: jest.fn(() => ({ allowed: true, remaining: 9, resetTime: Date.now() + 60000 })),
    },
  },
}))

jest.mock('@/lib/security', () => ({
  withSecurity: jest.fn((handler) => handler),
  sanitizeInput: jest.fn((input) => input),
  sanitizeUrl: jest.fn((url) => url),
  getSecureHeaders: jest.fn(() => ({})),
}))

describe('/api/links/deeplink', () => {
  const mockSupabase = require('@/lib/supabase/server').createClient()
  const mockRateLimit = require('@/lib/rate-limit').rateLimiters.linkCreation
  const mockValidation = require('@/lib/validation').validateDeeplinkData
  const mockDeeplink = require('@/lib/deeplink')

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset default mocks
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    })
    
    mockRateLimit.check.mockReturnValue({ 
      allowed: true, 
      remaining: 9, 
      resetTime: Date.now() + 60000 
    })
    
    mockValidation.mockReturnValue({ 
      success: true, 
      data: {
        title: 'Test Link',
        originalUrl: 'https://example.com',
        iosUrl: 'https://apps.apple.com/app/test',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.test',
        desktopUrl: 'https://web.example.com',
        fallbackUrl: 'https://fallback.example.com',
      }
    })
    
    mockDeeplink.validateDeeplinkConfig.mockReturnValue({ 
      isValid: true, 
      errors: [] 
    })
  })

  it('should create a deeplink successfully', async () => {
    const requestBody = {
      title: 'Test Link',
      originalUrl: 'https://example.com',
      iosUrl: 'https://apps.apple.com/app/test',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.test',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.link).toBeDefined()
    expect(data.data.shortUrl).toBeDefined()
    expect(data.data.shortCode).toBeDefined()
  })

  it('should reject request when rate limit is exceeded', async () => {
    mockRateLimit.check.mockReturnValue({ 
      allowed: false, 
      remaining: 0, 
      resetTime: Date.now() + 60000 
    })

    const requestBody = {
      title: 'Test Link',
      originalUrl: 'https://example.com',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(429)
    
    const data = await response.json()
    expect(data.error).toBe('Rate limit exceeded. Please try again later.')
  })

  it('should reject request when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    })

    const requestBody = {
      title: 'Test Link',
      originalUrl: 'https://example.com',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(401)
  })

  it('should reject request with invalid data', async () => {
    mockValidation.mockReturnValue({ 
      success: false, 
      error: { 
        issues: [{ message: 'Invalid URL' }] 
      } 
    })

    const requestBody = {
      title: 'Test Link',
      originalUrl: 'invalid-url',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('should reject request with invalid deeplink configuration', async () => {
    mockDeeplink.validateDeeplinkConfig.mockReturnValue({ 
      isValid: false, 
      errors: ['Invalid iOS URL'] 
    })

    const requestBody = {
      title: 'Test Link',
      originalUrl: 'https://example.com',
      iosUrl: 'invalid-ios-url',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('should handle database errors gracefully', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: null, 
            error: { message: 'Database error' } 
          })),
        })),
      })),
    }))

    const requestBody = {
      title: 'Test Link',
      originalUrl: 'https://example.com',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(500)
    
    const data = await response.json()
    expect(data.error).toBe('Failed to create deeplink')
  })

  it('should handle unique short code generation', async () => {
    let callCount = 0
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => {
            callCount++
            if (callCount === 1) {
              // First call - short code exists
              return Promise.resolve({ data: { id: 'existing' }, error: null })
            } else {
              // Second call - short code is unique
              return Promise.resolve({ data: null, error: null })
            }
          }),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-link-id', title: 'Test Link' }, 
            error: null 
          })),
        })),
      })),
    }))

    const requestBody = {
      title: 'Test Link',
      originalUrl: 'https://example.com',
    }

    const request = new NextRequest('https://example.com/api/links/deeplink', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    
    expect(response.status).toBe(200)
    expect(mockDeeplink.generateShortCode).toHaveBeenCalledTimes(2)
  })
})
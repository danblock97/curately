import { NextRequest, NextResponse } from 'next/server'
import {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  RateLimitError,
  handleApiError,
  handleClientError,
  withErrorHandling,
  createErrorResponse,
  createSuccessResponse,
  logError,
} from '../error-handler'

// Mock NextResponse.json
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
  NextRequest: jest.fn(),
}))

// Helper function to create mock NextRequest
function createMockRequest(url: string, method: string = 'GET'): NextRequest {
  return {
    url,
    method,
    headers: {
      get: jest.fn(),
    },
    nextUrl: {
      pathname: new URL(url).pathname,
    },
  } as any
}

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR')
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('AppError')
    })

    it('should use default values', () => {
      const error = new AppError('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBeUndefined()
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Validation failed', 'VALIDATION_ERROR')
      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.name).toBe('ValidationError')
    })

    it('should use default code', () => {
      const error = new ValidationError('Validation failed')
      expect(error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('AuthError', () => {
    it('should create AuthError with correct properties', () => {
      const error = new AuthError('Unauthorized')
      expect(error.message).toBe('Unauthorized')
      expect(error.statusCode).toBe(401)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe('AUTH_ERROR')
      expect(error.name).toBe('AuthError')
    })

    it('should use default message and code', () => {
      const error = new AuthError()
      expect(error.message).toBe('Authentication required')
      expect(error.code).toBe('AUTH_ERROR')
    })
  })

  describe('NotFoundError', () => {
    it('should create NotFoundError with correct properties', () => {
      const error = new NotFoundError('Resource not found', 'NOT_FOUND')
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.name).toBe('NotFoundError')
    })

    it('should use default message and code', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
      expect(error.code).toBe('NOT_FOUND')
    })
  })

  describe('RateLimitError', () => {
    it('should create RateLimitError with correct properties', () => {
      const error = new RateLimitError('Rate limit exceeded')
      expect(error.message).toBe('Rate limit exceeded')
      expect(error.statusCode).toBe(429)
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe('RATE_LIMIT_ERROR')
      expect(error.name).toBe('RateLimitError')
    })

    it('should use default message and code', () => {
      const error = new RateLimitError()
      expect(error.message).toBe('Too many requests')
      expect(error.code).toBe('RATE_LIMIT_ERROR')
    })
  })

  describe('handleApiError', () => {
    it('should handle AppError', () => {
      const error = new ValidationError('Invalid input')
      const response = handleApiError(error)
      expect(response.status).toBe(400)
    })

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error')
      const response = handleApiError(error)
      expect(response.status).toBe(500)
    })

    it('should handle non-Error objects', () => {
      const error = 'String error'
      const response = handleApiError(error)
      expect(response.status).toBe(500)
    })
  })

  describe('handleClientError', () => {
    it('should handle AppError', () => {
      const error = new ValidationError('Invalid input')
      const message = handleClientError(error)
      expect(message).toBe('Invalid input')
    })

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error')
      const message = handleClientError(error)
      expect(message).toBe('Unknown error')
    })

    it('should handle non-Error objects', () => {
      const error = 'String error'
      const message = handleClientError(error)
      expect(message).toBe('String error')
    })
  })

  describe('withErrorHandling', () => {
    it('should wrap handler with error handling', async () => {
      const mockHandler = jest.fn().mockResolvedValue('success')
      const wrappedHandler = withErrorHandling(mockHandler)
      
      const request = createMockRequest('https://example.com/api/test')
      const result = await wrappedHandler(request)
      
      expect(result).toBe('success')
      expect(mockHandler).toHaveBeenCalledWith(request)
    })

    it('should catch and handle errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new ValidationError('Invalid input'))
      const wrappedHandler = withErrorHandling(mockHandler)
      
      const request = createMockRequest('https://example.com/api/test')
      const result = await wrappedHandler(request)
      
      expect(result.status).toBe(400)
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response with message', () => {
      const response = createErrorResponse('Test error', 400, 'TEST_ERROR')
      expect(response.status).toBe(400)
    })

    it('should use default status code', () => {
      const response = createErrorResponse('Test error')
      expect(response.status).toBe(500)
    })
  })

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data, 'Success')
      expect(response.status).toBe(200)
    })

    it('should use default status code', () => {
      const response = createSuccessResponse({ test: true })
      expect(response.status).toBe(200)
    })
  })

  describe('logError', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should log error with context', () => {
      const error = new ValidationError('Test error')
      const request = createMockRequest('https://example.com/api/test')
      
      logError(error, request, 'Test context')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error',
          statusCode: 400,
          url: 'https://example.com/api/test',
          method: 'GET',
          context: 'Test context',
        })
      )
    })

    it('should log error without context', () => {
      const error = new Error('Test error')
      const request = createMockRequest('https://example.com/api/test')
      
      logError(error, request)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error',
          statusCode: 500,
          url: 'https://example.com/api/test',
          method: 'GET',
        })
      )
    })
  })
})
import { NextResponse } from 'next/server'

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.isOperational = true
    this.code = code
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code || 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

/**
 * Global error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        success: false
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Handle database errors
    if (error.message.includes('duplicate key')) {
      return NextResponse.json(
        { 
          error: 'Resource already exists',
          code: 'DUPLICATE_ERROR',
          success: false
        },
        { status: 409 }
      )
    }

    // Handle validation errors
    if (error.message.includes('violates check constraint')) {
      return NextResponse.json(
        { 
          error: 'Invalid data provided',
          code: 'VALIDATION_ERROR',
          success: false
        },
        { status: 400 }
      )
    }

    // Handle foreign key constraint errors
    if (error.message.includes('foreign key')) {
      return NextResponse.json(
        { 
          error: 'Referenced resource not found',
          code: 'REFERENCE_ERROR',
          success: false
        },
        { status: 400 }
      )
    }
  }

  // Default server error
  return NextResponse.json(
    { 
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      success: false
    },
    { status: 500 }
  )
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await fn(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Client-side error handler
 */
export function handleClientError(error: unknown): string {
  console.error('Client Error:', error)

  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}

/**
 * Form validation error handler
 */
export function handleFormError(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {}

  if (error instanceof ValidationError) {
    errors.general = error.message
  } else if (error instanceof Error) {
    errors.general = error.message
  } else {
    errors.general = 'An unexpected error occurred'
  }

  return errors
}

/**
 * API response wrapper
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createErrorResponse(message: string, statusCode: number = 500, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code
    },
    { status: statusCode }
  )
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`
    )
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate username format
 */
export function validateUsername(username: string): boolean {
  // 3-30 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

/**
 * Log error with context
 */
export function logError(error: unknown, request?: any, context?: string) {
  const errorData: any = {
    message: error instanceof Error ? error.message : String(error),
    statusCode: error instanceof AppError ? error.statusCode : 500,
    timestamp: new Date().toISOString()
  }
  
  if (request) {
    errorData.url = request.url
    errorData.method = request.method
  }
  
  if (context) {
    errorData.context = context
  }
  
  if (error instanceof Error) {
    errorData.stack = error.stack
  }
  
  console.error('Error occurred:', errorData)
}

/**
 * Rate limiting helper
 */
export function createRateLimitMap() {
  const requests = new Map<string, number[]>()
  
  return {
    isRateLimited: (key: string, limit: number, windowMs: number): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs
      
      // Get existing requests for this key
      const userRequests = requests.get(key) || []
      
      // Filter out requests outside the window
      const recentRequests = userRequests.filter(time => time > windowStart)
      
      // Check if rate limit is exceeded
      if (recentRequests.length >= limit) {
        return true
      }
      
      // Add current request
      recentRequests.push(now)
      requests.set(key, recentRequests)
      
      return false
    }
  }
}

/**
 * Error boundary for React components
 */
export class ErrorBoundary extends Error {
  constructor(
    public componentName: string,
    public originalError: Error
  ) {
    super(`Error in ${componentName}: ${originalError.message}`)
    this.name = 'ErrorBoundary'
  }
}
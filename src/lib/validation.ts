import { z } from 'zod'

// User profile validation schemas
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .refine(
    (val) => !val.startsWith('_') && !val.endsWith('_'),
    'Username cannot start or end with underscore'
  )

export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(50, 'Display name cannot exceed 50 characters')
  .trim()
  .refine(
    (val) => !/<[^>]*>/.test(val),
    'Display name cannot contain HTML tags'
  )

export const bioSchema = z
  .string()
  .max(200, 'Bio cannot exceed 200 characters')
  .optional()
  .refine(
    (val) => !val || !/<[^>]*>/.test(val),
    'Bio cannot contain HTML tags'
  )
  .refine(
    (val) => !val || !/javascript:/i.test(val),
    'Bio cannot contain JavaScript'
  )

export const themeSchema = z.enum(['light', 'dark', 'gradient1', 'gradient2'])

// Link validation schemas
export const linkTitleSchema = z
  .string()
  .min(1, 'Link title is required')
  .max(100, 'Link title cannot exceed 100 characters')
  .trim()
  .refine(
    (val) => !/<[^>]*>/.test(val),
    'Link title cannot contain HTML tags'
  )
  .refine(
    (val) => !/javascript:/i.test(val),
    'Link title cannot contain JavaScript'
  )

export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL')
  .refine(
    (val) => val.startsWith('http://') || val.startsWith('https://'),
    'URL must start with http:// or https://'
  )
  .refine(
    (val) => !/javascript:/i.test(val),
    'URL cannot contain JavaScript'
  )
  .refine(
    (val) => !/data:/i.test(val),
    'Data URLs are not allowed'
  )
  .refine(
    (val) => val.length <= 2048,
    'URL cannot exceed 2048 characters'
  )

export const optionalUrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))

// Profile validation schema
export const profileSchema = z.object({
  username: usernameSchema,
  display_name: displayNameSchema,
  bio: bioSchema,
  theme: themeSchema,
  avatar_url: z.string().url().optional().or(z.literal('')),
})

// Link creation schemas
export const linkInBioSchema = z.object({
  title: linkTitleSchema,
  url: urlSchema,
  is_active: z.boolean().default(true),
})

export const deeplinkSchema = z.object({
  title: linkTitleSchema,
  originalUrl: urlSchema,
  iosUrl: optionalUrlSchema,
  androidUrl: optionalUrlSchema,
  desktopUrl: optionalUrlSchema,
  fallbackUrl: optionalUrlSchema,
  pageId: z.string().uuid(),
})

export const qrCodeSchema = z.object({
  title: linkTitleSchema,
  url: urlSchema,
  size: z.number().min(50).max(1000).default(200),
  format: z.enum(['PNG', 'SVG']).default('PNG'),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  foregroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#000000'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#FFFFFF'),
  pageId: z.string().uuid().optional(),
  logoFile: z.string().optional(), // Base64 encoded logo file for pro users
  platform: z.string().optional(), // Platform for automatic logo detection
})

// Social media validation
export const socialMediaSchema = z.object({
  instagram: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

// Email validation
export const emailSchema = z.string().email('Please enter a valid email address')

// Auth validation
export const authSchema = z.object({
  email: emailSchema,
})

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: emailSchema,
  message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
})

// Server-side validation helpers
export function validateProfileData(data: unknown) {
  return profileSchema.safeParse(data)
}

export function validateLinkData(data: unknown) {
  return linkInBioSchema.safeParse(data)
}

export function validateDeeplinkData(data: unknown) {
  return deeplinkSchema.safeParse(data)
}

export function validateQRCodeData(data: unknown) {
  return qrCodeSchema.safeParse(data)
}

export function validateSocialMediaData(data: unknown) {
  return socialMediaSchema.safeParse(data)
}

export function validateAuthData(data: unknown) {
  return authSchema.safeParse(data)
}

// Client-side form validation hook
export function useFormValidation<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return {
    validate: (data: unknown) => {
      const result = schema.safeParse(data)
      if (!result.success) {
        const errors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        return { success: false, errors }
      }
      return { success: true, data: result.data }
    },
    
    validateField: (fieldName: string, value: unknown) => {
      try {
        // Create a partial object with just the field to validate
        const testObject = { [fieldName]: value }
        const result = schema.partial().safeParse(testObject)
        if (!result.success) {
          const fieldError = result.error.issues.find(issue => 
            issue.path.includes(fieldName)
          )
          return fieldError?.message || 'Invalid value'
        }
        return null
      } catch {
        return null
      }
    }
  }
}

// Form submission helpers
export function getFormData(formData: FormData): Record<string, string> {
  const data: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    data[key] = value.toString()
  }
  return data
}

export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim()
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// Custom validation functions
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const result = usernameSchema.safeParse(username)
  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.issues[0]?.message
  }
}

export function validateUrl(url: string): { isValid: boolean; error?: string } {
  const result = urlSchema.safeParse(url)
  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.issues[0]?.message
  }
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const result = emailSchema.safeParse(email)
  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.issues[0]?.message
  }
}

// Form error formatting
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  
  errors.issues.forEach((issue) => {
    const path = issue.path.join('.')
    formatted[path] = issue.message
  })
  
  return formatted
}

// API validation middleware
export function validateApiRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return {
      success: false,
      errors: formatValidationErrors(result.error)
    }
  }
  
  return {
    success: true,
    data: result.data
  }
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  limit: z.number().min(1).max(1000).default(100),
  window: z.number().min(1000).max(3600000).default(60000), // 1 second to 1 hour
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
})

export function validateFileUpload(file: File, options: { maxSize?: number; allowedTypes?: string[] } = {}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options
  
  const errors: string[] = []
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
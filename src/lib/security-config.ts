/**
 * Security configuration for the application
 */

export const SECURITY_CONFIG = {
  // Password policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },

  // Rate limiting configuration
  RATE_LIMITS: {
    API_GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 5,
    },
    LINK_CREATION: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 10,
    },
    QR_CODE: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 5,
    },
  },

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },

  // URL validation
  URL_VALIDATION: {
    MAX_LENGTH: 2048,
    ALLOWED_PROTOCOLS: ['http:', 'https:', 'mailto:', 'tel:'],
    BLOCKED_DOMAINS: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      // Add any other domains you want to block
    ],
  },

  // Input sanitization
  INPUT_SANITIZATION: {
    MAX_STRING_LENGTH: 10000,
    ALLOWED_HTML_TAGS: [], // No HTML tags allowed by default
    BLOCKED_PATTERNS: [
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+=/gi,
      /<script/gi,
      /<\/script>/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<form/gi,
    ],
  },

  // Session management
  SESSION: {
    TOKEN_LENGTH: 64,
    EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 2 * 60 * 60 * 1000, // 2 hours
  },

  // CORS configuration
  CORS: {
    ALLOWED_ORIGINS: [
      process.env.NEXT_PUBLIC_SITE_URL,
      'http://localhost:3000',
      'https://localhost:3000',
    ].filter(Boolean),
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Security headers
  SECURITY_HEADERS: {
    CSP: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'https://api.supabase.co', 'wss://realtime.supabase.co'],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': [],
    },
    HSTS: {
      'max-age': 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // API security
  API_SECURITY: {
    REQUIRE_AUTH: true,
    VALIDATE_ORIGIN: true,
    CHECK_CSRF: false, // Disabled for API routes, enabled for form submissions
    LOG_REQUESTS: true,
    BLOCK_BOTS: true,
  },

  // Monitoring and logging
  MONITORING: {
    LOG_FAILED_ATTEMPTS: true,
    LOG_SUSPICIOUS_ACTIVITY: true,
    ALERT_THRESHOLD: 10, // Number of failed attempts before alerting
    LOG_RETENTION_DAYS: 30,
  },

  // Content filtering
  CONTENT_FILTER: {
    SCAN_URLS: true,
    BLOCK_MALICIOUS_DOMAINS: true,
    VALIDATE_CERTIFICATES: true,
  },

  // User agent filtering
  USER_AGENT_FILTER: {
    BLOCK_EMPTY: true,
    BLOCK_BOTS: true,
    MIN_LENGTH: 10,
    BOT_PATTERNS: [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /scanner/i,
      /curl/i,
      /wget/i,
    ],
  },
} as const

export type SecurityConfig = typeof SECURITY_CONFIG
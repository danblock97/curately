import { UAParser } from 'ua-parser-js'

/**
 * Generate a random short code for URLs
 */
export function generateShortCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Format URL by adding https:// if missing
 */
export function formatUrl(url: string): string {
  if (!url) return ''
  
  const trimmed = url.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * Parse user agent to detect device type and OS
 */
export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  return {
    device: result.device.type || 'desktop',
    os: result.os.name || 'unknown',
    browser: result.browser.name || 'unknown',
    isIOS: result.os.name === 'iOS',
    isAndroid: result.os.name === 'Android',
    isMobile: ['mobile', 'tablet'].includes(result.device.type || ''),
    isDesktop: !['mobile', 'tablet'].includes(result.device.type || '')
  }
}

/**
 * Get the appropriate redirect URL based on deeplink config and user agent
 */
export function getDeeplinkRedirectUrl(
  deeplinkConfig: {
    original_url: string
    ios_url?: string | null
    android_url?: string | null
    desktop_url?: string | null
    fallback_url?: string | null
  },
  userAgent: string
): string {
  const deviceInfo = parseUserAgent(userAgent)
  
  // Try iOS-specific URL first
  if (deviceInfo.isIOS && deeplinkConfig.ios_url) {
    return deeplinkConfig.ios_url
  }
  
  // Try Android-specific URL
  if (deviceInfo.isAndroid && deeplinkConfig.android_url) {
    return deeplinkConfig.android_url
  }
  
  // Try desktop-specific URL
  if (deviceInfo.isDesktop && deeplinkConfig.desktop_url) {
    return deeplinkConfig.desktop_url
  }
  
  // Try fallback URL
  if (deeplinkConfig.fallback_url) {
    return deeplinkConfig.fallback_url
  }
  
  // Default to original URL
  return deeplinkConfig.original_url
}

/**
 * Validate deeplink configuration
 */
export function validateDeeplinkConfig(config: {
  originalUrl: string
  iosUrl?: string
  androidUrl?: string
  desktopUrl?: string
  fallbackUrl?: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate original URL
  if (!config.originalUrl) {
    errors.push('Original URL is required')
  } else if (!isValidUrl(config.originalUrl)) {
    errors.push('Original URL is not valid')
  }
  
  // Validate optional URLs
  if (config.iosUrl && !isValidUrl(config.iosUrl)) {
    errors.push('iOS URL is not valid')
  }
  
  if (config.androidUrl && !isValidUrl(config.androidUrl)) {
    errors.push('Android URL is not valid')
  }
  
  if (config.desktopUrl && !isValidUrl(config.desktopUrl)) {
    errors.push('Desktop URL is not valid')
  }
  
  if (config.fallbackUrl && !isValidUrl(config.fallbackUrl)) {
    errors.push('Fallback URL is not valid')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate a short URL for the given short code
 */
export function generateShortUrl(shortCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/l/${shortCode}`
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

/**
 * Check if URL is likely a mobile app deep link
 */
export function isAppDeepLink(url: string): boolean {
  const appSchemes = [
    'instagram://',
    'twitter://',
    'tiktok://',
    'spotify://',
    'youtube://',
    'whatsapp://',
    'telegram://',
    'discord://',
    'slack://',
    'mailto:',
    'tel:',
    'sms:'
  ]
  
  return appSchemes.some(scheme => url.toLowerCase().startsWith(scheme))
}
import { UAParser } from 'ua-parser-js'

export interface DeeplinkConfig {
  originalUrl: string
  iosUrl?: string
  androidUrl?: string
  desktopUrl?: string
  fallbackUrl?: string
  userAgentRules?: Record<string, string>
}

export interface UserAgentInfo {
  device: string
  os: string
  browser: string
  isAndroid: boolean
  isIOS: boolean
  isMobile: boolean
  isDesktop: boolean
}

export function parseUserAgent(userAgent: string): UserAgentInfo {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const isAndroid = result.os.name?.toLowerCase().includes('android') || false
  const isIOS = result.os.name?.toLowerCase().includes('ios') || 
                result.os.name?.toLowerCase().includes('iphone') ||
                result.os.name?.toLowerCase().includes('ipad') || false
  const isMobile = result.device.type === 'mobile' || result.device.type === 'tablet'
  const isDesktop = !isMobile

  return {
    device: result.device.type || 'unknown',
    os: result.os.name || 'unknown',
    browser: result.browser.name || 'unknown',
    isAndroid,
    isIOS,
    isMobile,
    isDesktop,
  }
}

export function getDeeplinkRedirectUrl(
  config: DeeplinkConfig,
  userAgent: string
): string {
  const uaInfo = parseUserAgent(userAgent)

  // Check custom user agent rules first
  if (config.userAgentRules) {
    for (const [pattern, url] of Object.entries(config.userAgentRules)) {
      if (userAgent.toLowerCase().includes(pattern.toLowerCase())) {
        return url
      }
    }
  }

  // Platform-specific redirects
  if (uaInfo.isIOS && config.iosUrl) {
    return config.iosUrl
  }

  if (uaInfo.isAndroid && config.androidUrl) {
    return config.androidUrl
  }

  if (uaInfo.isDesktop && config.desktopUrl) {
    return config.desktopUrl
  }

  // Fallback chain
  return config.fallbackUrl || config.originalUrl
}

export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

export function getShortUrl(shortCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/l/${shortCode}`
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function formatUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}
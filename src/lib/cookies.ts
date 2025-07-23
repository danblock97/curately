// Cookie management utilities for GDPR compliance

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  functional: boolean
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  functional: false,
}

export const COOKIE_CONSENT_KEY = 'curately-cookie-consent'
export const COOKIE_PREFERENCES_KEY = 'curately-cookie-preferences'

// Get cookie consent status
export function getCookieConsent(): boolean | null {
  if (typeof window === 'undefined') return null
  
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (consent === null) return null
  return consent === 'true'
}

// Set cookie consent
export function setCookieConsent(consent: boolean): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(COOKIE_CONSENT_KEY, consent.toString())
}

// Get cookie preferences
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_COOKIE_PREFERENCES
  
  try {
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (!preferences) return DEFAULT_COOKIE_PREFERENCES
    
    return { ...DEFAULT_COOKIE_PREFERENCES, ...JSON.parse(preferences) }
  } catch {
    return DEFAULT_COOKIE_PREFERENCES
  }
}

// Set cookie preferences
export function setCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
}

// Check if specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  const consent = getCookieConsent()
  if (consent === null || consent === false) return type === 'necessary'
  
  const preferences = getCookiePreferences()
  return preferences[type]
}

// Clear all cookie data
export function clearCookieData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  localStorage.removeItem(COOKIE_PREFERENCES_KEY)
}

// Cookie utility functions for setting/getting actual cookies
export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

// Initialize analytics based on consent
export function initializeAnalytics(): void {
  if (!isCookieAllowed('analytics')) return
  
  // Google Analytics 4
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href
    })
  }
}

// Initialize functional cookies based on consent (user preferences, chat widgets, etc.)
export function initializeFunctional(): void {
  if (!isCookieAllowed('functional')) return
  
  // TODO: Add functional integrations as needed:
  // - Intercom/Zendesk chat widgets
  // - User preference storage
  // - A/B testing tools
  // - Performance monitoring tools
}
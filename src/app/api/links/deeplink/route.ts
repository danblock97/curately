import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateShortCode, formatUrl, validateDeeplinkConfig } from '@/lib/deeplink'
import { withErrorHandling, AuthError, ValidationError, createSuccessResponse } from '@/lib/error-handler'
import { validateDeeplinkData } from '@/lib/validation'
import { rateLimiters } from '@/lib/rate-limit'
import { withSecurity, sanitizeInput, sanitizeUrl, getSecureHeaders } from '@/lib/security'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'

export const POST = withErrorHandling(async (request: NextRequest, _context: { params: Promise<Record<string, string>> }) => {
  // Apply rate limiting
  const rateLimitResult = rateLimiters.linkCreation.check(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '25',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
        }
      }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new AuthError()
  }

  // Get user's profile and current links to check plan limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const { data: userLinks } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Check plan limits for deeplink creation
  if (profile && userLinks) {
    const canCreate = checkCanCreateLink(userLinks, 'deeplink', profile.tier)
    if (!canCreate.canCreate) {
      return NextResponse.json(
        { error: canCreate.reason || 'Plan limit exceeded' },
        { status: 403 }
      )
    }
  }

  const body = await request.json()
  
  // Validate request data
  const validation = validateDeeplinkData(body)
  if (!validation.success) {
    throw new ValidationError('Invalid deeplink data: ' + validation.error.issues[0].message)
  }

  const {
    title: rawTitle,
    originalUrl: rawOriginalUrl,
    iosUrl: rawIosUrl,
    androidUrl: rawAndroidUrl,
    desktopUrl: rawDesktopUrl,
    fallbackUrl: rawFallbackUrl,
    pageId,
  } = validation.data

  // Sanitize all inputs
  const title = sanitizeInput(rawTitle)
  const originalUrl = sanitizeUrl(rawOriginalUrl)
  const iosUrl = rawIosUrl ? sanitizeUrl(rawIosUrl) : undefined
  const androidUrl = rawAndroidUrl ? sanitizeUrl(rawAndroidUrl) : undefined
  const desktopUrl = rawDesktopUrl ? sanitizeUrl(rawDesktopUrl) : undefined
  const fallbackUrl = rawFallbackUrl ? sanitizeUrl(rawFallbackUrl) : undefined

  // Additional validation for deeplink configuration
  const configValidation = validateDeeplinkConfig({
    originalUrl,
    iosUrl: iosUrl || undefined,
    androidUrl: androidUrl || undefined,
    desktopUrl: desktopUrl || undefined,
    fallbackUrl: fallbackUrl || undefined,
  })

  if (!configValidation.isValid) {
    throw new ValidationError(configValidation.errors.join(', '))
  }

    // Generate unique short code
    let shortCode = generateShortCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('short_links')
        .select('id')
        .eq('short_code', shortCode)
        .single()

      if (!existing) {
        isUnique = true
      } else {
        shortCode = generateShortCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Unable to generate unique short code' },
        { status: 500 }
      )
    }

    // Get user's link count for ordering
    const { count } = await supabase
      .from('links')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Create the link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .insert({
        user_id: user.id,
        page_id: pageId,
        title,
        url: formatUrl(originalUrl),
        order: count || 0,
        link_type: 'deeplink',
        short_code: shortCode,
        is_active: true,
      })
      .select()
      .single()

    if (linkError) {
      return NextResponse.json(
        { error: 'Failed to create deeplink' },
        { status: 500 }
      )
    }

    // Create deeplink configuration
    const { error: deeplinkError } = await supabase
      .from('deeplinks')
      .insert({
        link_id: link.id,
        original_url: formatUrl(originalUrl),
        ios_url: iosUrl ? formatUrl(iosUrl) : null,
        android_url: androidUrl ? formatUrl(androidUrl) : null,
        desktop_url: desktopUrl ? formatUrl(desktopUrl) : null,
        fallback_url: fallbackUrl ? formatUrl(fallbackUrl) : null,
        user_agent_rules: null,
      })

    if (deeplinkError) {
      // Clean up the link if deeplink creation fails
      await supabase.from('links').delete().eq('id', link.id)
      return NextResponse.json(
        { error: 'Failed to create deeplink configuration' },
        { status: 500 }
      )
    }

    // Create short link entry
    await supabase
      .from('short_links')
      .insert({
        user_id: user.id,
        short_code: shortCode,
        original_url: formatUrl(originalUrl),
        link_type: 'deeplink',
      })

    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/l/${shortCode}`

  const response = createSuccessResponse({
    link,
    shortUrl,
    shortCode,
  }, 'Deeplink created successfully')

  // Add security headers
  const secureHeaders = getSecureHeaders()
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
})
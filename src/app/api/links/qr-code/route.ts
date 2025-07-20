import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQRCode, generateQRCodeSVG, getQRCodeUrl } from '@/lib/qr-code'
import { generateShortCode, formatUrl } from '@/lib/deeplink'
import { withErrorHandling, AuthError, ValidationError, createSuccessResponse } from '@/lib/error-handler'
import { validateQRCodeData } from '@/lib/validation'
import { rateLimiters } from '@/lib/rate-limit'
import { withSecurity, sanitizeInput, sanitizeUrl, getSecureHeaders } from '@/lib/security'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'

export const POST = withErrorHandling(withSecurity(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitResult = rateLimiters.qrCode.check(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
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

  // Check plan limits for QR code creation
  if (profile && userLinks) {
    const canCreate = checkCanCreateLink(userLinks, 'qr_code', profile.tier)
    if (!canCreate.canCreate) {
      return NextResponse.json(
        { error: canCreate.reason || 'Plan limit exceeded' },
        { status: 403 }
      )
    }
  }

  const body = await request.json()
  
  // Validate request data
  const validation = validateQRCodeData(body)
  if (!validation.success) {
    throw new ValidationError('Invalid QR code data: ' + validation.error.issues[0].message)
  }

  const {
    title: rawTitle,
    url: rawUrl,
    size = 200,
    errorCorrection = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    format = 'PNG',
    pageId,
  } = validation.data

  // Sanitize inputs
  const title = sanitizeInput(rawTitle)
  const url = sanitizeUrl(rawUrl)
  
  // Ensure we have a page_id - use provided or fallback to user's primary page
  let finalPageId = pageId
  if (!finalPageId) {
    const { data: primaryPage } = await supabase
      .from('pages')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()
    
    if (!primaryPage) {
      return NextResponse.json(
        { error: 'No page found. Please create a page first.' },
        { status: 400 }
      )
    }
    
    finalPageId = primaryPage.id
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

    // Generate QR code
    const shortUrl = getQRCodeUrl(shortCode)
    const qrCodeData = format === 'SVG' 
      ? await generateQRCodeSVG(shortUrl, {
          size,
          errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
          foregroundColor,
          backgroundColor,
        })
      : await generateQRCode(shortUrl, {
          size,
          errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H',
          foregroundColor,
          backgroundColor,
        })

    // Create QR code directly in qr_codes table (no links table needed)
    const { data: qrCode, error: qrCodeError } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        page_id: finalPageId,
        title,
        url: formatUrl(url),
        order_index: count || 0,
        short_code: shortCode,
        is_active: true,
        qr_code_data: qrCodeData,
        format,
        size,
        error_correction: errorCorrection,
        foreground_color: foregroundColor,
        background_color: backgroundColor,
      })
      .select()
      .single()

    if (qrCodeError) {
      console.error('QR Code creation error:', qrCodeError)
      return NextResponse.json(
        { error: 'Failed to create QR code', details: qrCodeError.message },
        { status: 500 }
      )
    }

    if (!qrCode) {
      console.error('QR Code creation returned null data')
      return NextResponse.json(
        { error: 'QR code creation failed - no data returned' },
        { status: 500 }
      )
    }

  const response = createSuccessResponse({
    qrCode: qrCode,
    shortUrl,
    shortCode,
    qrCodeData,
  }, 'QR code created successfully')

  // Add security headers
  const secureHeaders = getSecureHeaders()
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}))
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQRCode, generateQRCodeSVG, getQRCodeUrl } from '@/lib/qr-code'
import { generateShortCode, isValidUrl, formatUrl } from '@/lib/deeplink'
import { withErrorHandling, AuthError, ValidationError, createSuccessResponse } from '@/lib/error-handler'
import { validateQRCodeData } from '@/lib/validation'
import { rateLimiters } from '@/lib/rate-limit'
import { withSecurity, sanitizeInput, sanitizeUrl, getSecureHeaders } from '@/lib/security'

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
  } = validation.data

  // Sanitize inputs
  const title = sanitizeInput(rawTitle)
  const url = sanitizeUrl(rawUrl)

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

    // Create the link
    const { data: link, error: linkError } = await supabase
      .from('links')
      .insert({
        user_id: user.id,
        title,
        url: formatUrl(url),
        order: count || 0,
        link_type: 'qr_code',
        short_code: shortCode,
        is_active: true,
      })
      .select()
      .single()

    if (linkError) {
      return NextResponse.json(
        { error: 'Failed to create QR code link' },
        { status: 500 }
      )
    }

    // Create QR code configuration
    const { error: qrCodeError } = await supabase
      .from('qr_codes')
      .insert({
        link_id: link.id,
        qr_code_data: qrCodeData,
        format,
        size,
        error_correction: errorCorrection,
        foreground_color: foregroundColor,
        background_color: backgroundColor,
      })

    if (qrCodeError) {
      // Clean up the link if QR code creation fails
      await supabase.from('links').delete().eq('id', link.id)
      return NextResponse.json(
        { error: 'Failed to create QR code configuration' },
        { status: 500 }
      )
    }

    // Create short link entry
    await supabase
      .from('short_links')
      .insert({
        user_id: user.id,
        short_code: shortCode,
        original_url: formatUrl(url),
        link_type: 'qr_code',
      })

    // Fetch the complete link with QR code data
    const { data: completeLink, error: fetchError } = await supabase
      .from('links')
      .select(`
        *,
        qr_codes (
          qr_code_data,
          format,
          size,
          foreground_color,
          background_color
        )
      `)
      .eq('id', link.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch created QR code' },
        { status: 500 }
      )
    }

  const response = createSuccessResponse({
    link: completeLink,
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
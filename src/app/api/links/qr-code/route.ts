import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQRCode, generateQRCodeSVG, getQRCodeUrl } from '@/lib/qr-code'
import { generateShortCode, isValidUrl, formatUrl } from '@/lib/deeplink'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      url,
      size = 200,
      errorCorrection = 'M',
      foregroundColor = '#000000',
      backgroundColor = '#FFFFFF',
      format = 'PNG',
    } = body

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      )
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Validate size
    if (size < 50 || size > 1000) {
      return NextResponse.json(
        { error: 'Size must be between 50 and 1000' },
        { status: 400 }
      )
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

    return NextResponse.json({
      link,
      shortUrl,
      shortCode,
      qrCodeData,
    })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
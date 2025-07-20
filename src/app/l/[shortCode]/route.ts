import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDeeplinkRedirectUrl, parseUserAgent } from '@/lib/deeplink'
import { redirect } from 'next/navigation'
import { rateLimiters } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  // Apply rate limiting for API endpoints
  const rateLimitResult = rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
        }
      }
    )
  }

  try {
    const resolvedParams = await params
    const supabase = await createClient()
    const userAgent = request.headers.get('user-agent') || ''

    // First, check short_links table
    const { data: shortLink } = await supabase
      .from('short_links')
      .select('*')
      .eq('short_code', resolvedParams.shortCode)
      .eq('is_active', true)
      .single()

    if (shortLink) {
      // Increment click count
      await supabase
        .from('short_links')
        .update({ clicks: shortLink.clicks + 1 })
        .eq('id', shortLink.id)

      // Handle different link types
      if (shortLink.link_type === 'deeplink') {
        // Get deeplink config from links table
        const { data: link } = await supabase
          .from('links')
          .select(`
            *,
            deeplinks (*)
          `)
          .eq('short_code', resolvedParams.shortCode)
          .single()

        if (link?.deeplinks && Array.isArray(link.deeplinks) && link.deeplinks[0]) {
          const deeplink = link.deeplinks[0]
          const redirectUrl = getDeeplinkRedirectUrl(
            {
              original_url: deeplink.original_url,
              ios_url: deeplink.ios_url || undefined,
              android_url: deeplink.android_url || undefined,
              desktop_url: deeplink.desktop_url || undefined,
              fallback_url: deeplink.fallback_url || undefined,
            },
            userAgent
          )

          return NextResponse.redirect(redirectUrl)
        }
      }

      // For regular short links or if deeplink config not found
      return NextResponse.redirect(shortLink.original_url)
    }

    // Check if it's a link in the links table
    const { data: link } = await supabase
      .from('links')
      .select(`
        *,
        deeplinks (*)
      `)
      .eq('short_code', resolvedParams.shortCode)
      .eq('is_active', true)
      .single()

    // If not found in links, check qr_codes table
    if (!link) {
      const { data: qrCode } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('short_code', resolvedParams.shortCode)
        .eq('is_active', true)
        .single()

      if (qrCode) {
        // Increment click count for QR code
        await supabase
          .from('qr_codes')
          .update({ clicks: qrCode.clicks + 1 })
          .eq('id', qrCode.id)

        // Redirect to QR code URL
        return NextResponse.redirect(qrCode.url)
      }
    }

    if (link) {
      // Increment click count
      await supabase
        .from('links')
        .update({ clicks: link.clicks + 1 })
        .eq('id', link.id)

      // Handle different link types
      if (link.link_type === 'deeplink' && link.deeplinks && Array.isArray(link.deeplinks) && link.deeplinks[0]) {
        const deeplink = link.deeplinks[0]
        const redirectUrl = getDeeplinkRedirectUrl(
          {
            original_url: deeplink.original_url,
            ios_url: deeplink.ios_url || undefined,
            android_url: deeplink.android_url || undefined,
            desktop_url: deeplink.desktop_url || undefined,
            fallback_url: deeplink.fallback_url || undefined,
          },
          userAgent
        )

        return NextResponse.redirect(redirectUrl)
      }

      // For regular links or QR codes
      return NextResponse.redirect(link.url)
    }

    // Link not found
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Error handling redirect:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
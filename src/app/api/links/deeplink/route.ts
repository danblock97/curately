import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
      originalUrl,
      iosUrl,
      androidUrl,
      desktopUrl,
      fallbackUrl,
      userAgentRules,
    } = body

    // Validate required fields
    if (!title || !originalUrl) {
      return NextResponse.json(
        { error: 'Title and original URL are required' },
        { status: 400 }
      )
    }

    // Validate URLs
    const urls = [originalUrl, iosUrl, androidUrl, desktopUrl, fallbackUrl].filter(Boolean)
    for (const url of urls) {
      if (!isValidUrl(url)) {
        return NextResponse.json(
          { error: `Invalid URL: ${url}` },
          { status: 400 }
        )
      }
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
        user_agent_rules: userAgentRules || null,
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

    return NextResponse.json({
      link,
      shortUrl,
      shortCode,
    })
  } catch (error) {
    console.error('Error creating deeplink:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
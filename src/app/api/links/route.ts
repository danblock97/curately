import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withErrorHandling, AuthError, ValidationError, createSuccessResponse } from '@/lib/error-handler'
import { rateLimiters } from '@/lib/rate-limit'
import { withSecurity, sanitizeInput, sanitizeUrl, getSecureHeaders } from '@/lib/security'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'

export const POST = withErrorHandling(withSecurity(async (request: NextRequest) => {
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

  // Check plan limits for link creation
  if (profile && userLinks) {
    const canCreate = checkCanCreateLink(userLinks, 'link_in_bio', profile.tier)
    if (!canCreate.canCreate) {
      return NextResponse.json(
        { error: canCreate.reason || 'Plan limit exceeded' },
        { status: 403 }
      )
    }
  }

  const body = await request.json()
  
  // Basic validation
  if (!body.title || !body.url) {
    throw new ValidationError('Title and URL are required')
  }

  if (body.title.length > 100) {
    throw new ValidationError('Title cannot be longer than 100 characters')
  }

  // Sanitize inputs
  const title = sanitizeInput(body.title)
  let url = sanitizeUrl(body.url)

  // Add https if no protocol is specified
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    throw new ValidationError('Please enter a valid URL')
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
      page_id: body.pageId,
      title,
      url,
      order: body.order !== undefined ? body.order : (count || 0),
      is_active: true,
      link_type: 'link_in_bio'
    })
    .select()
    .single()

  if (linkError) {
    console.error('Link creation error:', linkError)
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    )
  }

  const response = createSuccessResponse({
    link,
  }, 'Link created successfully')

  // Add security headers
  const secureHeaders = getSecureHeaders()
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}))
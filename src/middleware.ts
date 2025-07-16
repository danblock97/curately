import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimiters } from '@/lib/rate-limit'
import { getSecureHeaders } from '@/lib/security'

export async function middleware(request: NextRequest) {
  // Apply global rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
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
  }

  // Apply auth rate limiting for auth pages
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    const rateLimitResult = rateLimiters.auth.check(request)
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
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isPublicProfile = request.nextUrl.pathname.match(/^\/[a-zA-Z0-9_]+$/)

  // If user is not signed in and trying to access dashboard, redirect to auth
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If user is signed in and trying to access auth page, redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For public profile pages, allow access regardless of auth status
  if (isPublicProfile) {
    return supabaseResponse
  }

  // Add security headers to all responses
  const secureHeaders = getSecureHeaders()
  Object.entries(secureHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
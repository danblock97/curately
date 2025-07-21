import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { username, display_name, bio, avatar_url } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validate username format (alphanumeric, dashes, underscores, 3-50 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: 'Username must be 3-50 characters long and contain only letters, numbers, underscores, or dashes' 
      }, { status: 400 })
    }

    // Get user's profile to check if they're pro
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user is on pro plan
    if (profile.tier !== 'pro') {
      return NextResponse.json({ 
        error: 'Creating additional pages requires a Pro subscription' 
      }, { status: 403 })
    }

    // Check how many pages user already has
    const { data: existingPages, error: pagesError } = await supabase
      .from('pages')
      .select('id')
      .eq('user_id', user.id)

    if (pagesError) {
      return NextResponse.json({ error: 'Failed to check existing pages' }, { status: 500 })
    }

    // Pro users can have maximum 2 pages
    if (existingPages && existingPages.length >= 2) {
      return NextResponse.json({ 
        error: 'Pro users can have a maximum of 2 pages' 
      }, { status: 400 })
    }

    // Check if username is already taken
    const { data: existingUsername, error: usernameError } = await supabase
      .from('pages')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (usernameError && usernameError.code !== 'PGRST116') { // PGRST116 is "not found" which is what we want
      return NextResponse.json({ error: 'Failed to check username availability' }, { status: 500 })
    }

    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
    }

    // Create the new page
    const { data: newPage, error: createError } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        username: username.toLowerCase(),
        page_title: display_name || username,
        page_description: bio || null,
        background_color: '#ffffff',
        is_primary: false,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create page:', createError)
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
    }

    console.log(`Created new page for user ${user.id}: ${username}`)

    return NextResponse.json({ 
      success: true, 
      page: newPage,
      message: 'Page created successfully'
    })

  } catch (error) {
    console.error('Create page error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
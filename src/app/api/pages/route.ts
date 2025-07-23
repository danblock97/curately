import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all pages for the user
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Failed to fetch pages:', error)
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
    }

    return NextResponse.json({ pages: pages || [] })

  } catch (error) {
    console.error('Get pages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
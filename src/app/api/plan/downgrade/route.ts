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

    // Get the body to understand what plan we're downgrading to
    const body = await request.json()
    const { newTier } = body

    if (newTier !== 'free') {
      return NextResponse.json({ error: 'Only downgrade to free tier is supported' }, { status: 400 })
    }

    console.log(`Processing plan downgrade for user ${user.id} to ${newTier}`)

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get all user's links
    const { data: allLinks, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }) // Oldest first, so we keep the first ones created

    if (linksError) {
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
    }

    const links = allLinks || []
    
    // Get all user's pages
    const { data: allPages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)

    if (pagesError) {
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
    }

    const pages = allPages || []
    
    // Define free tier limits
    const FREE_LIMITS = {
      maxLinks: 5,
      maxPages: 1,
      maxQrCodes: 5
    }

    const deletedItems = {
      links: 0,
      qrCodes: 0,
      pages: 0
    }

    // 1. Handle excess links (keep first 5, delete rest)
    if (links.length > FREE_LIMITS.maxLinks) {
      const linksToDelete = links.slice(FREE_LIMITS.maxLinks) // Keep first 5, delete rest
      
      console.log(`Deleting ${linksToDelete.length} excess links`)
      
      for (const link of linksToDelete) {
        const { error: deleteError } = await supabase
          .from('links')
          .delete()
          .eq('id', link.id)
        
        if (deleteError) {
          console.error(`Failed to delete link ${link.id}:`, deleteError)
        } else {
          deletedItems.links++
        }
      }
    }

    // 2. Handle excess QR codes (keep first 5, delete rest)
    const qrCodeLinks = links.filter(link => link.link_type === 'qr_code')
    if (qrCodeLinks.length > FREE_LIMITS.maxQrCodes) {
      const qrCodesToDelete = qrCodeLinks.slice(FREE_LIMITS.maxQrCodes)
      
      console.log(`Deleting ${qrCodesToDelete.length} excess QR codes`)
      
      for (const qrCode of qrCodesToDelete) {
        // Delete from QR codes table first
        const { error: qrDeleteError } = await supabase
          .from('qr_codes')
          .delete()
          .eq('link_id', qrCode.id)
        
        if (qrDeleteError) {
          console.error(`Failed to delete QR code for link ${qrCode.id}:`, qrDeleteError)
        }

        // Delete the link itself
        const { error: linkDeleteError } = await supabase
          .from('links')
          .delete()
          .eq('id', qrCode.id)
        
        if (linkDeleteError) {
          console.error(`Failed to delete QR code link ${qrCode.id}:`, linkDeleteError)
        } else {
          deletedItems.qrCodes++
        }
      }
    }

    // 3. Handle excess pages (free tier gets 1 page only)
    // For now, we assume users only have 1 page, but this is where you'd
    // handle multiple pages when that feature is implemented
    
    // 4. Reset background color to white (free tier restriction) - now in pages table
    // Update user's tier in profiles
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ tier: 'free' })
      .eq('id', user.id)
    
    if (profileUpdateError) {
      return NextResponse.json({ error: 'Failed to update user tier' }, { status: 500 })
    }

    // Reset background color to white for all user's pages (free tier restriction)
    let backgroundColorReset = false
    const pagesWithCustomBackground = pages.filter(page => page.background_color && page.background_color !== '#ffffff')
    
    if (pagesWithCustomBackground.length > 0) {
      console.log(`Resetting background color to white for ${pagesWithCustomBackground.length} pages`)
      
      // Reset background color to white for all pages
      const { error: pagesBgUpdateError } = await supabase
        .from('pages')
        .update({ background_color: '#ffffff' })
        .eq('user_id', user.id)
        .neq('background_color', '#ffffff')
      
      if (pagesBgUpdateError) {
        console.error('Failed to reset pages background color:', pagesBgUpdateError)
      } else {
        backgroundColorReset = true
      }
    }

    console.log(`Plan downgrade completed for user ${user.id}. Deleted: ${JSON.stringify(deletedItems)}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Plan downgraded successfully',
      deletedItems,
      newTier: 'free',
      backgroundColorReset: backgroundColorReset
    })

  } catch (error) {
    console.error('Plan downgrade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
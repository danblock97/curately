import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check for webhook authentication
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isWebhook = cronSecret && authHeader === `Bearer ${cronSecret}`
    
    let userId: string
    
    if (isWebhook) {
      // Webhook call - get userId from body
      const body = await request.json()
      userId = body.userId
      
      if (!userId) {
        return NextResponse.json({ error: 'User ID required for webhook call' }, { status: 400 })
      }
    } else {
      // Regular user call - get from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      userId = user.id
    }

    // Get user's current tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.tier === 'free') {
      return NextResponse.json({ error: 'Already on free plan' }, { status: 400 })
    }

    // Free plan limits
    const FREE_LIMITS = {
      maxLinks: 5,
      maxQrCodes: 5,
      maxPages: 1
    }

    let deactivatedLinks = 0
    let deactivatedQrCodes = 0

    // Get all active links, ordered by creation date (oldest first)
    const { data: activeLinks } = await supabase
      .from('links')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    // Get all active QR codes, ordered by creation date (oldest first)
    const { data: activeQrCodes } = await supabase
      .from('qr_codes')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    // Deactivate excess links (keep first 5, deactivate rest)
    if (activeLinks && activeLinks.length > FREE_LIMITS.maxLinks) {
      const excessLinks = activeLinks.slice(FREE_LIMITS.maxLinks)
      const linkIds = excessLinks.map(link => link.id)
      
      const { error: linkError } = await supabase
        .from('links')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .in('id', linkIds)

      if (linkError) {
        console.error('Error deactivating links:', linkError)
        return NextResponse.json({ error: 'Failed to deactivate links' }, { status: 500 })
      }
      
      deactivatedLinks = linkIds.length
    }

    // Deactivate excess QR codes (keep first 5, deactivate rest)
    if (activeQrCodes && activeQrCodes.length > FREE_LIMITS.maxQrCodes) {
      const excessQrCodes = activeQrCodes.slice(FREE_LIMITS.maxQrCodes)
      const qrCodeIds = excessQrCodes.map(qr => qr.id)
      
      const { error: qrError } = await supabase
        .from('qr_codes')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .in('id', qrCodeIds)

      if (qrError) {
        console.error('Error deactivating QR codes:', qrError)
        return NextResponse.json({ error: 'Failed to deactivate QR codes' }, { status: 500 })
      }
      
      deactivatedQrCodes = qrCodeIds.length
    }

    // Reset all page background colors to white (free plan restriction)
    const { error: pagesError } = await supabase
      .from('pages')
      .update({ background_color: '#ffffff' })
      .eq('user_id', userId)

    if (pagesError) {
      console.error('Error resetting background colors:', pagesError)
      return NextResponse.json({ error: 'Failed to reset background colors' }, { status: 500 })
    }

    // Update user tier to free (only if not called from webhook, as webhook already updates this)
    if (!isWebhook) {
      const { error: tierError } = await supabase
        .from('profiles')
        .update({ tier: 'free' })
        .eq('id', userId)

      if (tierError) {
        console.error('Error updating tier:', tierError)
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
      }
    }

    // Prepare response message
    let message = 'Your plan has been downgraded to Free'
    const changes = []
    
    if (deactivatedLinks > 0) {
      changes.push(`${deactivatedLinks} link${deactivatedLinks > 1 ? 's' : ''} deactivated`)
    }
    
    if (deactivatedQrCodes > 0) {
      changes.push(`${deactivatedQrCodes} QR code${deactivatedQrCodes > 1 ? 's' : ''} deactivated`)
    }
    
    changes.push('background color reset to white')
    
    if (changes.length > 0) {
      message += '. We\'ve ' + changes.join(', ') + ' to fit your new plan limits'
    }
    
    message += '. Deactivated content will be automatically deleted after 7 days of inactivity.'

    return NextResponse.json({
      success: true,
      message,
      deactivatedLinks,
      deactivatedQrCodes,
      backgroundColorReset: true
    })

  } catch (error) {
    console.error('Plan downgrade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
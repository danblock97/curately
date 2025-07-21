import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route should be called by a cron job (e.g., Vercel Cron, external service)
// to automatically delete content that has been inactive for more than 7 days
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you might want to add a proper cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)
    const cutoffISO = cutoffDate.toISOString()

    let deletedLinks = 0
    let deletedQrCodes = 0

    // Find and delete inactive links older than 7 days
    const { data: inactiveLinks } = await supabase
      .from('links')
      .select('id')
      .eq('is_active', false)
      .lt('updated_at', cutoffISO)

    if (inactiveLinks && inactiveLinks.length > 0) {
      const { error: linksDeleteError } = await supabase
        .from('links')
        .delete()
        .in('id', inactiveLinks.map(link => link.id))

      if (linksDeleteError) {
        console.error('Error deleting inactive links:', linksDeleteError)
      } else {
        deletedLinks = inactiveLinks.length
        console.log(`Deleted ${deletedLinks} inactive links`)
      }
    }

    // Find and delete inactive QR codes older than 7 days
    const { data: inactiveQrCodes } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('is_active', false)
      .lt('updated_at', cutoffISO)

    if (inactiveQrCodes && inactiveQrCodes.length > 0) {
      const { error: qrCodesDeleteError } = await supabase
        .from('qr_codes')
        .delete()
        .in('id', inactiveQrCodes.map(qr => qr.id))

      if (qrCodesDeleteError) {
        console.error('Error deleting inactive QR codes:', qrCodesDeleteError)
      } else {
        deletedQrCodes = inactiveQrCodes.length
        console.log(`Deleted ${deletedQrCodes} inactive QR codes`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      deletedLinks,
      deletedQrCodes,
      cutoffDate: cutoffISO
    })

  } catch (error) {
    console.error('Cleanup cron job error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Allow GET requests for testing purposes
export async function GET(request: NextRequest) {
  // For testing - you might want to remove this in production
  return POST(request)
}
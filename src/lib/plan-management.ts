import { toast } from 'sonner'

interface DowngradeResult {
  success: boolean
  deletedItems?: {
    links: number
    qrCodes: number
    pages: number
  }
  error?: string
}

/**
 * Handles plan downgrade from pro to free tier
 * Automatically removes excess links, QR codes, and pages to fit free tier limits
 */
export async function handlePlanDowngrade(): Promise<DowngradeResult> {
  try {
    const response = await fetch('/api/plan/downgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newTier: 'free' }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to downgrade plan')
    }

    const { deletedItems, backgroundColorReset } = data

    // Show user-friendly notifications about what was removed/changed
    let message = 'Your plan has been downgraded to Free.'
    
    const changes = []
    
    if (deletedItems.links > 0 || deletedItems.qrCodes > 0) {
      const deletedParts = []
      if (deletedItems.links > 0) {
        deletedParts.push(`${deletedItems.links} link${deletedItems.links > 1 ? 's' : ''}`)
      }
      if (deletedItems.qrCodes > 0) {
        deletedParts.push(`${deletedItems.qrCodes} QR code${deletedItems.qrCodes > 1 ? 's' : ''}`)
      }
      changes.push(`removed ${deletedParts.join(' and ')}`)
    }

    if (backgroundColorReset) {
      changes.push('reset your background color to white and removed background images')
    }
    
    if (changes.length > 0) {
      message += ` We've ${changes.join(' and ')} to fit your new plan limits.`
    }

    toast.success(message)

    return {
      success: true,
      deletedItems
    }

  } catch (error) {
    console.error('Plan downgrade error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to downgrade plan'
    
    toast.error(`Plan downgrade failed: ${errorMessage}`)
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Check if user needs plan downgrade and show warning
 */
export function checkPlanDowngradeNeeded(
  currentTier: 'free' | 'pro',
  linksCount: number,
  qrCodesCount: number,
  pagesCount: number = 1
): {
  needsDowngrade: boolean
  excessItems: {
    links: number
    qrCodes: number
    pages: number
  }
} {
  if (currentTier === 'free') {
    return {
      needsDowngrade: false,
      excessItems: { links: 0, qrCodes: 0, pages: 0 }
    }
  }

  const FREE_LIMITS = {
    maxLinks: 5,
    maxQrCodes: 5,
    maxPages: 1
  }

  const excessItems = {
    links: Math.max(0, linksCount - FREE_LIMITS.maxLinks),
    qrCodes: Math.max(0, qrCodesCount - FREE_LIMITS.maxQrCodes),
    pages: Math.max(0, pagesCount - FREE_LIMITS.maxPages)
  }

  const needsDowngrade = excessItems.links > 0 || excessItems.qrCodes > 0 || excessItems.pages > 0

  return {
    needsDowngrade,
    excessItems
  }
}

/**
 * Show warning dialog before plan downgrade
 */
export function showPlanDowngradeWarning(excessItems: { links: number; qrCodes: number; pages: number }) {
  const itemsToRemove = []
  
  if (excessItems.links > 0) {
    itemsToRemove.push(`${excessItems.links} link${excessItems.links > 1 ? 's' : ''}`)
  }
  if (excessItems.qrCodes > 0) {
    itemsToRemove.push(`${excessItems.qrCodes} QR code${excessItems.qrCodes > 1 ? 's' : ''}`)
  }
  if (excessItems.pages > 0) {
    itemsToRemove.push(`${excessItems.pages} page${excessItems.pages > 1 ? 's' : ''}`)
  }

  const message = `Downgrading to Free will remove ${itemsToRemove.join(', ')} to fit the plan limits. This action cannot be undone.`
  
  return confirm(message)
}
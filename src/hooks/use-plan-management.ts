import { useState } from 'react'
import { handlePlanDowngrade, checkPlanDowngradeNeeded, showPlanDowngradeWarning } from '@/lib/plan-management'
import { Database } from '@/lib/supabase/types'

type Link = Database['public']['Tables']['links']['Row']
type UserTier = Database['public']['Enums']['user_tier']

export function usePlanManagement() {
  const [isDowngrading, setIsDowngrading] = useState(false)

  /**
   * Safely downgrade user plan with confirmation and automatic cleanup
   */
  const downgradePlan = async (
    links: Link[],
    currentTier: UserTier,
    onSuccess?: () => void
  ) => {
    try {
      setIsDowngrading(true)

      const linksCount = links.length
      const qrCodesCount = links.filter(link => link.link_type === 'qr_code').length
      const pagesCount = 1 // Current assumption - will be dynamic when multi-page feature is added

      // Check what needs to be removed
      const { needsDowngrade, excessItems } = checkPlanDowngradeNeeded(
        currentTier,
        linksCount,
        qrCodesCount,
        pagesCount
      )

      // If nothing needs to be removed, just show confirmation
      if (!needsDowngrade) {
        const confirmed = confirm('Are you sure you want to downgrade to the Free plan?')
        if (!confirmed) return
      } else {
        // Show warning about items that will be removed
        const confirmed = showPlanDowngradeWarning(excessItems)
        if (!confirmed) return
      }

      // Perform the downgrade
      const result = await handlePlanDowngrade()

      if (result.success) {
        // Call success callback (typically to refresh user data)
        onSuccess?.()
      }

      return result

    } catch (error) {
      console.error('Plan downgrade failed:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsDowngrading(false)
    }
  }

  /**
   * Check if user would lose data when downgrading
   */
  const checkDowngradeImpact = (
    links: Link[],
    currentTier: UserTier
  ) => {
    if (currentTier === 'free') return null

    const linksCount = links.length
    const qrCodesCount = links.filter(link => link.link_type === 'qr_code').length
    const pagesCount = 1

    return checkPlanDowngradeNeeded(currentTier, linksCount, qrCodesCount, pagesCount)
  }

  return {
    downgradePlan,
    checkDowngradeImpact,
    isDowngrading
  }
}
import { useMemo } from 'react'
import { Database } from '@/lib/supabase/types'

type Link = Database['public']['Tables']['links']['Row']
type UserTier = Database['public']['Enums']['user_tier']

interface PlanLimits {
  maxLinks: number
  maxPages: number
  maxQrCodes: number
  analyticsRetentionDays: number
  unlimitedClicks: boolean
  advancedAnalytics: boolean
  advancedQrCustomization: boolean
  prioritySupport: boolean
}

const PLAN_LIMITS: Record<UserTier, PlanLimits> = {
  free: {
    maxLinks: 5,
    maxPages: 1,
    maxQrCodes: 5,
    analyticsRetentionDays: 30,
    unlimitedClicks: true,
    advancedAnalytics: false,
    advancedQrCustomization: false,
    prioritySupport: false
  },
  pro: {
    maxLinks: 50,
    maxPages: 2,
    maxQrCodes: 50,
    analyticsRetentionDays: -1, // -1 means forever
    unlimitedClicks: true,
    advancedAnalytics: true,
    advancedQrCustomization: true,
    prioritySupport: true
  }
}

export interface PlanUsage {
  tier: UserTier
  links: {
    current: number
    limit: number
    canCreate: boolean
    remainingCount: number
  }
  pages: {
    current: number
    limit: number
    canCreate: boolean
    remainingCount: number
  }
  qrCodes: {
    current: number
    limit: number
    canCreate: boolean
    remainingCount: number
  }
  analytics: {
    retentionDays: number
    advanced: boolean
  }
  clicks: {
    unlimited: boolean
  }
  features: {
    advancedQrCustomization: boolean
    prioritySupport: boolean
  }
}

export function usePlanLimits(links: Link[] = [], currentPlan: UserTier = 'free', pagesCount: number = 1, qrCodes: any[] = []): PlanUsage {
  const limits = useMemo(() => {
    return PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free
  }, [currentPlan])

  const usage = useMemo(() => {
    // Only count active links and QR codes towards limits
    const qrCodesCount = qrCodes.filter(qr => qr.is_active !== false).length
    const linksCount = links.filter(link => link.is_active !== false).length

    return {
      tier: currentPlan,
      links: {
        current: linksCount,
        limit: limits.maxLinks,
        canCreate: linksCount < limits.maxLinks,
        remainingCount: Math.max(0, limits.maxLinks - linksCount)
      },
      pages: {
        current: pagesCount,
        limit: limits.maxPages,
        canCreate: pagesCount < limits.maxPages,
        remainingCount: Math.max(0, limits.maxPages - pagesCount)
      },
      qrCodes: {
        current: qrCodesCount,
        limit: limits.maxQrCodes,
        canCreate: qrCodesCount < limits.maxQrCodes,
        remainingCount: Math.max(0, limits.maxQrCodes - qrCodesCount)
      },
      analytics: {
        retentionDays: limits.analyticsRetentionDays,
        advanced: limits.advancedAnalytics
      },
      clicks: {
        unlimited: limits.unlimitedClicks
      },
      features: {
        advancedQrCustomization: limits.advancedQrCustomization,
        prioritySupport: limits.prioritySupport
      }
    }
  }, [links, limits, currentPlan, pagesCount])

  return usage
}

export function checkCanCreateLink(
  links: Link[], 
  linkType: 'link_in_bio' | 'deeplink' | 'qr_code' = 'link_in_bio',
  currentPlan: UserTier = 'free',
  qrCodes: any[] = []
): {
  canCreate: boolean
  reason?: string
  limit?: number
  current?: number
} {
  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free
  // Only count active links and QR codes towards limits
  const qrCodesCount = qrCodes.filter(qr => qr.is_active !== false).length
  const linksCount = links.filter(link => link.is_active !== false).length
  
  const usage = {
    links: {
      current: linksCount,
      limit: limits.maxLinks,
      canCreate: linksCount < limits.maxLinks,
      remainingCount: Math.max(0, limits.maxLinks - linksCount)
    },
    qrCodes: {
      current: qrCodesCount,
      limit: limits.maxQrCodes,
      canCreate: qrCodesCount < limits.maxQrCodes,
      remainingCount: Math.max(0, limits.maxQrCodes - qrCodesCount)
    }
  }

  // For QR codes, only check QR code specific limit
  if (linkType === 'qr_code') {
    if (!usage.qrCodes.canCreate) {
      return {
        canCreate: false,
        reason: `You've reached the maximum number of QR codes (${usage.qrCodes.limit}) for your ${currentPlan} plan.`,
        limit: usage.qrCodes.limit,
        current: usage.qrCodes.current
      }
    }
    return { canCreate: true }
  }

  // For regular links, check general link limit
  if (!usage.links.canCreate) {
    return {
      canCreate: false,
      reason: `You've reached the maximum number of links (${usage.links.limit}) for your ${currentPlan} plan.`,
      limit: usage.links.limit,
      current: usage.links.current
    }
  }

  return { canCreate: true }
}
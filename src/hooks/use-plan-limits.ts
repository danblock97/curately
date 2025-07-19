import { useMemo } from 'react'
import { Database } from '@/lib/supabase/types'

type Link = Database['public']['Tables']['links']['Row']

interface PlanLimits {
  maxLinks: number
  maxPages: number
  maxQrCodes: number
  analyticsRetentionDays: number
  unlimitedClicks: boolean
}

const FREE_PLAN_LIMITS: PlanLimits = {
  maxLinks: 5,
  maxPages: 1,
  maxQrCodes: 5,
  analyticsRetentionDays: 30,
  unlimitedClicks: true
}

export interface PlanUsage {
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
  }
  clicks: {
    unlimited: boolean
  }
}

export function usePlanLimits(links: Link[] = [], currentPlan: string = 'free'): PlanUsage {
  const limits = useMemo(() => {
    switch (currentPlan) {
      case 'free':
      default:
        return FREE_PLAN_LIMITS
    }
  }, [currentPlan])

  const usage = useMemo(() => {
    const linksCount = links.length
    const qrCodesCount = links.filter(link => link.link_type === 'qr_code').length
    const pagesCount = 1 // Assuming each user has 1 page for now

    return {
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
        retentionDays: limits.analyticsRetentionDays
      },
      clicks: {
        unlimited: limits.unlimitedClicks
      }
    }
  }, [links, limits])

  return usage
}

export function checkCanCreateLink(links: Link[], linkType: 'link_in_bio' | 'deeplink' | 'qr_code' = 'link_in_bio'): {
  canCreate: boolean
  reason?: string
  limit?: number
  current?: number
} {
  const limits = FREE_PLAN_LIMITS
  const linksCount = links.length
  const qrCodesCount = links.filter(link => link.link_type === 'qr_code').length
  
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

  // Check general link limit
  if (!usage.links.canCreate) {
    return {
      canCreate: false,
      reason: `You've reached the maximum number of links (${usage.links.limit}) for your free plan.`,
      limit: usage.links.limit,
      current: usage.links.current
    }
  }

  // Check QR code specific limit
  if (linkType === 'qr_code' && !usage.qrCodes.canCreate) {
    return {
      canCreate: false,
      reason: `You've reached the maximum number of QR codes (${usage.qrCodes.limit}) for your free plan.`,
      limit: usage.qrCodes.limit,
      current: usage.qrCodes.current
    }
  }

  return { canCreate: true }
}
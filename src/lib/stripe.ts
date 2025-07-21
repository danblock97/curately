import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'gbp',
  plans: {
    free: {
      name: 'Free',
      features: {
        maxLinks: 5,
        maxQrCodes: 5, 
        maxPages: 1,
        analyticsRetentionDays: 30,
        customBackgrounds: false,
        advancedQr: false,
        prioritySupport: false
      }
    },
    pro: {
      name: 'Pro',
      priceIds: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      },
      features: {
        maxLinks: 50,
        maxQrCodes: 50,
        maxPages: 2, 
        analyticsRetentionDays: -1, // Forever
        customBackgrounds: true,
        advancedQr: true,
        prioritySupport: true
      }
    }
  }
} as const

export type StripePlan = keyof typeof STRIPE_CONFIG.plans
export type BillingInterval = 'monthly' | 'annual'
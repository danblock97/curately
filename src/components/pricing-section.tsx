'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap } from 'lucide-react'

interface PricingSectionProps {
  showUpgradeButtons?: boolean
  currentTier?: 'free' | 'pro'
}

export function PricingSection({ showUpgradeButtons = false, currentTier }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Checkout error:', error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Customer portal error:', error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Billing management error:', error)
    }
  }

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: { monthly: 0, annual: 0 },
      priceIds: { monthly: null, annual: null },
      features: [
        '5 Links',
        '5 QR Codes',
        '1 Page',
        'Basic Analytics (30 days)',
        'Standard Support',
        'White Background Only'
      ],
      popular: false,
      tier: 'free' as const
    },
    {
      name: 'Pro',
      description: 'Everything you need to scale',
      price: { monthly: 10, annual: 100 },
      priceIds: { 
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
        annual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
      },
      features: [
        '50 Links',
        '50 QR Codes', 
        '2 Pages',
        'Advanced Analytics (Forever)',
        'Priority Support',
        'Custom Backgrounds',
        'Advanced QR Customization'
      ],
      popular: true,
      tier: 'pro' as const
    }
  ]

  const annualDiscount = Math.round((1 - (100 / (10 * 12))) * 100) // 17% discount

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose the plan that's right for you. Start free, upgrade anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-gray-400'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">
                Save {annualDiscount}%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-2 border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-purple-500/10 backdrop-blur-sm'
                  : 'border border-white/20 bg-white/5 backdrop-blur-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  {plan.popular && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                </div>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      £{plan.price[billingCycle]}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-gray-400">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'annual' && plan.price.annual > 0 && (
                    <p className="text-sm text-green-400 mt-1">
                      Save £{(plan.price.monthly * 12) - plan.price.annual} per year
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {showUpgradeButtons ? (
                    currentTier === plan.tier ? (
                      <Button disabled className="w-full bg-gray-600 text-gray-300">
                        Current Plan
                      </Button>
                    ) : plan.tier === 'free' && currentTier === 'pro' ? (
                      <Button
                        variant="outline"
                        onClick={handleManageBilling}
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Downgrade to Free
                      </Button>
                    ) : plan.tier === 'pro' ? (
                      plan.priceIds[billingCycle] ? (
                        <Button
                          onClick={() => handleUpgrade(plan.priceIds[billingCycle]!)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            alert('Stripe integration not fully configured yet. Please check your price IDs in environment variables.')
                            console.error('Missing price ID for:', billingCycle, 'Available IDs:', plan.priceIds)
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Setup Required
                        </Button>
                      )
                    ) : (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    )
                  ) : (
                    <Button
                      asChild
                      className={
                        plan.popular
                          ? "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                          : "w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }
                    >
                      <a href="/auth">
                        {plan.name === 'Free' ? 'Get Started Free' : 'Start Free, Upgrade Later'}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            All plans include SSL certificates, 99.9% uptime, and email support.
          </p>
        </div>
      </div>
    </section>
  )
}
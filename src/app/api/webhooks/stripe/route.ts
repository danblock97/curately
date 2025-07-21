import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log('🚀 WEBHOOK ENDPOINT HIT!')
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')!
    console.log('🔐 Signature exists:', !!signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Use service role client for webhook operations (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🔔 Webhook received:', event.type, 'Event ID:', event.id)

    switch (event.type) {
      case 'checkout.session.completed': {
        try {
          console.log('📝 Processing checkout.session.completed')
          const session = event.data.object as Stripe.Checkout.Session
          console.log('📋 Session details:', {
            id: session.id,
            mode: session.mode,
            customer: session.customer,
            subscription: session.subscription,
            metadata: session.metadata
          })
          
          if (session.mode === 'subscription') {
            const subscriptionId = session.subscription as string
            const customerId = session.customer as string
            const userId = session.metadata?.userId

            console.log('🔍 Extracted data:', { subscriptionId, customerId, userId })

            // Get the subscription to check its status
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            console.log('📊 Subscription status:', subscription.status)

            // First try to find profile by customer ID (more reliable)
            let profileQuery = supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            const { data: existingProfile, error: profileError } = await profileQuery

            let targetUserId: string | null = null

            if (existingProfile) {
              // Profile exists with this customer ID
              targetUserId = existingProfile.id
              console.log('✅ Found existing profile by customer ID:', targetUserId)
            } else if (userId) {
              // Fallback to userId from metadata (for new customers)
              targetUserId = userId
              console.log('🔄 Using userId from metadata:', targetUserId)
            } else {
              console.error('❌ Could not determine user ID for customer:', customerId)
              break
            }

            // Update user profile
            console.log('🔄 Attempting database update with:', {
              tier: 'pro',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscription.status,
              userId: targetUserId
            })

            // First check if the profile actually exists
            const { data: checkProfile, error: checkError } = await supabase
              .from('profiles')
              .select('id, tier, stripe_customer_id')
              .eq('id', targetUserId)
              .single()

            console.log('🔍 Profile check before update:', { checkProfile, checkError })

            const { data, error, count } = await supabase
              .from('profiles')
              .update({
                tier: 'pro',
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: subscription.status,
              })
              .eq('id', targetUserId)
              .select()

            console.log('📊 Database update result:', { data, error, count })

            if (error) {
              console.error('❌ Error updating profile after checkout:', error)
            } else {
              console.log(`✅ User ${userId} upgraded to Pro with subscription ${subscriptionId}`)
              console.log('📋 Updated profile data:', data)
            }
          } else {
            console.log('⚠️ Session mode is not subscription:', session.mode)
          }
        } catch (error) {
          console.error('💥 Error in checkout.session.completed handler:', error)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found for customer:', customerId)
          break
        }

        // Determine tier based on subscription status
        const tier = ['active', 'trialing'].includes(subscription.status) ? 'pro' : 'free'

        // Update subscription status and tier
        const { error } = await supabase
          .from('profiles')
          .update({
            tier,
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log(`Updated user ${profile.id} subscription status to ${subscription.status}`)
          
          // If subscription became inactive, trigger downgrade process
          if (tier === 'free') {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plan/downgrade`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: profile.id }),
              })
              console.log(`Triggered downgrade process for user ${profile.id}`)
            } catch (downgradeError) {
              console.error('Error triggering downgrade:', downgradeError)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found for customer:', customerId)
          break
        }

        // Downgrade user to free tier
        const { error } = await supabase
          .from('profiles')
          .update({
            tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Error downgrading user:', error)
        } else {
          console.log(`Downgraded user ${profile.id} to free tier`)
          
          // Trigger downgrade process to deactivate excess content
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plan/downgrade`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: profile.id }),
            })
            console.log(`Triggered downgrade process for user ${profile.id}`)
          } catch (downgradeError) {
            console.error('Error triggering downgrade:', downgradeError)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user by customer ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found for customer:', customerId)
          break
        }

        // Update subscription status to past_due
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('id', profile.id)

        if (error) {
          console.error('Error updating payment failed status:', error)
        } else {
          console.log(`Updated user ${profile.id} status to past_due`)
        }
        break
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
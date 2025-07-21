import { createClient } from '@/lib/supabase/server'
import { PricingSection } from '@/components/pricing-section'
import { Navbar } from '@/components/navbar'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentTier: 'free' | 'pro' | undefined = undefined

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    currentTier = profile?.tier
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Page Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start free and upgrade when you're ready to unlock more features and grow your link-in-bio presence.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection 
        showUpgradeButtons={!!user} 
        currentTier={currentTier}
      />

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I upgrade or downgrade at any time?
              </h3>
              <p className="text-gray-300">
                Yes! You can upgrade to Pro or downgrade to Free at any time. When downgrading, excess content will be deactivated (not deleted) and can be reactivated if you upgrade again.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What happens to my content if I downgrade?
              </h3>
              <p className="text-gray-300">
                Your first 5 links and 5 QR codes remain active. Additional content is deactivated but saved for 7 days, allowing you to reactivate it if you upgrade again or manually delete what you don't need.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How does billing work for the annual plan?
              </h3>
              <p className="text-gray-300">
                The annual plan is billed once per year at £100, saving you £20 compared to monthly billing (17% discount). You can cancel anytime and use the service until your billing period ends.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free trial for Pro?
              </h3>
              <p className="text-gray-300">
                Since we offer a generous free plan with 5 links and 5 QR codes, we don't offer a separate trial. You can start with the free plan and upgrade when you need more features.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I cancel my Pro subscription?
              </h3>
              <p className="text-gray-300">
                Yes, you can cancel anytime from your account settings. You'll continue to have Pro features until the end of your current billing period, then automatically downgrade to the free plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who trust Curately for their link-in-bio needs.
          </p>
          {!user && (
            <a
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Create Free Account
            </a>
          )}
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Pricing - Curately | Link-in-Bio Plans',
    description: 'Choose the perfect plan for your link-in-bio needs. Start free with 5 links and 5 QR codes, or upgrade to Pro for unlimited features and advanced analytics.',
    openGraph: {
      title: 'Pricing - Curately',
      description: 'Start free, upgrade when ready. Simple pricing for powerful link-in-bio tools.',
    },
  }
}
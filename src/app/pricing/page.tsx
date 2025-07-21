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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Page Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How does the split-screen layout work?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your Curately page displays your profile on the left (with your photo, name, and bio) while your widgets appear on the right side. You can drag and drop widgets anywhere on the right panel, including social media widgets, link buttons, QR codes, and text blocks.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What's the difference between links, deeplinks, and QR codes?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Links</strong> are regular web links that take users to any website. <strong>Deeplinks</strong> are smart links that detect the user's device and automatically redirect to the iOS App Store, Google Play, or a web fallback. <strong>QR codes</strong> can be customized with your logo and downloaded for print materials.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Can I use my own custom domain?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Currently, all pages use the format curately.co.uk/yourname. Custom domains are on our roadmap for future updates. Your curately.co.uk link works perfectly for social media bios and is short enough for easy sharing.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What analytics do I get with my links?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The free plan includes basic analytics for 30 days (click counts and top links). Pro users get advanced analytics forever, including detailed charts, geographic data, referrer tracking, and performance insights for all your links and QR codes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How do I customize the appearance of my page?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pro users can customize background colors, themes, and widget styles. Free users get the clean white background. All users can upload their own profile photo and customize their bio text to match their brand.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What happens if I hit my limits on the free plan?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                When you reach 5 links or 5 QR codes, you'll be prompted to upgrade to Pro or delete existing items to make room for new ones. Your existing content stays active and functional - you just can't add more until you upgrade or make space.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Can I downgrade from Pro to Free anytime?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! When downgrading, your first 5 links and 5 QR codes stay active. Additional content becomes inactive (but isn't deleted). You can reactivate everything by upgrading again, or manually choose which items to keep active.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust Curately for their link-in-bio needs.
          </p>
          {!user && (
            <a
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
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
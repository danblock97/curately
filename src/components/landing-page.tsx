import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { DeviceMockups } from '@/components/device-mockups'
import { ThreeWaysSection } from '@/components/three-ways-section'
import { FeaturesTimeline } from '@/components/features-timeline'
import { AnalyticsSection } from '@/components/analytics-section'
import { AdvantagesSection } from '@/components/advantages-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { AnimatedGridBackground } from '@/components/ui/animated-grid-background'

export function LandingPage() {
  return (
    <AnimatedGridBackground className="min-h-screen w-full bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              An all-in-one solution to manage all your links.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create the best Links in bio, deeplinks, and QR Codes with Curately
            </p>
            
            <div className="mb-16">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 px-12 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link href="/auth">Create an account</Link>
              </Button>
              <p className="text-base text-gray-400 mt-4 font-medium">(It's free)</p>
            </div>

            {/* Enhanced Social Proof */}
            <div className="mb-20">
              <p className="text-xl text-gray-200 mb-6 font-medium">
                Join the link-in-bio revolution
              </p>
              <div className="flex justify-center items-center flex-wrap gap-8 text-base text-gray-300">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="font-medium">Simple setup</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="font-medium">No limits</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="font-medium">Always free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Demo Area */}
          <div className="relative flex justify-center">
            <div className="relative z-10">
              <DeviceMockups />
            </div>
            {/* Background decoration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-40 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Ways Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <ThreeWaysSection />
        </div>
      </section>

      {/* Features Timeline */}
      <FeaturesTimeline />

      {/* Analytics Section */}
      <AnalyticsSection />

      {/* Advantages Section */}
      <AdvantagesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </AnimatedGridBackground>
  )
}
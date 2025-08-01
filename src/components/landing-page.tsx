'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { ThreeWaysSection } from '@/components/three-ways-section'
import { FeaturesTimeline } from '@/components/features-timeline'
import { AnalyticsSection } from '@/components/analytics-section'
import { AdvantagesSection } from '@/components/advantages-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ display_name?: string } | null>(null)
  const supabase = createClient()

  // Check authentication status on mount and listen for auth changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setIsAuthenticated(true)
          setUser(user)
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single()
          
          setProfile(profile)
        } else {
          setIsAuthenticated(false)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
        setUser(null)
        setProfile(null)
      }
    }
    
    checkAuth()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true)
        setUser(session.user)
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profile)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
        setProfile(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Create Your Perfect
            <br />
            Link in Bio — Effortlessly
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Curately helps you create beautiful, customizable link pages that showcase everything important to your audience in one place.
          </p>
          
          <div className="pt-4 relative">
            {isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-200 group" 
                  asChild
                >
                  <Link href="/dashboard">
                    Open Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">Welcome back, {profile?.display_name || user?.email}!</p>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-200" 
                  asChild
                >
                  <Link href="/auth">Start Creating Free</Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">No credit card required</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Product Demo Area */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full flex justify-center">
            <div className="relative transition-transform duration-500 ease-out" style={{ transform: 'perspective(1000px) rotateX(15deg)', transformStyle: 'preserve-3d' }}>
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/dashboard.png"
                  alt="Curately Dashboard"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
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
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
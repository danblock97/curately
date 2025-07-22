'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === '/'
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
            .select('display_name, avatar_url')
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
      } finally {
        setLoading(false)
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
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profile)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Curately Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">Curately</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Curately Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">Curately</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white group">
                <Link href="/dashboard">
                  Open Curately
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
                  <Link href="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white w-full">
                    <Link href="/dashboard">Open Curately</Link>
                  </Button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white w-full">
                      <Link href="/auth">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
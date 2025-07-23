'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Github, Mail, ArrowRight, Sparkles, Zap, Link2 } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check for error in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      toast.error(decodeURIComponent(error))
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback?next=/dashboard`
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        setEmailSent(true)
        toast.success('Magic link sent! Check your email.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback?next=/dashboard`
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        if (error.message.includes('rate limit')) {
          toast.error('Too many login attempts. Please wait a moment and try again.')
        } else {
          toast.error(error.message)
        }
      }
    } catch (error) {
      console.error('OAuth catch error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-white"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!emailSent ? (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900">
                    Welcome to Curately
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Create your personalized link-in-bio page in minutes
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Beautiful, customizable profiles</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Real-time analytics & insights</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm">Unlimited links & integrations</span>
                </div>
              </div>

              {/* Auth Form */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-lg">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Mail className="w-5 h-5 mr-2" />
                    )}
                    Get Started with Email
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthLogin('github')}
                    disabled={isLoading}
                    className="h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                    className="h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-gray-600 hover:text-gray-700 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-gray-600 hover:text-gray-700 transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          ) : (
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                <p className="text-gray-600">
                  We&apos;ve sent a magic link to{' '}
                  <span className="text-gray-900 font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Click the link in your email to get started with Curately
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="w-full h-12 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Try a different email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
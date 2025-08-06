'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Clock, Users, ArrowRight, CheckCircle, Globe, Bug, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [userTier, setUserTier] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUserTier = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tier')
            .eq('id', user.id)
            .single()
          
          setUserTier(profile?.tier || 'free')
        } else {
          setUserTier('free')
        }
      } catch (error) {
        console.error('Error checking user tier:', error)
        setUserTier('free')
      } finally {
        setIsLoading(false)
      }
    }

    checkUserTier()
  }, [supabase])
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-0 px-4 py-2 text-sm font-medium">
            CONTACT US
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            We&apos;d love to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">hear from you</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Have a question, suggestion, or need help? Our team is here to support you every step of the way.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600 font-medium">Personal support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-gray-600 font-medium">Built by creators, for creators</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Contact Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* GitHub Issues Card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Submit an Issue
                    </h2>
                    <p className="text-gray-600">Report bugs or request features on GitHub</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6">
                  <p className="text-gray-600 mb-8 text-center">
                    Help us improve Curately! Submit bug reports, feature requests, or any feedback through our GitHub repository.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="https://github.com/danblock97/curately/issues/new?template=bug_report.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                      <Bug className="w-5 h-5 mr-2" />
                      Report Bug
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a 
                      href="https://github.com/danblock97/curately/issues/new?template=feature_request.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Request Feature
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                  <div className="mt-6 text-center">
                    <a 
                      href="https://github.com/danblock97/curately/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium group"
                    >
                      View all issues
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Discord Card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Join Our Community
                    </h2>
                    <p className="text-gray-600">Connect with other users and get real-time support</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 mb-6">
                    Join our Discord community for real-time support, feature discussions, and to connect with other Curately users.
                  </p>
                  <a 
                    href="https://discord.gg/X2yQ6mpBSc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                  >
                    Join Discord Server
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Other ways to reach us
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose the method that works best for you. We&apos;re here to help!
                </p>
              </div>

              <Card className="border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300">
                      <Mail className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Discord Support</h4>
                      <p className="text-gray-600 text-sm mb-3">For general inquiries and real-time support</p>
                      <a href="https://discord.gg/X2yQ6mpBSc" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center group">
                        Join our Discord
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-gray-700 group-hover:to-gray-900 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">GitHub Issues</h4>
                      <p className="text-gray-600 text-sm mb-3">Submit bugs, feature requests, and feedback</p>
                      <a href="https://github.com/danblock97/curately/issues" target="_blank" rel="noopener noreferrer" className="text-gray-700 font-semibold hover:text-gray-900 inline-flex items-center group">
                        View Issues
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>


              <Card className="border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300">
                      <Clock className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Response Times</h4>
                      <p className="text-gray-600 text-sm mb-3">We&apos;re committed to helping you quickly</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          <span className="text-sm text-gray-700"><span className="font-semibold text-purple-600">Pro:</span> Within 4 hours</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700"><span className="font-semibold">Free:</span> Within 24 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

{!isLoading && (
                userTier === 'pro' ? (
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-gray-900">Priority Support</h4>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-2 py-0.5">
                              ACTIVE
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">You have priority support! Expect responses within 4 hours.</p>
                          <div className="inline-flex items-center text-green-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            You&apos;re all set!
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-20"></div>
                  </Card>
                ) : (
                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-bold text-gray-900">Priority Support</h4>
                            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 text-xs px-2 py-0.5">
                              PRO
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">Get lightning-fast responses and dedicated help</p>
                          <Link href="/pricing" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm group">
                            Upgrade to Pro
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full opacity-20"></div>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-gray-600 border border-gray-200">
              QUICK ANSWERS
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600">
              Looking for quick answers? Check out our most frequently asked questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How do I upgrade to Pro?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      You can upgrade anytime from your dashboard or visit our pricing page to choose between monthly and annual plans.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Can I cancel my subscription?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Yes! You can cancel anytime from your account settings. You&apos;ll continue to have Pro features until the end of your current billing period, then automatically downgrade to the free plan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500 transition-colors duration-300">
                    <Globe className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How do I customize my page?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pro users can customize backgrounds, themes, and widget styles from their dashboard settings. Free users can customize their profile and bio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-500 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Is my data secure?
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Absolutely! We use industry-standard encryption and security practices to protect your data and maintain 99.9% uptime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg inline-block">
              <p className="text-gray-600 mb-4">
                Still have questions?
              </p>
              <Link href="/pricing" className="inline-flex items-center text-gray-900 font-semibold hover:text-blue-600 transition-colors group">
                View our full FAQ
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


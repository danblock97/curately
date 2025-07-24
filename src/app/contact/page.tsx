'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageCircle, Clock, Users, ArrowRight, CheckCircle, Globe, Bug } from 'lucide-react'
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
              {/* Notion Form Card */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Contact Form
                    </h2>
                    <p className="text-gray-600">Submit your questions, feedback, or support requests</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-600 mb-6">
                    Use our contact form to send us your questions, feedback, or support requests. We&apos;ll get back to you as soon as possible.
                  </p>
                  <a 
                    href="https://roomy-pick-4e2.notion.site/23905d85e5838176bfc2df81a22881c0?pvs=105" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
                  >
                    Open Contact Form
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
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

              <Card className="border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300">
                      <Bug className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Bug Reports & Feature Requests</h4>
                      <p className="text-gray-600 text-sm mb-3">Submit bugs and suggest new features</p>
                      <a href="https://roomy-pick-4e2.notion.site/23905d85e5838176bfc2df81a22881c0?pvs=105" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-semibold hover:text-orange-700 inline-flex items-center group">
                        Submit via Notion Form
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


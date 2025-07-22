import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, Shield, Users, CreditCard, AlertTriangle, Scale, Mail, Globe } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  const lastUpdated = "July 2025"

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-gray-700 border-0 px-4 py-2">
              TERMS OF SERVICE
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms & <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Conditions</span>
            </h1>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4" />
                <span className="text-sm">Legally Binding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card className="border border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-900 mb-3">Agreement to Terms</h2>
                  <p className="text-purple-800 leading-relaxed">
                    These Terms of Service ("Terms") constitute a legally binding agreement between you and Curately 
                    ("we," "us," or "our") regarding your use of our link-in-bio platform service. By accessing or 
                    using our service, you agree to be bound by these Terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Our Service</h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Curately provides a link-in-bio platform that allows users to create customizable pages 
                  containing multiple links, QR codes, and other content. Our service includes:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Core Features</h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li>Custom link-in-bio pages</li>
                      <li>QR code generation and management</li>
                      <li>Analytics and click tracking</li>
                      <li>Page customization tools</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Pro Features</h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li>Multiple pages (up to 2)</li>
                      <li>Extended limits (50 links/QR codes)</li>
                      <li>Advanced analytics</li>
                      <li>Priority customer support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">User Accounts & Responsibilities</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>You must be at least 13 years old to create an account</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>You may not create multiple accounts or share account access</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Conduct</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 mb-3 font-medium">You agree NOT to use our service for:</p>
                    <ul className="list-disc list-inside text-red-700 space-y-1 ml-4 text-sm">
                      <li>Illegal activities or content that violates applicable laws</li>
                      <li>Harassment, hate speech, or discriminatory content</li>
                      <li>Spam, phishing, or malicious content</li>
                      <li>Adult content or sexually explicit material</li>
                      <li>Infringing intellectual property rights</li>
                      <li>Distributing malware or harmful code</li>
                      <li>Impersonating others or providing false information</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Ownership</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>You retain ownership of content you create and upload</li>
                    <li>You grant us a license to host and display your content</li>
                    <li>You are responsible for ensuring you have rights to all content</li>
                    <li>We may remove content that violates these Terms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Terms */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-blue-900">Subscription & Payment Terms</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Free Plan</h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                      <li>Limited to 5 active links and 5 QR codes</li>
                      <li>1 page maximum</li>
                      <li>Basic analytics and features</li>
                      <li>No payment required</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Pro Plan Subscription</h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <ul className="list-disc list-inside text-blue-800 space-y-2 text-sm">
                      <li><strong>Billing:</strong> Monthly subscription charged in advance</li>
                      <li><strong>Payment:</strong> Processed securely through Stripe</li>
                      <li><strong>Auto-renewal:</strong> Subscriptions renew automatically unless cancelled</li>
                      <li><strong>Cancellation:</strong> Cancel anytime through your account settings</li>
                      <li><strong>Refunds:</strong> No refunds for partial months</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Plan Downgrades</h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-800 text-sm mb-2">
                      When downgrading from Pro to Free or upon subscription cancellation:
                    </p>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                      <li>Excess content will be deactivated but preserved for 7 days</li>
                      <li>You can reactivate content by upgrading to Pro</li>
                      <li>After 7 days, deactivated content is permanently deleted</li>
                      <li>No data recovery is available after deletion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Service Availability & Modifications</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Availability</h3>
                  <p className="text-gray-700 mb-2">
                    We strive to provide reliable service but cannot guarantee:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>100% uptime or uninterrupted service</li>
                    <li>Error-free operation</li>
                    <li>Compatibility with all devices or browsers</li>
                    <li>Availability in all geographic regions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Modifications</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>We may modify, suspend, or discontinue features at any time</li>
                    <li>We may update these Terms with 30 days notice for material changes</li>
                    <li>Continued use after changes constitutes acceptance</li>
                    <li>We may terminate accounts for violations of these Terms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="border border-gray-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Our service relies on third-party providers for infrastructure and payment processing:
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Supabase</h4>
                    <p className="text-gray-600 text-sm">
                      Database hosting and authentication services
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Vercel</h4>
                    <p className="text-gray-600 text-sm">
                      Application hosting and content delivery
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                    <p className="text-gray-600 text-sm">
                      Secure payment processing and billing
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm">
                  These services have their own terms and privacy policies. We are not responsible 
                  for their performance or policies.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border border-yellow-200 bg-yellow-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-bold text-yellow-900">Limitation of Liability</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Service Warranty</h3>
                  <p className="text-yellow-800 text-sm mb-2">
                    OUR SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, INCLUDING:
                  </p>
                  <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm ml-4">
                    <li>Merchantability or fitness for a particular purpose</li>
                    <li>Uninterrupted or error-free operation</li>
                    <li>Security or virus-free content</li>
                    <li>Accuracy or reliability of information</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Damage Limitation</h3>
                  <p className="text-yellow-800 text-sm">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY 
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
                    BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Maximum Liability</h3>
                  <p className="text-yellow-800 text-sm">
                    Our total liability shall not exceed the amount you paid for the service 
                    in the 12 months preceding the claim.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Scale className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Account Termination</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User-Initiated Termination</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>You may delete your account at any time through account settings</li>
                    <li>Active subscriptions will continue until the end of the billing period</li>
                    <li>Your data will be deleted within 30 days of account deletion</li>
                    <li>Public pages will be immediately deactivated</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service-Initiated Termination</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>We may suspend or terminate accounts that violate these Terms</li>
                    <li>Repeated violations may result in permanent account closure</li>
                    <li>We will provide reasonable notice when possible</li>
                    <li>No refunds are provided for terminated accounts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Retention</h3>
                  <p className="text-gray-700">
                    Upon termination, your data will be deleted according to our data retention 
                    policies outlined in our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Scale className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Governing Law & Disputes</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicable Law</h3>
                  <p className="text-gray-700">
                    These Terms are governed by the laws of England and Wales, without regard 
                    to conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Dispute Resolution</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Contact us first to resolve disputes informally</li>
                    <li>Formal disputes shall be resolved through binding arbitration</li>
                    <li>Courts in England and Wales have exclusive jurisdiction</li>
                    <li>Class action lawsuits are not permitted</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border border-gray-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Questions about these Terms of Service? Contact us:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">General Inquiries</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600 w-16">Email:</span>
                        <Link href="mailto:legal@curately.co.uk" className="text-blue-600 hover:text-blue-700">
                          legal@curately.co.uk
                        </Link>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600 w-16">Support:</span>
                        <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                          Contact Form
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Legal Notice Address</h4>
                    <div className="text-gray-700 text-sm">
                      <p>Curately</p>
                      <p>United Kingdom</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Severability */}
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Severability</h3>
                <p className="text-gray-700 text-sm">
                  If any provision of these Terms is found to be unenforceable, the remaining 
                  provisions will remain in full force and effect. These Terms constitute the 
                  entire agreement between you and Curately regarding the service.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Terms of Service - Curately | Legal Agreement & User Guidelines',
    description: 'Read Curately\'s Terms of Service to understand your rights and responsibilities when using our link-in-bio platform.',
    openGraph: {
      title: 'Terms of Service - Curately',
      description: 'Legal terms and conditions for using Curately\'s link-in-bio platform.',
    },
  }
}
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Clock, Database, Globe, Lock, Eye, Users, AlertCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  const lastUpdated = "July 2025"

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-0 px-4 py-2">
              PRIVACY POLICY
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Privacy <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Matters</span>
            </h1>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-3">Our Commitment to Your Privacy</h2>
                  <p className="text-blue-800 leading-relaxed">
                    At Curately (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and ensuring transparency 
                    about how we collect, use, and safeguard your personal information. This Privacy Policy explains our 
                    data practices for our link-in-bio platform service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Email address (for account creation and communication)</li>
                    <li>Display name and bio (for your public profile)</li>
                    <li>Avatar/profile picture (optional)</li>
                    <li>Username (for your public page URL)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Links, titles, and descriptions you create</li>
                    <li>QR codes and their associated data</li>
                    <li>Page customization settings (themes, backgrounds)</li>
                    <li>Social media links and profile information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Analytics</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Click data and engagement metrics</li>
                    <li>Visitor statistics (anonymized)</li>
                    <li>Device and browser information</li>
                    <li>Geographic location (country/region level)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Billing information processed through Stripe</li>
                    <li>Subscription status and plan details</li>
                    <li>Transaction history (stored by Stripe, not on our servers)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Delivery</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Provide and maintain your account</li>
                    <li>Display your public profile and links</li>
                    <li>Generate and track QR codes</li>
                    <li>Process analytics and insights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Send important account notifications</li>
                    <li>Provide customer support</li>
                    <li>Share product updates (with consent)</li>
                    <li>Respond to your inquiries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Improvement</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Analyze usage patterns</li>
                    <li>Improve our features and functionality</li>
                    <li>Detect and prevent abuse</li>
                    <li>Ensure security and reliability</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Compliance</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Comply with applicable laws</li>
                    <li>Respond to legal requests</li>
                    <li>Protect our rights and property</li>
                    <li>Ensure platform safety</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="border border-purple-200 bg-purple-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-purple-900">Third-Party Services</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Supabase (Database & Authentication)</h3>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-800 mb-2">
                      <strong>Purpose:</strong> Database hosting, user authentication, and real-time features
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>Data Stored:</strong> Account information, content data, and usage analytics
                    </p>
                    <p className="text-purple-800">
                      <strong>Location:</strong> Data centers in the United States and Europe (EU)
                    </p>
                    <Link href="https://supabase.com/privacy" target="_blank" 
                          className="text-purple-600 hover:text-purple-700 underline text-sm">
                      View Supabase Privacy Policy →
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Vercel (Hosting & Infrastructure)</h3>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-800 mb-2">
                      <strong>Purpose:</strong> Website hosting, content delivery, and application performance
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>Data Processed:</strong> Website access logs, performance metrics, and cached content
                    </p>
                    <p className="text-purple-800">
                      <strong>Location:</strong> Global content delivery network with primary servers in the US
                    </p>
                    <Link href="https://vercel.com/legal/privacy-policy" target="_blank" 
                          className="text-purple-600 hover:text-purple-700 underline text-sm">
                      View Vercel Privacy Policy →
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Stripe (Payment Processing)</h3>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="text-purple-800 mb-2">
                      <strong>Purpose:</strong> Secure payment processing and subscription management
                    </p>
                    <p className="text-purple-800 mb-2">
                      <strong>Data Processed:</strong> Billing information, payment methods, and transaction records
                    </p>
                    <p className="text-purple-800">
                      <strong>Note:</strong> Payment data is processed directly by Stripe and never stored on our servers
                    </p>
                    <Link href="https://stripe.com/privacy" target="_blank" 
                          className="text-purple-600 hover:text-purple-700 underline text-sm">
                      View Stripe Privacy Policy →
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Data Security & Protection</h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Measures</h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li>Encryption in transit and at rest</li>
                      <li>Secure authentication systems</li>
                      <li>Regular security audits</li>
                      <li>Access controls and monitoring</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Organizational Measures</h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li>Limited access on need-to-know basis</li>
                      <li>Employee privacy training</li>
                      <li>Data breach response procedures</li>
                      <li>Regular policy reviews and updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-green-900">Your Privacy Rights</h2>
              </div>

              <p className="text-green-800 mb-6">
                You have the following rights regarding your personal information:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Access & Portability</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Request access to your personal data and receive it in a portable format.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Rectification</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Correct inaccurate or incomplete personal information.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Erasure</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Request deletion of your personal data under certain conditions.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Restriction</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Limit how we process your personal information.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Objection</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Object to processing based on legitimate interests or direct marketing.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Withdraw Consent</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Withdraw consent for processing that relies on your consent.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>To exercise your rights:</strong> Contact us at privacy@curately.co.uk or through your account settings. 
                  We will respond within 30 days and may request verification of your identity.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertCircle className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Cookies & Tracking</h2>
              </div>

              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Necessary Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Essential for website functionality, including authentication, security, and basic features.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Help us understand website usage patterns to improve user experience (requires consent).
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                  <p className="text-gray-700 text-sm">
                    Used for personalized advertising and measuring campaign effectiveness (requires consent).
                  </p>
                </div>
              </div>

              <p className="text-gray-700 text-sm mt-4">
                You can manage your cookie preferences through our cookie banner or browser settings.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border border-gray-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>

              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices:
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <strong className="text-gray-900 w-24">Email:</strong>
                  <Link href="mailto:privacy@curately.co.uk" className="text-blue-600 hover:text-blue-700">
                    privacy@curately.co.uk
                  </Link>
                </div>
                <div className="flex items-center space-x-3">
                  <strong className="text-gray-900 w-24">Support:</strong>
                  <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                    Contact Form
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes Notice */}
          <Card className="border border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Policy Updates</h3>
                  <p className="text-amber-800 text-sm">
                    We may update this Privacy Policy periodically. Material changes will be communicated through 
                    email or a prominent notice on our website. Your continued use of our service after changes 
                    become effective constitutes acceptance of the updated policy.
                  </p>
                </div>
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
    title: 'Privacy Policy - Curately | Your Data Protection Rights',
    description: 'Learn how Curately protects your privacy, handles your data, and complies with GDPR. Transparent information about our data practices.',
    openGraph: {
      title: 'Privacy Policy - Curately',
      description: 'Your privacy matters. Learn about our data protection practices and your rights.',
    },
  }
}
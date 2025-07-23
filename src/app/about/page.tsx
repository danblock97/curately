import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Code, Palette, BarChart3, QrCode, Link2, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-0 px-4 py-2 text-sm font-medium">
            ABOUT CURATELY
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Rethinking{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">link-in-bio</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            We believe your link-in-bio should be as unique as you are. That&apos;s why we built Curately with a 
            split-screen design that puts your personality front and center.
          </p>
          
          {/* Key Features Preview */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Split-screen layout</span>
            </div>
            <div className="flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>Custom QR codes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-green-600" />
              <span>Smart deeplinks</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <span>Detailed analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-gray-100 text-gray-700 border-0">
                OUR STORY
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why we built something different
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Most link-in-bio tools treat your page like a boring list. We thought, 
                  &ldquo;Why can&apos;t it showcase who you really are?&rdquo;
                </p>
                <p>
                  That&apos;s when we created the <strong className="text-gray-900">split-screen design</strong> - 
                  your profile and personality on the left, your links and widgets on the right. 
                  It&apos;s not just functional, it&apos;s personal.
                </p>
                <p>
                  From QR codes with your logo to deeplinks that work perfectly across devices, 
                  every feature is designed to make you stand out in a sea of generic bio pages.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
                {/* Mockup of split screen */}
                <div className="bg-white rounded-xl p-4 flex gap-4">
                  {/* Left side - Profile */}
                  <div className="w-1/2 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded mb-1"></div>
                    <div className="h-1 bg-gray-100 rounded w-3/4 mx-auto"></div>
                  </div>
                  {/* Right side - Widgets */}
                  <div className="w-1/2 space-y-2">
                    <div className="h-6 bg-blue-100 rounded-lg"></div>
                    <div className="h-6 bg-green-100 rounded-lg"></div>
                    <div className="h-6 bg-purple-100 rounded-lg"></div>
                    <div className="h-6 bg-orange-100 rounded-lg"></div>
                  </div>
                </div>
                <p className="text-white text-center mt-4 text-sm opacity-75">The Curately difference</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-gray-700 border border-gray-200">
              WHAT MAKES US DIFFERENT
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built for creators who want more
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed around our unique split-screen approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Split-Screen Layout</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your profile shines on the left while your links stay organized on the right. 
                  Drag, drop, and arrange widgets exactly how you want.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Branded QR Codes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate QR codes with your logo embedded right in the center. 
                  Perfect for business cards, flyers, and offline marketing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Link2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Deeplinks</h3>
                <p className="text-gray-600 leading-relaxed">
                  Detect devices automatically and redirect to App Store, Google Play, 
                  or web fallback. No more broken app links.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track clicks, see your top performing links, and understand your audience. 
                  Pro users get advanced insights and longer data retention.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Styling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pro users can customize backgrounds, themes, and widget styles. 
                  Make your page truly yours with full creative control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Developer-Friendly</h3>
                <p className="text-gray-600 leading-relaxed">
                  Clean URLs (curately.co.uk/yourname), fast loading times, 
                  and SEO-friendly pages that work great for professionals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-0">
            OUR MISSION
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Link-in-bio that doesn&apos;t{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">suck</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            We&apos;re building the link-in-bio tool we always wanted to use - one that showcases your personality, 
            works flawlessly across devices, and gives you the analytics you actually need.
          </p>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-12 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">Always Free</div>
                <p className="text-gray-600 text-sm">5 links, 5 QR codes forever</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">Pro Features</div>
                <p className="text-gray-600 text-sm">50 links, custom styling, analytics</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">Your Data</div>
                <p className="text-gray-600 text-sm">Clean exports, no lock-in</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <Link href="/auth">
                Try it free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="px-8 py-4 rounded-xl font-semibold border-2 hover:bg-gray-50">
              <Link href="/contact">Questions? Ask us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">
            Have questions about Curately or want to share your feedback?{' '}
            <Link href="/contact" className="text-gray-900 font-medium hover:underline">
              We&apos;d love to hear from you
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'About - Curately | Our Story & Mission',
    description: 'Learn about Curately\'s mission to make link sharing beautiful and accessible. Discover our story, values, and commitment to the creator community.',
    openGraph: {
      title: 'About Curately',
      description: 'Making link sharing beautiful, powerful, and accessible to everyone.',
    },
  }
}
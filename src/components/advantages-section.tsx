'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Layout, 
  MousePointer, 
  Palette, 
  BarChart3, 
  QrCode, 
  Smartphone,
  ExternalLink,
  Eye,
  Sparkles,
  Move3D
} from 'lucide-react'

const advantages = [
  {
    icon: <Layout className="w-8 h-8" />,
    title: 'Split-Screen Layout',
    description: 'Beautiful two-panel design with your profile on the left and customizable widgets on the right. Perfect balance of personal branding and functionality.',
    color: 'text-blue-600',
    iconBg: 'bg-blue-100'
  },
  {
    icon: <Move3D className="w-8 h-8" />,
    title: 'Drag & Drop Widgets',
    description: 'Position your widgets exactly where you want them. Drag and drop social media widgets, links, and QR codes anywhere on your page.',
    color: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Multiple Widget Types',
    description: 'Social media widgets, link buttons, text blocks, images, QR codes, and more. Each widget has multiple size options to fit your layout perfectly.',
    color: 'text-purple-600',
    iconBg: 'bg-purple-100'
  },
  {
    icon: <MousePointer className="w-8 h-8" />,
    title: 'Detailed Click Analytics',
    description: 'Track every click and view with comprehensive analytics. See which widgets perform best and understand your audience engagement.',
    color: 'text-orange-600',
    iconBg: 'bg-orange-100'
  },
  {
    icon: <QrCode className="w-8 h-8" />,
    title: 'Custom QR Codes',
    description: 'Generate beautiful QR codes with custom colors, your logo in the center, and download as SVG or PNG. Perfect for print materials.',
    color: 'text-cyan-600',
    iconBg: 'bg-cyan-100'
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Smart Deep Links',
    description: 'Automatically route users to iOS App Store, Google Play, or your website based on their device. No more broken mobile links.',
    color: 'text-indigo-600',
    iconBg: 'bg-indigo-100'
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: 'Custom Appearance',
    description: 'Customize colors, backgrounds, and themes to match your brand. Make your page truly unique with our appearance editor.',
    color: 'text-pink-600',
    iconBg: 'bg-pink-100'
  },
  {
    icon: <Eye className="w-8 h-8" />,
    title: 'Multiple Page Support',
    description: 'Create different pages for different purposes. Personal page, business page, event page - organize your links however you need.',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-100'
  }
]

export function AdvantagesSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
  }, [])

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            ADVANTAGES
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why choose Curately for your links?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Powerful features designed specifically for content creators, businesses, and influencers who want more than just a basic link-in-bio
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {advantages.map((advantage, index) => (
            <Card 
              key={index} 
              className="group bg-white border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl ${advantage.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={advantage.color}>
                    {advantage.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {advantage.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {advantage.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">5+</div>
              <div className="text-blue-600 font-semibold mb-2">Widget Types</div>
              <div className="text-gray-600 text-sm">Social, links, text, images, QR codes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">3</div>
              <div className="text-green-600 font-semibold mb-2">Link Types</div>
              <div className="text-gray-600 text-sm">Bio links, deeplinks, and QR codes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">100</div>
              <div className="text-purple-600 font-semibold mb-2">Links & Codes</div>
              <div className="text-gray-600 text-sm">Create many links and QR codes</div>
            </CardContent>
          </Card>
        </div>


        {/* Call to Action */}
        <div className="text-center mt-16">
          {isAuthenticated ? (
            <>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg" asChild>
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <p className="text-gray-600 mt-4">Continue building your perfect link-in-bio experience</p>
            </>
          ) : (
            <>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg" asChild>
                <Link href="/auth">Get Started with Curately</Link>
              </Button>
              <p className="text-gray-600 mt-4">Join thousands of creators already using Curately</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
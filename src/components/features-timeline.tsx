'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Link2, ExternalLink, QrCode, Zap, Globe, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { BrandedQRCode } from '@/components/ui/branded-qr-code'
import Link from 'next/link'

interface Feature {
  id: number
  title: string
  description: string
  buttonText: string
  icon: React.ReactNode
  image: string
  side: 'left' | 'right'
}

const features: Feature[] = [
  {
    id: 1,
    title: 'Stunning Link in Bio Pages',
    description: 'Create beautiful split-screen pages with your profile on the left and customizable widgets on the right. Perfect for content creators, businesses, and influencers.',
    buttonText: 'Create my page',
    icon: <Link2 className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'left'
  },
  {
    id: 2,
    title: 'Smart Deeplinks',
    description: 'Automatically route users to the right destination - iOS App Store, Google Play, or your website - based on their device. No more broken links.',
    buttonText: 'Try deeplinks',
    icon: <ExternalLink className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'right'
  },
  {
    id: 3,
    title: 'Designer QR Codes',
    description: 'Generate beautiful QR codes with custom colors, sizes, and your logo in the center. Download as SVG or PNG for print and digital use.',
    buttonText: 'Create QR code',
    icon: <QrCode className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'left'
  },
  {
    id: 4,
    title: 'Powerful Analytics',
    description: 'Track clicks, views, and engagement across all your links and QR codes. See which content performs best with detailed charts and insights.',
    buttonText: 'See analytics',
    icon: <BarChart3 className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'right'
  },
  {
    id: 5,
    title: 'Beautiful Widgets',
    description: 'Add social media widgets, links, text blocks, images, and more. Each widget type has multiple size options and can be positioned anywhere on your page.',
    buttonText: 'Explore widgets',
    icon: <Globe className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'left'
  }
]

export function FeaturesTimeline() {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const featureRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const featureId = parseInt(entry.target.getAttribute('data-feature-id') || '0')
          if (entry.isIntersecting) {
            setVisibleFeatures(prev => new Set([...prev, featureId]))
          } else {
            setVisibleFeatures(prev => {
              const newSet = new Set(prev)
              newSet.delete(featureId)
              return newSet
            })
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
  }, [])

  const setFeatureRef = (id: number) => (element: HTMLDivElement | null) => {
    if (element) {
      featureRefs.current.set(id, element)
    } else {
      featureRefs.current.delete(id)
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            FEATURES
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            What makes us essential (and a little proud).
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
            Create the best Links in bio, deeplinks, and QR Codes with Curately
          </p>
          {isAuthenticated ? (
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold" asChild>
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold" asChild>
              <Link href="/auth">Create an account</Link>
            </Button>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line - hidden on mobile */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-300 h-full hidden lg:block"></div>
          
          {/* Timeline dots - hidden on mobile */}
          {features.map((feature) => (
            <div
              key={`dot-${feature.id}`}
              className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 hidden lg:block ${
                visibleFeatures.has(feature.id) 
                  ? 'bg-blue-500 shadow-lg scale-125' 
                  : 'bg-gray-400 scale-100'
              }`}
              style={{
                top: `${(feature.id - 1) * 600 + 300}px`,
                zIndex: 10
              }}
            />
          ))}

          {/* Feature cards */}
          {features.map((feature) => (
            <div
              key={feature.id}
              ref={setFeatureRef(feature.id)}
              data-feature-id={feature.id}
              className={`relative mb-12 sm:mb-20 lg:mb-32 transition-all duration-700 ${
                visibleFeatures.has(feature.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-30 translate-y-8'
              }`}
            >
              <div className={`flex items-center lg:${
                feature.side === 'left' 
                  ? 'justify-start pr-8' 
                  : 'justify-end pl-8'
              } justify-center`}>
                <div className={`w-full lg:w-1/2 lg:${
                  feature.side === 'left' 
                    ? 'pr-8' 
                    : 'pl-8'
                }`}>
                  <Card className={`bg-white border-gray-200 transition-all duration-500 ${
                    visibleFeatures.has(feature.id)
                      ? 'shadow-xl lg:shadow-2xl border-gray-300'
                      : 'shadow-lg'
                  }`}>
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Mock phone image */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          <div className="w-24 sm:w-28 lg:w-32 h-40 sm:h-46 lg:h-52 bg-gray-200 rounded-2xl p-2 shadow-lg">
                            <div className="w-full h-full bg-white rounded-xl overflow-hidden border border-gray-100">
                              {/* Mock phone content based on feature */}
                              {feature.id === 1 && (
                                <div className="p-2 sm:p-3 flex">
                                  {/* Left - Profile */}
                                  <div className="w-1/2 text-center">
                                    <div className="w-4 sm:w-6 h-4 sm:h-6 bg-blue-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                                    <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-gray-900 rounded mx-auto mb-1"></div>
                                    <div className="w-4 sm:w-6 h-0.5 bg-gray-400 rounded mx-auto"></div>
                                  </div>
                                  {/* Right - Widgets */}
                                  <div className="w-1/2 space-y-1">
                                    <div className="w-full h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded text-xs"></div>
                                    <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded border border-gray-200"></div>
                                    <div className="flex space-x-1">
                                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-br from-pink-500 to-red-500 rounded"></div>
                                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gray-800 rounded"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {feature.id === 2 && (
                                <div className="p-2 sm:p-4 flex items-center justify-center h-full">
                                  <div className="text-center space-y-1 sm:space-y-2">
                                    {/* Central hub */}
                                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-900 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">C</span>
                                    </div>
                                    {/* Device icons */}
                                    <div className="flex justify-center space-x-1 sm:space-x-2">
                                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 rounded"></div>
                                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded"></div>
                                      <div className="w-2 sm:w-3 h-2 sm:h-3 bg-purple-500 rounded"></div>
                                    </div>
                                    <div className="text-xs text-gray-600">Smart routing</div>
                                  </div>
                                </div>
                              )}
                              {feature.id === 3 && (
                                <div className="p-2 sm:p-4 flex items-center justify-center h-full">
                                  <div className="w-14 sm:w-20 h-14 sm:h-20 bg-white border-1 sm:border-2 border-gray-200 rounded-lg p-1 sm:p-2">
                                    <BrandedQRCode 
                                      url="https://danblock.dev" 
                                      size={48}
                                      logoSize={12}
                                      className="w-full h-full sm:hidden"
                                    />
                                    <BrandedQRCode 
                                      url="https://danblock.dev" 
                                      size={64}
                                      logoSize={16}
                                      className="w-full h-full hidden sm:block"
                                    />
                                  </div>
                                </div>
                              )}
                              {feature.id === 4 && (
                                <div className="p-2 sm:p-4 flex items-center justify-center h-full">
                                  <div className="text-center space-y-1 sm:space-y-2">
                                    {/* Chart mockup */}
                                    <div className="w-12 sm:w-16 h-8 sm:h-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded relative">
                                      <div className="absolute bottom-0 left-1 w-1.5 sm:w-2 h-4 sm:h-6 bg-blue-600 rounded-sm"></div>
                                      <div className="absolute bottom-0 left-3 sm:left-4 w-1.5 sm:w-2 h-5 sm:h-8 bg-blue-600 rounded-sm"></div>
                                      <div className="absolute bottom-0 left-5 sm:left-7 w-1.5 sm:w-2 h-3 sm:h-4 bg-blue-600 rounded-sm"></div>
                                      <div className="absolute bottom-0 left-7 sm:left-10 w-1.5 sm:w-2 h-6 sm:h-10 bg-blue-600 rounded-sm"></div>
                                    </div>
                                    <div className="text-xs text-gray-600">Click tracking</div>
                                  </div>
                                </div>
                              )}
                              {feature.id === 5 && (
                                <div className="p-2 sm:p-4 flex items-center justify-center h-full">
                                  <div className="text-center space-y-1 sm:space-y-2">
                                    {/* Widget mockup */}
                                    <div className="space-y-1">
                                      <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded"></div>
                                      <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-gray-100 border border-gray-200 rounded"></div>
                                      <div className="flex space-x-1">
                                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded"></div>
                                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded"></div>
                                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-500 rounded"></div>
                                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white border border-gray-300 rounded"></div>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600">Widgets</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                            {feature.title}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                            {feature.description}
                          </p>
                          <Button className="bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base w-full sm:w-auto">
                            {feature.buttonText}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
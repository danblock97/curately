'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Link2, ExternalLink, QrCode, Zap, Globe, BarChart3 } from 'lucide-react'

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
    title: 'The perfect Link in Bio',
    description: 'One link, endless possibilities. taap.it brings together everything that makes you unique, with style and efficiency.',
    buttonText: 'Create my link in bio',
    icon: <Link2 className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'left'
  },
  {
    id: 2,
    title: 'Deeplinks',
    description: 'Create links that send users to different destinations based on their device - iOS app, Android app, or web fallback.',
    buttonText: 'Create deeplink',
    icon: <ExternalLink className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'right'
  },
  {
    id: 3,
    title: 'Custom QR Codes',
    description: 'Generate QR codes with custom colors and sizes. Perfect for print materials, business cards, and offline marketing.',
    buttonText: 'Generate QR code',
    icon: <QrCode className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'left'
  },
  {
    id: 4,
    title: 'Click Tracking',
    description: 'Monitor how many people click your links and see which ones perform best. Track your growth over time.',
    buttonText: 'View analytics',
    icon: <BarChart3 className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'right'
  },
  {
    id: 5,
    title: 'Custom Themes',
    description: 'Choose from 4 beautiful themes to match your brand. Light, dark, and gradient options available.',
    buttonText: 'See themes',
    icon: <Zap className="w-6 h-6" />,
    image: '/api/placeholder/300/500',
    side: 'left'
  }
]

export function FeaturesTimeline() {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())
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

  const setFeatureRef = (id: number) => (element: HTMLDivElement | null) => {
    if (element) {
      featureRefs.current.set(id, element)
    } else {
      featureRefs.current.delete(id)
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
            FEATURES
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What makes us essential (and a little proud).
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create the best Links in bio, deeplinks, and QR Codes with Curately
          </p>
          <Button className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-lg font-semibold">
            Create an account
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-700 h-full"></div>
          
          {/* Timeline dots */}
          {features.map((feature) => (
            <div
              key={`dot-${feature.id}`}
              className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 ${
                visibleFeatures.has(feature.id) 
                  ? 'bg-white shadow-lg scale-125' 
                  : 'bg-gray-600 scale-100'
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
              className={`relative mb-32 transition-all duration-700 ${
                visibleFeatures.has(feature.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-30 translate-y-8'
              }`}
            >
              <div className={`flex items-center ${
                feature.side === 'left' 
                  ? 'justify-start pr-8' 
                  : 'justify-end pl-8'
              }`}>
                <div className={`w-1/2 ${
                  feature.side === 'left' 
                    ? 'pr-8' 
                    : 'pl-8'
                }`}>
                  <Card className={`bg-gray-800/50 border-gray-700 backdrop-blur-sm transition-all duration-500 ${
                    visibleFeatures.has(feature.id)
                      ? 'shadow-2xl border-gray-600'
                      : 'shadow-lg'
                  }`}>
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4">
                        {/* Mock phone image */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-52 bg-gray-900 rounded-2xl p-2 shadow-lg">
                            <div className="w-full h-full bg-black rounded-xl overflow-hidden">
                              {/* Mock phone content based on feature */}
                              {feature.id === 1 && (
                                <div className="p-4 space-y-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto"></div>
                                  <div className="text-center">
                                    <div className="w-16 h-2 bg-white rounded mx-auto mb-1"></div>
                                    <div className="w-12 h-1 bg-gray-400 rounded mx-auto"></div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="w-full h-8 bg-gray-700 rounded"></div>
                                    <div className="w-full h-8 bg-gray-700 rounded"></div>
                                    <div className="w-full h-8 bg-gray-700 rounded"></div>
                                  </div>
                                </div>
                              )}
                              {feature.id === 2 && (
                                <div className="p-4 flex items-center justify-center h-full">
                                  <div className="text-center">
                                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                      <ExternalLink className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="w-16 h-1 bg-gray-400 rounded mx-auto mb-1"></div>
                                    <div className="w-12 h-1 bg-gray-600 rounded mx-auto"></div>
                                  </div>
                                </div>
                              )}
                              {feature.id === 3 && (
                                <div className="p-4 flex items-center justify-center h-full">
                                  <div className="w-24 h-24 bg-white rounded-lg p-2">
                                    <div className="w-full h-full bg-black rounded relative">
                                      <div className="absolute inset-1 grid grid-cols-6 gap-px">
                                        {Array.from({ length: 36 }).map((_, i) => (
                                          <div
                                            key={i}
                                            className={`${
                                              i % 2 === 0 ? 'bg-white' : 'bg-black'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {feature.id > 3 && (
                                <div className="p-4 flex items-center justify-center h-full">
                                  <div className="text-center">
                                    <div className="w-10 h-10 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                      {feature.icon}
                                    </div>
                                    <div className="w-16 h-1 bg-gray-400 rounded mx-auto mb-1"></div>
                                    <div className="w-12 h-1 bg-gray-600 rounded mx-auto"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-4">
                            {feature.title}
                          </h3>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            {feature.description}
                          </p>
                          <Button className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-lg font-semibold">
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
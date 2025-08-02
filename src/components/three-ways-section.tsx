'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link2, ExternalLink, QrCode, Instagram, Youtube, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { BrandedQRCode } from '@/components/ui/branded-qr-code'

export function ThreeWaysSection() {
  const [activeTab, setActiveTab] = useState('link-in-bio')

  const tabs = [
    {
      id: 'link-in-bio',
      label: 'Link In Bio',
      icon: <Link2 className="w-4 h-4" />,
    },
    {
      id: 'deeplink',
      label: 'Deeplink',
      icon: <ExternalLink className="w-4 h-4" />,
    },
    {
      id: 'qr-code',
      label: 'QR Code',
      icon: <QrCode className="w-4 h-4" />,
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'link-in-bio':
        return (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Create a Link in Bio that stands out
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Gather all your links in one place, on a platform that combines design and simplicity.
              </p>
              
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">✨ Beautiful widgets</div>
                    <div className="text-xs text-gray-600">Social media, links, QR codes, and more</div>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">📊 Click tracking</div>
                    <div className="text-xs text-gray-600">See which links perform best</div>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">🎨 Custom themes</div>
                    <div className="text-xs text-gray-600">Match your brand perfectly</div>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">⚡ Lightning fast</div>
                    <div className="text-xs text-gray-600">Optimized for all devices</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              {/* Desktop Preview */}
              <div className="relative">
                <div className="absolute -top-2 sm:-top-4 right-2 sm:right-4 z-10">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs sm:text-sm px-2 sm:px-3 py-1">
                    curately.co.uk/johnsmith
                  </Badge>
                </div>
                <Card className="bg-white shadow-lg sm:shadow-xl border border-gray-200">
                  <CardContent className="p-0 flex">
                    {/* Left - Profile */}
                    <div className="w-1/2 p-3 sm:p-6 bg-white">
                      <div className="text-center">
                        <Avatar className="w-10 sm:w-16 h-10 sm:h-16 mx-auto mb-2 sm:mb-4 ring-1 sm:ring-2 ring-gray-200">
                          <AvatarImage src="/api/placeholder/64/64" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs sm:text-base">JS</AvatarFallback>
                        </Avatar>
                        <h4 className="text-sm sm:text-xl font-bold text-gray-900">John Smith</h4>
                        <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Content Creator</p>
                        <p className="text-gray-500 text-xs hidden sm:block">Digital Marketing Specialist</p>
                        <p className="text-gray-500 text-xs mb-2 sm:mb-4 hidden sm:block">Building amazing content</p>
                        
                        <div className="flex justify-center space-x-2 sm:space-x-3">
                          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Instagram className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600" />
                          </div>
                          <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Youtube className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right - Widgets */}
                    <div className="w-1/2 p-2 sm:p-4 space-y-1 sm:space-y-2">
                      {/* Instagram Widget */}
                      <div className="h-6 sm:h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center px-2 sm:px-3">
                        <div className="w-3 sm:w-5 h-3 sm:h-5 bg-white rounded-full flex items-center justify-center mr-1 sm:mr-2">
                          <Instagram className="w-2 sm:w-3 h-2 sm:h-3 text-pink-500" />
                        </div>
                        <span className="text-white text-xs font-medium">@johnsmith</span>
                      </div>
                      
                      {/* YouTube Widget */}
                      <div className="h-6 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center px-2 sm:px-3">
                        <div className="w-3 sm:w-5 h-3 sm:h-5 bg-white rounded-full flex items-center justify-center mr-1 sm:mr-2">
                          <Youtube className="w-2 sm:w-3 h-2 sm:h-3 text-red-500" />
                        </div>
                        <span className="text-white text-xs font-medium">Latest Video</span>
                      </div>
                      
                      {/* Link Widget */}
                      <div className="h-6 sm:h-10 bg-gray-100 rounded-lg flex items-center px-2 sm:px-3 justify-between">
                        <span className="text-gray-900 text-xs font-medium">My Portfolio</span>
                        <ExternalLink className="w-2 sm:w-3 h-2 sm:h-3 text-gray-600" />
                      </div>
                      
                      {/* Square widgets */}
                      <div className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-3">
                        <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">JS</span>
                        </div>
                        <div className="w-8 sm:w-12 h-8 sm:h-12 bg-white border-1 sm:border-2 border-gray-200 rounded-lg flex items-center justify-center p-1">
                          <BrandedQRCode 
                            url="https://danblock.dev" 
                            size={28}
                            logoSize={8}
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'deeplink':
        return (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Create a <span className="text-blue-600">deeplink</span> that converts.
              </h3>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <p className="text-base sm:text-lg text-gray-600">Say goodbye to user drop-offs.</p>
                <p className="text-base sm:text-lg text-gray-600">Send your traffic directly to the app of your choice.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="text-xs sm:text-sm font-medium text-blue-900 mb-1 sm:mb-2">📱 iOS App Store</div>
                  <div className="text-xs text-blue-700">Direct users to your iOS app</div>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                  <div className="text-xs sm:text-sm font-medium text-green-900 mb-1 sm:mb-2">🤖 Google Play</div>
                  <div className="text-xs text-green-700">Route Android users seamlessly</div>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                  <div className="text-xs sm:text-sm font-medium text-purple-900 mb-1 sm:mb-2">🌐 Web Fallback</div>
                  <div className="text-xs text-purple-700">Backup for desktop users</div>
                </div>
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                  <div className="text-xs sm:text-sm font-medium text-orange-900 mb-1 sm:mb-2">📊 Smart Detection</div>
                  <div className="text-xs text-orange-700">Automatically detect device type</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center order-1 lg:order-2">
              <div className="relative scale-75 sm:scale-100">
                {/* YouTube icon at top */}
                <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 sm:w-12 h-8 sm:h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Youtube className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Central hub */}
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">C</span>
                  </div>
                </div>

                {/* Connected lines and icons */}
                <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-4 sm:space-x-8">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ExternalLink className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    </div>
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Link2 className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                    </div>
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Connecting lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '200px', height: '200px', left: '-92px', top: '-92px' }}>
                  <line x1="100" y1="20" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="2" />
                  <line x1="100" y1="120" x2="60" y2="160" stroke="#e5e7eb" strokeWidth="2" />
                  <line x1="100" y1="120" x2="100" y2="160" stroke="#e5e7eb" strokeWidth="2" />
                  <line x1="100" y1="120" x2="140" y2="160" stroke="#e5e7eb" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        )

      case 'qr-code':
        return (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Create a QR Code that people want to scan
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Beautiful, efficient, trackable: take your QR Codes to the next level.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-200">
                  <div className="text-xs sm:text-sm font-medium text-indigo-900 mb-1 sm:mb-2">🎨 Custom colors</div>
                  <div className="text-xs text-indigo-700">Match your brand perfectly</div>
                </div>
                <div className="bg-cyan-50 p-3 sm:p-4 rounded-lg border border-cyan-200">
                  <div className="text-xs sm:text-sm font-medium text-cyan-900 mb-1 sm:mb-2">📏 Any size</div>
                  <div className="text-xs text-cyan-700">From business cards to billboards</div>
                </div>
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                  <div className="text-xs sm:text-sm font-medium text-emerald-900 mb-1 sm:mb-2">📈 Track scans</div>
                  <div className="text-xs text-emerald-700">See when and where it&apos;s scanned</div>
                </div>
                <div className="bg-rose-50 p-3 sm:p-4 rounded-lg border border-rose-200">
                  <div className="text-xs sm:text-sm font-medium text-rose-900 mb-1 sm:mb-2">💾 High quality</div>
                  <div className="text-xs text-rose-700">SVG and PNG downloads</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                  SCAN ME !
                </div>
                
                {/* Branded QR Code mockup */}
                <div className="w-32 sm:w-48 h-32 sm:h-48 bg-white border-2 border-gray-200 rounded-lg p-2 sm:p-4 shadow-lg">
                  <BrandedQRCode 
                    url="https://danblock.dev" 
                    size={112}
                    logoSize={28}
                    className="w-full h-full sm:hidden"
                  />
                  <BrandedQRCode 
                    url="https://danblock.dev" 
                    size={176}
                    logoSize={44}
                    className="w-full h-full hidden sm:block"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
        Same outcome, three ways
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-12 sm:mb-16">
        <div className="bg-gray-100 rounded-xl p-1 shadow-sm flex flex-col sm:flex-row w-full max-w-md sm:max-w-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all mb-1 sm:mb-0 last:mb-0 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span className="font-medium text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="text-left">
        {renderContent()}
      </div>
    </div>
  )
}
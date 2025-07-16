'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link2, ExternalLink, QrCode, Instagram, Youtube, ArrowRight } from 'lucide-react'

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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Create a Link in Bio that stands out
              </h3>
              <p className="text-lg text-gray-300 mb-8">
                Gather all your links in one place, on a platform that combines design and simplicity.
              </p>
              
              <div className="space-y-4 mb-8">
                <p className="text-gray-200 font-medium">Claim your curately.co.uk</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600 px-4 py-3 flex-1">
                    <span className="text-gray-300">curately.co.uk/</span>
                    <input
                      type="text"
                      placeholder="username"
                      className="flex-1 outline-none text-gray-300 ml-1 bg-transparent placeholder-gray-500"
                    />
                  </div>
                  <Button className="bg-white hover:bg-gray-100 text-black px-6">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  curately.co.uk/theweeknd
                </Badge>
              </div>
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src="/api/placeholder/64/64" />
                      <AvatarFallback>TW</AvatarFallback>
                    </Avatar>
                    <h4 className="text-xl font-bold text-gray-900">The Weeknd</h4>
                    <p className="text-gray-600 text-sm">Artist</p>
                    <p className="text-gray-500 text-xs mt-2">HURRY UP TOMORROW</p>
                    <p className="text-gray-500 text-xs">Grammy Award Winner</p>
                  </div>

                  <div className="flex justify-center space-x-4 mb-6">
                    <Instagram className="w-5 h-5 text-gray-600" />
                    <Youtube className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-600 aspect-square rounded-lg"></div>
                    <div className="bg-red-800 aspect-square rounded-lg"></div>
                    <div className="bg-gray-800 aspect-square rounded-lg"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'deeplink':
        return (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Create a <span className="text-gray-400">deeplink</span> that converts.
              </h3>
              <div className="space-y-4 mb-8">
                <p className="text-lg text-gray-300">Say goodbye to user drop-offs.</p>
                <p className="text-lg text-gray-300">Send your traffic directly to the app of your choice.</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <p className="text-gray-200 font-medium">Turn your link into a deeplink</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600 px-4 py-3 flex-1">
                    <input
                      type="text"
                      placeholder="https://yourlink.com"
                      className="flex-1 outline-none text-gray-300 bg-transparent placeholder-gray-500"
                    />
                  </div>
                  <Button className="bg-white hover:bg-gray-100 text-black px-6">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative">
                {/* YouTube icon at top */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Central hub */}
                <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                </div>

                {/* Connected lines and icons */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-8">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-purple-600" />
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Create a QR Code that people want to scan
              </h3>
              <p className="text-lg text-gray-300 mb-8">
                Beautiful, efficient, trackable: take your QR Codes to the next level.
              </p>
              
              <div className="space-y-4 mb-8">
                <p className="text-gray-200 font-medium">Turn your link into a QR Code</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600 px-4 py-3 flex-1">
                    <input
                      type="text"
                      placeholder="https://yourlink.com"
                      className="flex-1 outline-none text-gray-300 bg-transparent placeholder-gray-500"
                    />
                  </div>
                  <Button className="bg-white hover:bg-gray-100 text-black px-6">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute -top-4 -right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                  SCAN ME !
                </div>
                
                {/* QR Code mockup */}
                <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg">
                  <div className="w-full h-full bg-black relative overflow-hidden">
                    {/* QR Code pattern mockup */}
                    <div className="absolute inset-0 grid grid-cols-12 gap-px p-2">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square ${
                            Math.random() > 0.5 ? 'bg-white' : 'bg-black'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Corner squares */}
                    <div className="absolute top-2 left-2 w-8 h-8 bg-black border-2 border-white">
                      <div className="w-full h-full bg-white m-1">
                        <div className="w-full h-full bg-black m-1"></div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-8 h-8 bg-black border-2 border-white">
                      <div className="w-full h-full bg-white m-1">
                        <div className="w-full h-full bg-black m-1"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-black border-2 border-white">
                      <div className="w-full h-full bg-white m-1">
                        <div className="w-full h-full bg-black m-1"></div>
                      </div>
                    </div>
                    
                    {/* Center logo */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">C</span>
                    </div>
                  </div>
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
      <h2 className="text-4xl font-bold text-white mb-12">
        One tool, three ways to try it.
      </h2>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-16">
        <div className="bg-gray-800 rounded-xl p-2 shadow-md border border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
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
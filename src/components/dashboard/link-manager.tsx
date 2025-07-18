'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AddLinkForm } from './add-link-form'
import { LinkList } from './link-list'
import { Plus, Instagram, Youtube, Twitter, Github, Linkedin, Globe, Music, MessageCircle, Phone, Mail, Sparkles, Zap, Link2, TrendingUp, ExternalLink, QrCode } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Link = Database['public']['Tables']['links']['Row'] & {
  qr_codes?: {
    qr_code_data: string
    format: string
    size: number
    foreground_color: string
    background_color: string
  }[]
}

interface LinkManagerProps {
  links: Link[]
  userId: string
}

interface PlatformType {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  url: string
  placeholder: string
}

const popularPlatforms: PlatformType[] = [
  { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-pink-500 to-purple-600', url: 'https://instagram.com/', placeholder: 'yourusername' },
  { name: 'YouTube', icon: Youtube, color: 'bg-red-600', url: 'https://youtube.com/@', placeholder: 'channel' },
  { name: 'Twitter', icon: Twitter, color: 'bg-blue-500', url: 'https://twitter.com/', placeholder: 'username' },
  { name: 'GitHub', icon: Github, color: 'bg-gray-800', url: 'https://github.com/', placeholder: 'username' },
  { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', url: 'https://linkedin.com/in/', placeholder: 'profile' },
  { name: 'TikTok', icon: Music, color: 'bg-black', url: 'https://tiktok.com/@', placeholder: 'username' },
  { name: 'Discord', icon: MessageCircle, color: 'bg-indigo-600', url: 'https://discord.gg/', placeholder: 'server' },
  { name: 'Website', icon: Globe, color: 'bg-gray-600', url: 'https://', placeholder: 'yourwebsite.com' },
]

export function LinkManager({ links: initialLinks, userId }: LinkManagerProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration and initialize with server data
  useEffect(() => {
    setIsHydrated(true)
    setLinks(initialLinks)
  }, [initialLinks])

  const handleLinkAdded = (newLink: Link) => {
    setLinks(prev => [...prev, newLink])
    setShowAddForm(false)
    setSelectedPlatform(null)
  }

  const handleLinkUpdated = (updatedLink: Link) => {
    setLinks(prev => prev.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    ))
  }

  const handleLinkDeleted = (linkId: string) => {
    setLinks(prev => prev.filter(link => link.id !== linkId))
  }

  const handleLinksReordered = (reorderedLinks: Link[]) => {
    setLinks(reorderedLinks)
  }

  const handlePlatformClick = (platform: PlatformType) => {
    setSelectedPlatform(platform)
    setShowAddForm(true)
  }

  const handleCustomLinkClick = () => {
    setSelectedPlatform(null)
    setShowAddForm(true)
  }

  const totalClicks = useMemo(() => {
    if (!isHydrated || !Array.isArray(links) || links.length === 0) return 0
    
    return links.reduce((sum, link) => {
      if (!link || typeof link !== 'object') return sum
      const clicks = typeof link.clicks === 'number' && !isNaN(link.clicks) ? link.clicks : 0
      return sum + clicks
    }, 0)
  }, [links, isHydrated])

  // Show loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
      {/* Quick Actions Cards at Top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <Link2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">A page, all your links</h3>
          <Button 
            onClick={handleCustomLinkClick}
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 py-2 h-8"
          >
            Create a link in bio
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Redirect your visitors to the app</h3>
          <Button 
            onClick={handleCustomLinkClick}
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 py-2 h-8"
          >
            Create a deeplink
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <QrCode className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">A QR code that redirects to the app</h3>
          <Button 
            onClick={handleCustomLinkClick}
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 py-2 h-8"
          >
            Create a onelink
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Your domain name on your links</h3>
          <Button 
            onClick={handleCustomLinkClick}
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-4 py-2 h-8"
          >
            Brand your link
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Take curately in hand</h3>
            <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-900 text-xs">Create a deeplink</span>
              </div>
              <span className="text-gray-500 text-xs">1/5</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-900 text-xs">Create a link in bio</span>
              </div>
              <span className="text-gray-500 text-xs">2/5</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-900 text-xs">Create a QR code</span>
              </div>
              <span className="text-gray-500 text-xs">3/5</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border border-gray-300 rounded-full"></div>
                <span className="text-gray-500 text-xs">Share your link in bio</span>
              </div>
              <span className="text-gray-500 text-xs">4/5</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border border-gray-300 rounded-full"></div>
                <span className="text-gray-500 text-xs">View analytics</span>
              </div>
              <span className="text-gray-500 text-xs">5/5</span>
            </div>
          </div>
        </div>
        </div>

      {/* Right Column - Analytics and Links */}
      <div className="lg:col-span-2 space-y-4">
        {/* Analytics Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">You have generated <span className="text-green-600">{totalClicks}</span> clicks on this period</h3>
              <p className="text-xs text-gray-500">Recent clicks</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 h-7 text-xs hover:bg-gray-50">
                View analytics
              </Button>
            </div>
          </div>
          
          {/* Time period selector */}
          <div className="flex items-center space-x-1 mb-3">
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">ALL</Button>
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">1Y</Button>
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">3M</Button>
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">1M</Button>
            <Button size="sm" className="bg-gray-900 text-white h-6 text-xs px-2 hover:bg-gray-800">1W</Button>
            <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">1D</Button>
          </div>

          {/* Line Chart */}
          <div className="h-32 bg-gray-50 rounded-lg p-4 relative border border-gray-100">
            <svg className="w-full h-full" viewBox="0 0 400 80">
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.7"/>
                </pattern>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* X-axis labels */}
              <text x="20" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">08/07</text>
              <text x="80" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">09/07</text>
              <text x="140" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">10/07</text>
              <text x="200" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">11/07</text>
              <text x="260" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">12/07</text>
              <text x="320" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">13/07</text>
              <text x="380" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">14/07</text>
              
              {/* Area under the line */}
              <path
                d="M 20,50 L 80,45 L 140,35 L 200,30 L 260,25 L 320,20 L 380,15 L 380,70 L 20,70 Z"
                fill="url(#gradient)"
                opacity="0.4"
              />
              
              {/* Line chart */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                points="20,50 80,45 140,35 200,30 260,25 320,20 380,15"
              />
              
              {/* Data points */}
              <circle cx="20" cy="50" r="2" fill="#10B981"/>
              <circle cx="80" cy="45" r="2" fill="#10B981"/>
              <circle cx="140" cy="35" r="2" fill="#10B981"/>
              <circle cx="200" cy="30" r="2" fill="#10B981"/>
              <circle cx="260" cy="25" r="2" fill="#10B981"/>
              <circle cx="320" cy="20" r="2" fill="#10B981"/>
              <circle cx="380" cy="15" r="2" fill="#10B981"/>
            </svg>
          </div>
        </div>

        {/* Links List */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">My links</h3>
            <div className="flex items-center space-x-1">
              <Button size="sm" className="bg-gray-900 text-white h-6 text-xs px-2 hover:bg-gray-800">Most recent</Button>
              <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">Performance</Button>
              <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 h-6 text-xs px-2 hover:bg-gray-50">Most old</Button>
            </div>
          </div>
          
          {Array.isArray(links) && links.length > 0 ? (
            <LinkList
              links={links}
              onLinkUpdated={handleLinkUpdated}
              onLinkDeleted={handleLinkDeleted}
              onLinksReordered={handleLinksReordered}
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-xs">No links yet. Create your first link to get started!</p>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Add Link Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedPlatform && selectedPlatform.name ? `Add ${selectedPlatform.name} Link` : 'Add New Link'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPlatform && selectedPlatform.name ? `Connect your ${selectedPlatform.name} profile` : 'Add a custom link to your profile'}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedPlatform(null)
                  }}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  ×
                </Button>
              </div>
              
              <AddLinkForm
                userId={userId}
                onLinkAdded={handleLinkAdded}
                onCancel={() => {
                  setShowAddForm(false)
                  setSelectedPlatform(null)
                }}
                nextOrder={Array.isArray(links) ? links.length : 0}
                selectedPlatform={selectedPlatform}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State Modal for initial setup */}
      {Array.isArray(links) && links.length === 0 && !showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-2xl shadow-xl">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Start building your link-in-bio</h3>
                <p className="text-gray-600 text-lg">
                  Add your first link to get started. Choose from popular platforms or create a custom link.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                {popularPlatforms.slice(0, 8).map((platform) => {
                  const IconComponent = platform.icon
                  return (
                    <Button
                      key={platform.name}
                      onClick={() => handlePlatformClick(platform)}
                      className={`h-20 flex-col space-y-2 text-white hover:scale-105 transition-transform border border-gray-200 shadow-sm ${platform.color}`}
                    >
                      <IconComponent className="w-6 h-6" />
                      <span className="text-xs font-medium">{platform.name}</span>
                    </Button>
                  )
                })}
              </div>
              
              <Button
                onClick={handleCustomLinkClick}
                className="mt-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Custom Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
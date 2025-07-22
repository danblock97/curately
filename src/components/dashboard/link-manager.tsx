'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AddLinkForm } from './add-link-form'
import { LinkList } from './link-list'
import { Plus, Instagram, Youtube, Twitter, Github, Linkedin, Globe, Music, MessageCircle, Phone, Mail, Sparkles, Zap, Link2, TrendingUp, ExternalLink, QrCode, ChevronDown, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { usePlanLimits } from '@/hooks/use-plan-limits'
import { toast } from 'sonner'

type Link = Database['public']['Tables']['links']['Row'] & {
  qr_codes?: {
    qr_code_data: string
    format: string
    size: number
    foreground_color: string
    background_color: string
  } | null
}

interface LinkManagerProps {
  links: Link[]
  qrCodes: any[]
  userId: string
  profile: Database['public']['Tables']['profiles']['Row']
  pages: Database['public']['Tables']['pages']['Row'][]
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

export function LinkManager({ links: initialLinks, qrCodes: initialQrCodes, userId, profile, pages }: LinkManagerProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [defaultTab, setDefaultTab] = useState<'link_in_bio' | 'deeplink' | 'qr_code'>('link_in_bio')
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1W')
  const [selectedSort, setSelectedSort] = useState('Most recent')
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [currentPageNum, setCurrentPageNum] = useState(1)
  const [itemsPerPage] = useState(5)
  
  // Get the current page (default to primary page)
  const currentPage = selectedPageId 
    ? pages.find(p => p.id === selectedPageId) 
    : pages.find(p => p.is_primary) || pages[0]
  
  // Filter and combine links and QR codes for the current page
  // Handle case where there's no page setup yet or links don't have page_id
  const pageLinks = links.filter(link => {
    if (!link) return false
    
    // If no page exists yet, show all links (user hasn't completed page setup)
    if (!currentPage) return true
    
    // If no page_id set on link, include it if it's the primary page or no page setup
    if (!link.page_id) {
      return currentPage?.is_primary || !currentPage
    }
    
    return link.page_id === currentPage?.id
  })
  
  const pageQrCodes = qrCodes.filter(qr => {
    if (!qr) return false
    
    // If no page exists yet, show all QR codes (user hasn't completed page setup)
    if (!currentPage) return true
    
    // If no page_id set on QR code, include it if it's the primary page or no page setup
    if (!qr.page_id) {
      return currentPage?.is_primary || !currentPage
    }
    
    return qr.page_id === currentPage?.id
  })
  
  // Combine and sort by order/created_at for unified display
  const pageItems = [
    ...pageLinks.filter(link => link).map(link => ({ ...link, type: 'link' })),
    ...pageQrCodes.filter(qr => qr).map(qr => ({ ...qr, type: 'qr_code' }))
  ].sort((a, b) => {
    const orderA = (a?.order || a?.order_index || 0)
    const orderB = (b?.order || b?.order_index || 0)
    return orderA - orderB
  })
  
  
  // Pagination logic
  const totalItems = pageItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPageNum - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = pageItems.slice(startIndex, endIndex)
  
  const planUsage = usePlanLimits(links, profile.tier, pages.length, qrCodes)

  // Handle hydration and initialize with server data
  useEffect(() => {
    setIsHydrated(true)
    setLinks(initialLinks)
    setQrCodes(initialQrCodes)
  }, [initialLinks, initialQrCodes])
  
  // Reset pagination when page or items change
  useEffect(() => {
    setCurrentPageNum(1)
  }, [selectedPageId, pageItems.length, links.length, qrCodes.length])

  const handleLinkAdded = (newLink: Link) => {
    setLinks(prev => [...prev, newLink])
    setShowAddForm(false)
    setSelectedPlatform(null)
  }

  const handleQrCodeAdded = (newQrCode: any) => {
    setQrCodes(prev => [...prev, newQrCode])
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

  const handleQrCodeDeleted = (qrCodeId: string) => {
    setQrCodes(prev => prev.filter(qrCode => qrCode.id !== qrCodeId))
  }

  const handleLinksReordered = (reorderedLinks: Link[]) => {
    setLinks(reorderedLinks)
  }

  const handlePlatformClick = (platform: PlatformType) => {
    // Check plan limits before allowing link creation
    if (!planUsage.links.canCreate) {
      toast.error(`You've reached the maximum number of links (${planUsage.links.limit}) for your ${profile.tier} plan.`)
      return
    }
    setSelectedPlatform(platform)
    setShowAddForm(true)
  }

  const handleCustomLinkClick = () => {
    // Check plan limits before allowing link creation
    if (!planUsage.links.canCreate) {
      toast.error(`You've reached the maximum number of links (${planUsage.links.limit}) for your ${profile.tier} plan.`)
      return
    }
    setSelectedPlatform(null)
    setDefaultTab('link_in_bio')
    setShowAddForm(true)
  }

  const handleDeeplinkClick = () => {
    // Check plan limits before allowing deeplink creation
    if (!planUsage.links.canCreate) {
      toast.error(`You've reached the maximum number of links (${planUsage.links.limit}) for your ${profile.tier} plan.`)
      return
    }
    setSelectedPlatform(null)
    setDefaultTab('deeplink')
    setShowAddForm(true)
  }

  const handleQRCodeClick = () => {
    // Check QR code plan limits before allowing QR code creation
    if (!planUsage.qrCodes.canCreate) {
      toast.error(`You've reached the maximum number of QR codes (${planUsage.qrCodes.limit}) for your ${profile.tier} plan.`)
      return
    }
    setSelectedPlatform(null)
    setDefaultTab('qr_code')
    setShowAddForm(true)
  }

  const totalClicks = useMemo(() => {
    if (!isHydrated) return 0
    
    const linkClicks = pageLinks.reduce((sum, link) => {
      if (!link || typeof link !== 'object') return sum
      const clicks = typeof link.clicks === 'number' && !isNaN(link.clicks) ? link.clicks : 0
      return sum + clicks
    }, 0)
    
    const qrClicks = pageQrCodes.reduce((sum, qr) => {
      if (!qr || typeof qr !== 'object') return sum
      const clicks = typeof qr.clicks === 'number' && !isNaN(qr.clicks) ? qr.clicks : 0
      return sum + clicks
    }, 0)
    
    return linkClicks + qrClicks
  }, [pageLinks, pageQrCodes, isHydrated])

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
      {/* Page Switcher */}
      {pages.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Current Page:</span>
            </div>
            <div className="relative">
              <select
                value={currentPage?.id || ''}
                onChange={(e) => setSelectedPageId(e.target.value || null)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.display_name || page.username} {page.is_primary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          {currentPage && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Page URL: <span className="font-mono text-blue-600">/{currentPage.username}</span>
                </span>
                <span className="text-gray-600">
                  All Items: <span className="font-semibold text-gray-900">{pageItems.length}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Cards at Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <Link2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">A page, all your links</h3>
          <Button 
            onClick={handleCustomLinkClick}
            disabled={!planUsage.links.canCreate}
            className={`text-white text-xs px-4 py-2 h-8 ${
              planUsage.links.canCreate 
                ? 'bg-gray-900 hover:bg-gray-800' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Add a link
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
            onClick={handleDeeplinkClick}
            disabled={!planUsage.links.canCreate}
            className={`text-white text-xs px-4 py-2 h-8 ${
              planUsage.links.canCreate 
                ? 'bg-gray-900 hover:bg-gray-800' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
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
            onClick={handleQRCodeClick}
            disabled={!planUsage.qrCodes.canCreate}
            className={`text-white text-xs px-4 py-2 h-8 ${
              planUsage.qrCodes.canCreate
                ? 'bg-gray-900 hover:bg-gray-800' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Create a QR Code
          </Button>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Current Plan Usage</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                profile.tier === 'pro' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {profile.tier === 'pro' ? 'Pro' : 'Free'} Plan
              </span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 text-xs font-medium">1. Links</span>
                  <span className="text-gray-500 text-xs">{planUsage.links.current}/{planUsage.links.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(planUsage.links.current / planUsage.links.limit) * 100}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 text-xs font-medium">2. Pages</span>
                  <span className="text-gray-500 text-xs">{planUsage.pages.current}/{planUsage.pages.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(planUsage.pages.current / planUsage.pages.limit) * 100}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 text-xs font-medium">3. QR Codes</span>
                  <span className="text-gray-500 text-xs">{planUsage.qrCodes.current}/{planUsage.qrCodes.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(planUsage.qrCodes.current / planUsage.qrCodes.limit) * 100}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 text-xs font-medium">4. Analytics</span>
                  <span className="text-gray-500 text-xs">
                    {planUsage.analytics.retentionDays === -1 ? 'Forever' : `${planUsage.analytics.retentionDays} days`}
                    {planUsage.analytics.advanced && <span className="ml-1 text-blue-600">Advanced</span>}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-orange-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 text-xs font-medium">5. Clicks & Scans</span>
                  <span className="text-gray-500 text-xs">{planUsage.clicks.unlimited ? 'Unlimited' : 'Limited'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border border-gray-300 text-gray-600 h-7 text-xs hover:bg-gray-50"
                onClick={() => window.location.href = '/dashboard/analytics'}
              >
                View analytics
              </Button>
            </div>
          </div>
          
          {/* Time period selector */}
          <div className="flex items-center space-x-1 mb-3">
            {['ALL', '1Y', '3M', '1M', '1W', '1D'].map((period) => (
              <Button
                key={period}
                size="sm"
                onClick={() => setSelectedTimePeriod(period)}
                className={`h-6 text-xs px-2 ${
                  selectedTimePeriod === period
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period}
              </Button>
            ))}
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
              <text x="20" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">13/07</text>
              <text x="80" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">14/07</text>
              <text x="140" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">15/07</text>
              <text x="200" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">16/07</text>
              <text x="260" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">17/07</text>
              <text x="320" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">18/07</text>
              <text x="380" y="75" fill="#6B7280" fontSize="8" textAnchor="middle">19/07</text>
              
              {/* Area under the line */}
              <path
                d="M 20,60 L 80,60 L 140,60 L 200,60 L 260,60 L 320,60 L 380,50 L 380,70 L 20,70 Z"
                fill="url(#gradient)"
                opacity="0.4"
              />
              
              {/* Line chart */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                points="20,60 80,60 140,60 200,60 260,60 320,60 380,50"
              />
              
              {/* Data points */}
              <circle cx="20" cy="60" r="2" fill="#10B981"/>
              <circle cx="80" cy="60" r="2" fill="#10B981"/>
              <circle cx="140" cy="60" r="2" fill="#10B981"/>
              <circle cx="200" cy="60" r="2" fill="#10B981"/>
              <circle cx="260" cy="60" r="2" fill="#10B981"/>
              <circle cx="320" cy="60" r="2" fill="#10B981"/>
              <circle cx="380" cy="50" r="2" fill="#10B981"/>
            </svg>
          </div>
        </div>

        {/* Links List */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">My Links & QR Codes</h3>
            <div className="flex items-center space-x-1">
              {['Most recent', 'Performance', 'Oldest'].map((sortOption) => (
                <Button
                  key={sortOption}
                  size="sm"
                  onClick={() => setSelectedSort(sortOption)}
                  className={`h-6 text-xs px-2 ${
                    selectedSort === sortOption
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {sortOption}
                </Button>
              ))}
            </div>
          </div>
          
          {Array.isArray(paginatedItems) && paginatedItems.length > 0 ? (
            <LinkList
              links={paginatedItems}
              onLinkUpdated={handleLinkUpdated}
              onLinkDeleted={handleLinkDeleted}
              onQrCodeDeleted={handleQrCodeDeleted}
              onLinksReordered={handleLinksReordered}
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-xs">No items yet. Create your first link or QR code to get started!</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                  disabled={currentPageNum === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPageNum} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPageNum === totalPages}
                  className="h-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
                onLinkAdded={handleLinkAdded}
                onQrCodeAdded={handleQrCodeAdded}
                onCancel={() => {
                  setShowAddForm(false)
                  setSelectedPlatform(null)
                }}
                nextOrder={Array.isArray(pageItems) ? pageItems.length : 0}
                selectedPlatform={selectedPlatform}
                existingLinks={links}
                pageId={currentPage?.id}
                defaultTab={defaultTab}
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State Modal for initial setup */}
      {isHydrated && Array.isArray(links) && Array.isArray(qrCodes) && pageItems.length === 0 && !showAddForm && (
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
                      disabled={!planUsage.links.canCreate}
                      className={`h-20 flex-col space-y-2 text-white hover:scale-105 transition-transform border border-gray-200 shadow-sm ${
                        planUsage.links.canCreate ? platform.color : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                      <span className="text-xs font-medium">{platform.name}</span>
                    </Button>
                  )
                })}
              </div>
              
              <Button
                onClick={handleCustomLinkClick}
                disabled={!planUsage.links.canCreate}
                className={`mt-6 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                  planUsage.links.canCreate 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
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
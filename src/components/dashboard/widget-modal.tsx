'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  X,
  Search,
  Link,
  Image as ImageIcon,
  Type,
  Package,
  Smartphone,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Github,
  Music,
  Mic,
  Globe,
  ArrowRight
} from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { Widget } from './appearance-customizer'
import { toast } from 'sonner'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'

interface WidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (widget: Widget) => void
  socialLinks: Database['public']['Tables']['social_media_links']['Row'][]
  links: Database['public']['Tables']['links']['Row'][]
  userTier?: Database['public']['Enums']['user_tier']
  defaultType?: string | null
}

const socialPlatforms = [
  { name: 'Instagram', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', value: 'instagram', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500', baseUrl: 'https://instagram.com/' },
  { name: 'Facebook', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg', value: 'facebook', color: 'bg-blue-600', baseUrl: 'https://facebook.com/' },
  { name: 'TikTok', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', value: 'tiktok', color: 'bg-black', baseUrl: 'https://tiktok.com/@' },
  { name: 'LinkedIn', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', value: 'linkedin', color: 'bg-blue-700', baseUrl: 'https://linkedin.com/in/' },
  { name: 'YouTube', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', value: 'youtube', color: 'bg-red-500', baseUrl: 'https://youtube.com/@' },
  { name: 'X (Twitter)', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg', value: 'twitter', color: 'bg-black', baseUrl: 'https://x.com/' },
  { name: 'GitHub', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', value: 'github', color: 'bg-gray-800', baseUrl: 'https://github.com/' },
  { name: 'Website', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg', value: 'website', color: 'bg-blue-500', baseUrl: '' },
]

const essentialWidgets = [
  { name: 'Link', icon: Link, value: 'link', description: 'Add an external link', color: 'bg-blue-500' },
  { name: 'Text', icon: Type, value: 'text', description: 'Add a free text block', color: 'bg-gray-600' },
  { name: 'Photo / Video', icon: ImageIcon, value: 'media', description: 'Show an image or video on your page', color: 'bg-green-500' },
  { name: 'Voice', icon: Mic, value: 'voice', description: 'Add a voice message', color: 'bg-purple-500' },
  { name: 'Product', icon: Package, value: 'product', description: 'Highlight a product', color: 'bg-orange-500' },
]

const qrCodePlatforms = [
  { name: 'Instagram', icon: Instagram, value: 'instagram', color: 'bg-gradient-to-r from-purple-600 to-pink-600', baseUrl: 'https://instagram.com/' },
  { name: 'TikTok', icon: Package, value: 'tiktok', color: 'bg-black', baseUrl: 'https://tiktok.com/@' },
  { name: 'YouTube', icon: Youtube, value: 'youtube', color: 'bg-red-600', baseUrl: 'https://youtube.com/' },
  { name: 'Twitter/X', icon: Twitter, value: 'x', color: 'bg-black', baseUrl: 'https://x.com/' },
  { name: 'LinkedIn', icon: Linkedin, value: 'linkedin', color: 'bg-blue-600', baseUrl: 'https://linkedin.com/in/' },
  { name: 'Spotify', icon: Music, value: 'spotify', color: 'bg-green-500', baseUrl: 'https://open.spotify.com/' },
  { name: 'GitHub', icon: Github, value: 'github', color: 'bg-gray-800', baseUrl: 'https://github.com/' },
  { name: 'Website', icon: Globe, value: 'website', color: 'bg-blue-500', baseUrl: 'https://' },
]

export function WidgetModal({ isOpen, onClose, onAddWidget, socialLinks, links, userTier = 'free', defaultType = null }: WidgetModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [showDetailsPage, setShowDetailsPage] = useState(false)
  const [widgetData, setWidgetData] = useState<{
    platform?: string
    username?: string
    url?: string
    title?: string
    type?: string
    baseUrl?: string
    content?: string
    caption?: string
    file?: File
    price?: string
    appStoreUrl?: string
    playStoreUrl?: string
    customLogoUrl?: string
  }>({})

  // Handle defaultType from dashboard
  React.useEffect(() => {
    if (defaultType && isOpen) {
      if (defaultType === 'link') {
        setSelectedWidget('essential_link')
        setWidgetData({ type: 'link', title: '', url: '' })
        setShowDetailsPage(true)
      } else if (defaultType === 'deeplink') {
        setSelectedWidget('essential_deeplink')
        setWidgetData({ type: 'deeplink', title: '', url: '' })
        setShowDetailsPage(true)
      } else if (defaultType === 'qr_code') {
        // For QR codes, don't auto-select - show the QR code section
        setShowDetailsPage(false)
        // Scroll to QR codes section after a brief delay
        setTimeout(() => {
          const qrSection = document.querySelector('[data-section="qr-codes"]')
          if (qrSection) {
            qrSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }, [defaultType, isOpen])

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedWidget(null)
      setWidgetData({})
      setShowDetailsPage(false)
      setSearchTerm('')
      setIsConverting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddWidget = async () => {
    if (!selectedWidget) return

    // Handle Linktree conversion
    if (selectedWidget === 'convert_linktree') {
      if (!widgetData.url) {
        toast.error('Please enter a Linktree URL')
        return
      }
      
      try {
        setIsConverting(true)

        // Call the API to convert Linktree
        const response = await fetch('/api/convert-linktree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: widgetData.url }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to convert Linktree')
        }

        const { links } = await response.json()

        if (!links || links.length === 0) {
          toast.error('No links found in the Linktree page. Please check the URL and try again.')
          return
        }

        // Check plan limits before starting import
        const activeLinksCount = links.filter((link: Database['public']['Tables']['links']['Row']) => link && link.is_active !== false).length
        const planLimits = userTier === 'pro' ? 50 : 5
        const remainingSlots = planLimits - activeLinksCount
        
        if (remainingSlots <= 0) {
          toast.error(`You've reached the maximum number of links (${planLimits}) for your ${userTier} plan.`)
          return
        }

        // Create widgets for each link found (up to remaining slots)
        let widgetCount = 0
        let successfulImports = 0
        const linksToImport = links.slice(0, remainingSlots)
        
        for (const link of linksToImport) {
          const widget: Widget = {
            id: `${Date.now()}-${widgetCount}`,
            type: link.platform ? 'social' : 'link',
            size: 'large-square',
            data: {
              title: link.title,
              url: link.url,
              platform: link.platform,
              username: link.username,
              description: `Imported from Linktree`,
            },
            position: { x: 20, y: 20 + (widgetCount * 180) },
            webPosition: { x: 20, y: 20 + (widgetCount * 180) },
            mobilePosition: { x: 20, y: 20 + (widgetCount * 180) }
          }

          onAddWidget(widget)
          widgetCount++
          successfulImports++
        }
        
        // Show warning if some links couldn't be imported due to limits
        if (links.length > remainingSlots) {
          toast.warning(`Successfully imported ${successfulImports} links. ${links.length - remainingSlots} links couldn't be imported due to plan limits.`)
        }

        if (successfulImports > 0) {
          toast.success(`Successfully imported ${successfulImports} links from Linktree!`)
        }
      } catch (error) {
        console.error('Linktree conversion error:', error)
        toast.error(`Failed to import from Linktree: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return
      } finally {
        setIsConverting(false)
      }
    } else if (selectedWidget.startsWith('qr_')) {
      // Handle QR code widget creation
      if (!widgetData.url) {
        toast.error('Please enter a URL for the QR code')
        return
      }

      // Create QR code via API
      try {
        const response = await fetch('/api/links/qr-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: widgetData.title || `${widgetData.platform} QR Code`,
            url: widgetData.url,
            size: 200,
            format: 'PNG',
            errorCorrection: 'H',
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF',
            platform: widgetData.platform,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create QR code')
        }

        const result = await response.json()
        if (result.success && result.data.qrCode) {
          // Create a widget for the QR code so it appears in the customizer
          const qrWidget: Widget = {
            id: result.data.qrCode.id, // Use the actual database ID
            type: 'qr_code',
            size: 'small-square',
            data: {
              title: widgetData.title || `${widgetData.platform} QR Code`,
              url: widgetData.url,
              platform: widgetData.platform,
              description: `QR Code with ${widgetData.platform} logo`,
              qr_code_data: result.data.qrCode.qr_code_data,
              format: result.data.qrCode.format,
              size: result.data.qrCode.qr_size,
              foreground_color: result.data.qrCode.foreground_color,
              background_color: result.data.qrCode.background_color,
            },
            position: { x: 0, y: 0 },
            webPosition: { x: 0, y: 0 },
            mobilePosition: { x: 0, y: 0 }
          }

          onAddWidget(qrWidget)
          toast.success('QR code created successfully!')
        } else {
          throw new Error('Failed to create QR code')
        }
      } catch (error) {
        console.error('QR code creation error:', error)
        toast.error(`Failed to create QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else {
      // Handle normal widget creation
      const widget: Widget = {
        id: Date.now().toString(),
        type: (selectedWidget.startsWith('social') || selectedWidget.startsWith('music') ? 'social' : 
              selectedWidget.startsWith('essential') ? widgetData.type || 'link' : 'link') as Widget['type'],
        size: 'small-square',
        data: {
          ...widgetData,
          platform: widgetData.platform,
          username: widgetData.username,
          url: widgetData.url,
          title: widgetData.username ? `@${widgetData.username}` : widgetData.title || widgetData.platform
        },
        position: { x: 0, y: 0 },
        webPosition: { x: 0, y: 0 },
        mobilePosition: { x: 0, y: 0 }
      }

      onAddWidget(widget)
    }

    onClose()
    // Reset form
    setSelectedWidget(null)
    setWidgetData({})
    setIsConverting(false)
  }

  const handleSocialSelect = (platform: string) => {
    const selectedPlatform = socialPlatforms.find(p => p.value === platform)
    setSelectedWidget(`social_${platform}`)
    setWidgetData({ 
      platform, 
      username: '', 
      url: selectedPlatform?.baseUrl || 'https://',
      baseUrl: selectedPlatform?.baseUrl || 'https://' 
    })
    setShowDetailsPage(true)
  }

  const handleEssentialSelect = (type: string) => {
    setSelectedWidget(`essential_${type}`)
    setWidgetData({ type, title: '', url: '' })
    setShowDetailsPage(true)
  }

  const handleQRSelect = (platform: string) => {
    const selectedPlatform = qrCodePlatforms.find(p => p.value === platform)
    setSelectedWidget(`qr_${platform}`)
    setWidgetData({ 
      platform: platform,
      title: selectedPlatform?.name || platform,
      url: selectedPlatform?.baseUrl || 'https://',
      baseUrl: selectedPlatform?.baseUrl || 'https://'
    })
    setShowDetailsPage(true)
  }

  const handleMusicSelect = (platform: string) => {
    const musicPlatforms = [
      { name: 'Spotify', value: 'spotify', baseUrl: 'https://open.spotify.com/user/' },
      { name: 'Apple Music', value: 'apple_music', baseUrl: 'https://music.apple.com/profile/' },
      { name: 'SoundCloud', value: 'soundcloud', baseUrl: 'https://soundcloud.com/' },
      { name: 'Podcast', value: 'podcast', baseUrl: '' },
    ]
    const selectedPlatform = musicPlatforms.find(p => p.value === platform)
    setSelectedWidget(`music_${platform}`)
    setWidgetData({ 
      platform: platform, 
      username: '', 
      url: selectedPlatform?.baseUrl || 'https://',
      baseUrl: selectedPlatform?.baseUrl || 'https://' 
    })
    setShowDetailsPage(true)
  }

  const handleBackToSelection = () => {
    setShowDetailsPage(false)
    setSelectedWidget(null)
    setWidgetData({})
  }

  const filteredSocial = socialPlatforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEssentials = essentialWidgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {showDetailsPage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToSelection}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back
              </Button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {showDetailsPage ? 'Configure Widget' : 'Add a widget'}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-black hover:text-black">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {showDetailsPage ? (
          /* Details Page */
          <div className="p-6 overflow-y-auto h-[calc(90vh-200px)]">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedWidget?.startsWith('qr_') ? 'Create QR Code' :
                   selectedWidget?.startsWith('social_') ? 'Add Social Link' :
                   selectedWidget?.startsWith('music_') ? 'Add Music Link' :
                   selectedWidget?.includes('deeplink') ? 'Create Deep Link' :
                   'Add Link'}
                </h3>
                <p className="text-gray-600">
                  {selectedWidget?.startsWith('qr_') ? 'Create a QR code with platform branding' :
                   selectedWidget?.startsWith('social_') ? 'Connect your social media profile' :
                   selectedWidget?.startsWith('music_') ? 'Share your music profile' :
                   selectedWidget?.includes('deeplink') ? 'Create a link that redirects to your app' :
                   'Add a custom link to your profile'}
                </p>
              </div>

              {/* Details Form */}
              <div className="space-y-4">
                {selectedWidget?.includes('deeplink') ? (
                  /* Deeplink Configuration */
                  <>
                    <div>
                      <Label htmlFor="app-name" className="text-gray-900">App Name</Label>
                      <Input
                        id="app-name"
                        placeholder="My App"
                        value={widgetData.title || ''}
                        onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ios-url" className="text-gray-900">iOS App URL</Label>
                      <Input
                        id="ios-url"
                        placeholder="https://apps.apple.com/app/your-app"
                        value={widgetData.appStoreUrl || ''}
                        onChange={(e) => setWidgetData({...widgetData, appStoreUrl: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        App Store URL for iOS users
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="android-url" className="text-gray-900">Android App URL</Label>
                      <Input
                        id="android-url"
                        placeholder="https://play.google.com/store/apps/details?id=your.app"
                        value={widgetData.playStoreUrl || ''}
                        onChange={(e) => setWidgetData({...widgetData, playStoreUrl: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Play Store URL for Android users
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="fallback-url" className="text-gray-900">Fallback URL</Label>
                      <Input
                        id="fallback-url"
                        placeholder="https://yourwebsite.com"
                        value={widgetData.url || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL for users who don't have the app installed
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">How Deeplinks Work</h4>
                      <p className="text-sm text-blue-800">
                        Deeplinks automatically detect the user's device and redirect them to:
                      </p>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• iOS App Store if on iPhone/iPad</li>
                        <li>• Google Play Store if on Android</li>
                        <li>• Fallback URL for other devices</li>
                      </ul>
                    </div>
                  </>
                ) : selectedWidget?.startsWith('qr_') ? (
                  /* QR Code Configuration */
                  <>
                    <div>
                      <Label htmlFor="qr-title" className="text-gray-900">QR Code Title</Label>
                      <Input
                        id="qr-title"
                        placeholder="My QR Code"
                        value={widgetData.title || ''}
                        onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="qr-url" className="text-gray-900">
                        {widgetData.platform === 'website' ? 'Website URL' : 
                         widgetData.platform === 'instagram' ? 'Instagram Profile URL' :
                         widgetData.platform === 'tiktok' ? 'TikTok Profile URL' :
                         widgetData.platform === 'youtube' ? 'YouTube Channel URL' :
                         widgetData.platform === 'x' ? 'X (Twitter) Profile URL' :
                         widgetData.platform === 'linkedin' ? 'LinkedIn Profile URL' :
                         widgetData.platform === 'spotify' ? 'Spotify Profile URL' :
                         widgetData.platform === 'github' ? 'GitHub Profile URL' :
                         'URL'}
                      </Label>
                      <Input
                        id="qr-url"
                        placeholder={
                          widgetData.platform === 'website' ? 'https://yourwebsite.com' :
                          widgetData.platform === 'instagram' ? 'https://instagram.com/yourusername' :
                          widgetData.platform === 'tiktok' ? 'https://tiktok.com/@yourusername' :
                          widgetData.platform === 'youtube' ? 'https://youtube.com/@yourchannel' :
                          widgetData.platform === 'x' ? 'https://x.com/yourusername' :
                          widgetData.platform === 'linkedin' ? 'https://linkedin.com/in/yourprofile' :
                          widgetData.platform === 'spotify' ? 'https://open.spotify.com/user/yourusername' :
                          widgetData.platform === 'github' ? 'https://github.com/yourusername' :
                          'https://...'
                        }
                        value={widgetData.url || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                    </div>

                    {/* Custom Logo Upload for QR Codes on Pro Plan */}
                    {userTier === 'pro' && (
                      <div>
                        <Label htmlFor="custom-logo" className="text-gray-900">Custom Logo (Pro)</Label>
                        <Input
                          id="custom-logo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // TODO: Upload file and set URL
                              console.log('Custom logo file:', file)
                            }
                          }}
                          className="text-gray-900 bg-white"
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          Upload a custom logo for your QR code (recommended: 200x200px, replaces platform logo)
                        </p>
                      </div>
                    )}

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Platform Logo Included</h4>
                      <p className="text-sm text-green-800">
                        Your QR code will automatically include the {widgetData.platform === 'x' ? 'X (Twitter)' : 
                        widgetData.platform?.charAt(0).toUpperCase() + widgetData.platform?.slice(1)} logo 
                        {userTier === 'pro' ? ', or upload a custom logo above to replace it.' : '.'}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Standard Link Configuration */
                  <>
                    <div>
                      <Label htmlFor="title" className="text-gray-900">Title</Label>
                      <Input
                        id="title"
                        placeholder="Link title"
                        value={widgetData.title || ''}
                        onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url" className="text-gray-900">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://..."
                        value={widgetData.url || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                    </div>
                    {selectedWidget?.startsWith('social_') && (
                      <div>
                        <Label htmlFor="username" className="text-gray-900">Username</Label>
                        <Input
                          id="username"
                          placeholder="yourusername"
                          value={widgetData.username || ''}
                          onChange={(e) => {
                            const username = e.target.value
                            const baseUrl = widgetData.baseUrl || ''
                            const constructedUrl = username ? baseUrl + username : baseUrl
                            setWidgetData({...widgetData, username, url: constructedUrl})
                          }}
                          className="text-gray-900 bg-white"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button 
                onClick={handleAddWidget} 
                className="w-full"
                disabled={isConverting}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {isConverting ? 'Creating...' : 'Add Widget'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(90vh-200px)]">
            {/* Left Side - Widget Selection */}
            <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Convert from another tool */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Convert from another tool</h3>
                <Card className="cursor-pointer bg-white hover:bg-gray-50 transition-colors border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">LT</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Linktree</div>
                        <div className="text-sm text-gray-500">Linktree, Beacons & other</div>
                        <div className="text-sm text-gray-500">Transform your existing bio link into tapLink and offer an immersive experience to your visitors with our widgets</div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          setSelectedWidget('convert_linktree')
                          setWidgetData({ 
                            type: 'convert',
                            title: 'Import from Linktree',
                            url: ''
                          })
                        }}
                      >
                        Convert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Existing Links & QR Codes */}
              {(links && links.length > 0) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Your Existing Links</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Active Links */}
                    {links.filter(link => link && link.is_active).map((link) => (
                      <Card
                        key={link.id}
                        className="cursor-pointer bg-white hover:bg-gray-50 transition-colors border border-gray-200"
                        onClick={() => {
                          // Check plan limits before creating widget
                          const canCreate = checkCanCreateLink(links.filter(link => link), 'link_in_bio', userTier)
                          
                          if (!canCreate.canCreate) {
                            toast.error(canCreate.reason || 'Cannot create widget')
                            return
                          }

                          const widget: Widget = {
                            id: `existing-${link.id}`,
                            type: 'link',
                            size: 'small-square',
                            data: {
                              title: link.title || link.url,
                              url: link.url,
                              description: link.link_type === 'qr_code' ? 'QR Code Link' : link.link_type === 'deeplink' ? 'Deep Link' : 'Link'
                            },
                            position: { x: 0, y: 0 },
                            webPosition: { x: 0, y: 0 },
                            mobilePosition: { x: 0, y: 0 }
                          }
                          onAddWidget(widget)
                          onClose()
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                link.link_type === 'qr_code' ? 'bg-green-500' : 
                                link.link_type === 'deeplink' ? 'bg-blue-500' : 'bg-gray-500'
                              }`}>
                                {link.link_type === 'qr_code' ? (
                                  <Package className="w-4 h-4 text-white" />
                                ) : (
                                  <Link className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{link.title || 'Untitled Link'}</div>
                                <div className="text-sm text-gray-500">
                                  {link.link_type === 'qr_code' ? 'QR Code' : 
                                   link.link_type === 'deeplink' ? 'Deep Link' : 'Link'}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Inactive Links */}
                    {links.filter(link => link && !link.is_active).length > 0 && (
                      <>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Inactive Links</h4>
                          <p className="text-xs text-gray-500 mb-3">These links are currently inactive and cannot be added to your page.</p>
                        </div>
                        {links.filter(link => link && !link.is_active).map((link) => (
                          <Card
                            key={link.id}
                            className="cursor-not-allowed bg-gray-50 border border-gray-200 opacity-60"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                    link.link_type === 'qr_code' ? 'bg-gray-400' : 
                                    link.link_type === 'deeplink' ? 'bg-gray-400' : 'bg-gray-400'
                                  }`}>
                                    {link.link_type === 'qr_code' ? (
                                      <Package className="w-4 h-4 text-white" />
                                    ) : (
                                      <Link className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-600">{link.title || 'Untitled Link'}</div>
                                    <div className="text-sm text-gray-400">
                                      {link.link_type === 'qr_code' ? 'QR Code' : 
                                       link.link_type === 'deeplink' ? 'Deep Link' : 'Link'} - Inactive
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  disabled
                                  className="bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                >
                                  Inactive
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Essentials */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Essentials</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredEssentials.map((widget) => (
                    <Card
                      key={widget.value}
                      className={`cursor-pointer bg-white hover:bg-gray-50 transition-colors border ${
                        selectedWidget === `essential_${widget.value}` ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => handleEssentialSelect(widget.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${widget.color} rounded flex items-center justify-center`}>
                              <widget.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{widget.name}</div>
                              <div className="text-sm text-gray-500">{widget.description}</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Social Networks */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Social Networks</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredSocial.map((platform) => (
                    <Card
                      key={platform.value}
                      className={`cursor-pointer bg-white hover:bg-gray-50 transition-colors border ${
                        selectedWidget === `social_${platform.value}` ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => handleSocialSelect(platform.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${platform.color} rounded flex items-center justify-center p-1.5`}>
                              <img 
                                src={platform.logoUrl} 
                                alt={`${platform.name} logo`}
                                className="w-full h-full object-contain filter invert brightness-0 contrast-100"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <div className="w-full h-full items-center justify-center text-white text-xs font-bold hidden">
                                {platform.name.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{platform.name}</div>
                              <div className="text-sm text-gray-500">
                                {platform.value === 'instagram' && 'Invite to follow you on Instagram'}
                                {platform.value === 'facebook' && 'Add your Facebook profile or page'}
                                {platform.value === 'tiktok' && 'Share your TikTok profile'}
                                {platform.value === 'linkedin' && 'Share your LinkedIn profile'}
                                {platform.value === 'youtube' && 'Redirect to your YouTube channel'}
                                {platform.value === 'twitter' && 'Let people discover your X account'}
                                {platform.value === 'github' && 'Share your GitHub profile'}
                                {platform.value === 'website' && 'Link to your website'}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* QR Codes with Platform Logos */}
              <div data-section="qr-codes">
                <h3 className="font-medium text-gray-900 mb-3">QR Codes with Platform Logos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {qrCodePlatforms.map((platform) => (
                    <Card
                      key={platform.value}
                      className={`cursor-pointer bg-white hover:bg-gray-50 transition-colors border ${
                        selectedWidget === `qr_${platform.value}` ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => handleQRSelect(platform.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${platform.color} rounded flex items-center justify-center`}>
                              <platform.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{platform.name} QR</div>
                              <div className="text-sm text-gray-500">QR code with {platform.name} logo</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Music & Podcasts */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Music & Podcasts</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Spotify', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg', value: 'spotify', color: 'bg-green-500', baseUrl: 'https://open.spotify.com/user/' },
                    { name: 'Apple Music', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applemusic.svg', value: 'apple_music', color: 'bg-red-500', baseUrl: 'https://music.apple.com/profile/' },
                    { name: 'SoundCloud', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/soundcloud.svg', value: 'soundcloud', color: 'bg-orange-500', baseUrl: 'https://soundcloud.com/' },
                    { name: 'Podcast', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/podcast.svg', value: 'podcast', color: 'bg-purple-500', baseUrl: '' },
                  ].map((platform) => (
                    <Card
                      key={platform.value}
                      className={`cursor-pointer bg-white hover:bg-gray-50 transition-colors border ${
                        selectedWidget === `music_${platform.value}` ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => handleMusicSelect(platform.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${platform.color} rounded flex items-center justify-center p-1.5`}>
                              <img 
                                src={platform.logoUrl} 
                                alt={`${platform.name} logo`}
                                className="w-full h-full object-contain filter invert brightness-0 contrast-100"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              <div className="w-full h-full items-center justify-center text-white text-xs font-bold hidden">
                                {platform.name.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{platform.name}</div>
                              <div className="text-sm text-gray-500">Connect your music</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


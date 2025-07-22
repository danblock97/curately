'use client'

import { useState } from 'react'
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

export function WidgetModal({ isOpen, onClose, onAddWidget, socialLinks, links, userTier = 'free' }: WidgetModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
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
  }>({})

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
        const activeLinksCount = links.filter(link => link.is_active !== false).length
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
    } else {
      // Handle normal widget creation
      const widget: Widget = {
        id: Date.now().toString(),
        type: selectedWidget.startsWith('social') || selectedWidget.startsWith('music') ? 'social' : 
              selectedWidget.startsWith('essential') ? widgetData.type || 'link' : 'link',
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
  }

  const handleEssentialSelect = (type: string) => {
    setSelectedWidget(`essential_${type}`)
    setWidgetData({ type, title: '', url: '' })
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
          <h2 className="text-xl font-semibold text-gray-900">Add a widget</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-black hover:text-black">
            <X className="w-4 h-4" />
          </Button>
        </div>

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
                    {links.filter(link => link.is_active).map((link) => (
                      <Card
                        key={link.id}
                        className="cursor-pointer bg-white hover:bg-gray-50 transition-colors border border-gray-200"
                        onClick={() => {
                          // Check plan limits before creating widget
                          const canCreate = checkCanCreateLink(links, 'link_in_bio', userTier)
                          
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
                    {links.filter(link => !link.is_active).length > 0 && (
                      <>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Inactive Links</h4>
                          <p className="text-xs text-gray-500 mb-3">These links are currently inactive and cannot be added to your page.</p>
                        </div>
                        {links.filter(link => !link.is_active).map((link) => (
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
                      onClick={() => {
                        setSelectedWidget(`music_${platform.value}`)
                        setWidgetData({ 
                          platform: platform.value, 
                          username: '', 
                          url: platform.baseUrl || 'https://',
                          baseUrl: platform.baseUrl || 'https://' 
                        })
                      }}
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

          {/* Right Side - Widget Configuration */}
          {selectedWidget && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Configure Widget</h3>
                
                {(selectedWidget.startsWith('social_') || selectedWidget.startsWith('music_')) && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-900">
                        {widgetData.platform === 'website' ? 'Domain' : widgetData.platform === 'podcast' ? 'Podcast Name' : 'Username'}
                      </Label>
                      <Input
                        id="username"
                        placeholder={widgetData.platform === 'website' ? 'example.com' : widgetData.platform === 'podcast' ? 'My Podcast' : 'username'}
                        value={widgetData.username || ''}
                        onChange={(e) => {
                          const username = e.target.value
                          const baseUrl = widgetData.baseUrl || ''
                          let constructedUrl = ''
                          
                          if (widgetData.platform === 'website') {
                            constructedUrl = username ? `https://${username}` : 'https://'
                          } else if (widgetData.platform === 'podcast') {
                            constructedUrl = username
                          } else {
                            constructedUrl = username ? baseUrl + username : baseUrl
                          }
                          
                          setWidgetData({...widgetData, username, url: constructedUrl})
                        }}
                        className="text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url" className="text-gray-900">Profile URL</Label>
                      <Input
                        id="url"
                        placeholder="https://..."
                        value={widgetData.url || widgetData.baseUrl || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                        readOnly={widgetData.platform !== 'website' && widgetData.platform !== 'podcast'}
                        className={`text-gray-900 ${widgetData.platform !== 'website' && widgetData.platform !== 'podcast' ? 'bg-gray-100' : 'bg-white'}`}
                      />
                      {widgetData.platform !== 'website' && widgetData.platform !== 'podcast' && (
                        <p className="text-xs text-gray-500 mt-1">
                          URL is automatically generated based on username
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedWidget.startsWith('essential_') && (
                  <div className="space-y-4">
                    {widgetData.type === 'text' ? (
                      <div>
                        <Label htmlFor="text-content" className="text-gray-900">Text Content</Label>
                        <Textarea
                          id="text-content"
                          placeholder="Enter your text content..."
                          value={widgetData.content || ''}
                          onChange={(e) => setWidgetData({...widgetData, content: e.target.value, title: e.target.value})}
                          className="text-gray-900 bg-white"
                          rows={3}
                        />
                      </div>
                    ) : widgetData.type === 'media' ? (
                      <>
                        <div>
                          <Label htmlFor="media-file" className="text-gray-900">Upload Image/Video</Label>
                          <Input
                            id="media-file"
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setWidgetData({...widgetData, file, title: file.name})
                              }
                            }}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="media-caption" className="text-gray-900">Caption (Optional)</Label>
                          <Input
                            id="media-caption"
                            placeholder="Add a caption..."
                            value={widgetData.caption || ''}
                            onChange={(e) => setWidgetData({...widgetData, caption: e.target.value})}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                      </>
                    ) : widgetData.type === 'voice' ? (
                      <div>
                        <Label htmlFor="voice-file" className="text-gray-900">Upload Voice Message</Label>
                        <Input
                          id="voice-file"
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setWidgetData({...widgetData, file, title: file.name})
                            }
                          }}
                          className="text-gray-900 bg-white"
                        />
                      </div>
                    ) : widgetData.type === 'product' ? (
                      <>
                        <div>
                          <Label htmlFor="product-name" className="text-gray-900">Product Name</Label>
                          <Input
                            id="product-name"
                            placeholder="Product name"
                            value={widgetData.title || ''}
                            onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-url" className="text-gray-900">Product URL</Label>
                          <Input
                            id="product-url"
                            placeholder="https://..."
                            value={widgetData.url || ''}
                            onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-price" className="text-gray-900">Price (Optional)</Label>
                          <Input
                            id="product-price"
                            placeholder="$99.99"
                            value={widgetData.price || ''}
                            onChange={(e) => setWidgetData({...widgetData, price: e.target.value})}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                      </>
                    ) : widgetData.type === 'app' ? (
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
                          <Label htmlFor="app-store-url" className="text-gray-900">App Store URL</Label>
                          <Input
                            id="app-store-url"
                            placeholder="https://apps.apple.com/..."
                            value={widgetData.appStoreUrl || ''}
                            onChange={(e) => setWidgetData({...widgetData, appStoreUrl: e.target.value})}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="play-store-url" className="text-gray-900">Play Store URL</Label>
                          <Input
                            id="play-store-url"
                            placeholder="https://play.google.com/..."
                            value={widgetData.playStoreUrl || ''}
                            onChange={(e) => setWidgetData({...widgetData, playStoreUrl: e.target.value})}
                            className="text-gray-900 bg-white"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="title" className="text-gray-900">Title</Label>
                          <Input
                            id="title"
                            placeholder="Widget title"
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
                      </>
                    )}
                  </div>
                )}

                {selectedWidget === 'convert_linktree' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="linktree-url" className="text-gray-900">Linktree URL</Label>
                      <Input
                        id="linktree-url"
                        placeholder="https://linktr.ee/yourusername"
                        value={widgetData.url || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                        className="text-gray-900 bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your Linktree URL to import your links
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This will fetch your public links from Linktree and convert them to widgets. Your existing widgets will remain unchanged.
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleAddWidget} 
                  className="w-full"
                  disabled={isConverting}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {isConverting ? 'Converting...' : 
                   selectedWidget === 'convert_linktree' ? 'Import Links' : 'Add Widget'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
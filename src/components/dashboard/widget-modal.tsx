'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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

interface WidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (widget: Widget) => void
  socialLinks: Database['public']['Tables']['social_media_links']['Row'][]
  links: Database['public']['Tables']['links']['Row'][]
}

const socialPlatforms = [
  { name: 'Instagram', icon: Instagram, value: 'instagram', color: 'bg-pink-500' },
  { name: 'Facebook', icon: Facebook, value: 'facebook', color: 'bg-blue-600' },
  { name: 'TikTok', icon: Music, value: 'tiktok', color: 'bg-gray-800' },
  { name: 'LinkedIn', icon: Linkedin, value: 'linkedin', color: 'bg-blue-700' },
  { name: 'YouTube', icon: Youtube, value: 'youtube', color: 'bg-red-500' },
  { name: 'X (Twitter)', icon: Twitter, value: 'twitter', color: 'bg-gray-700' },
  { name: 'GitHub', icon: Github, value: 'github', color: 'bg-gray-800' },
  { name: 'Website', icon: Globe, value: 'website', color: 'bg-blue-500' },
]

const essentialWidgets = [
  { name: 'Link', icon: Link, value: 'link', description: 'Add an external link', color: 'bg-blue-500' },
  { name: 'Voice', icon: Mic, value: 'voice', description: 'Add a voice message', color: 'bg-purple-500' },
  { name: 'Photo / Video', icon: ImageIcon, value: 'media', description: 'Show an image or video on your page', color: 'bg-green-500' },
  { name: 'Text', icon: Type, value: 'text', description: 'Add a free text block', color: 'bg-gray-600' },
  { name: 'Product', icon: Package, value: 'product', description: 'Highlight a product', color: 'bg-orange-500' },
  { name: 'One Link (App)', icon: Smartphone, value: 'app', description: 'A single link that redirects to App Store or Play Store', color: 'bg-indigo-500' },
]

export function WidgetModal({ isOpen, onClose, onAddWidget }: WidgetModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [widgetData, setWidgetData] = useState<{
    platform?: string
    username?: string
    url?: string
    title?: string
    type?: string
  }>({})

  if (!isOpen) return null

  const handleAddWidget = () => {
    if (!selectedWidget) return

    const widget: Widget = {
      id: Date.now().toString(),
      type: selectedWidget.startsWith('social') ? 'social' : 'link',
      size: 'thin',
      data: widgetData,
      position: { x: 0, y: 0 },
      webPosition: { x: 0, y: 0 },
      mobilePosition: { x: 0, y: 0 }
    }

    onAddWidget(widget)
    onClose()
  }

  const handleSocialSelect = (platform: string) => {
    setSelectedWidget(`social_${platform}`)
    setWidgetData({ platform, username: '', url: '' })
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
          <Button variant="ghost" size="sm" onClick={onClose}>
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
                      <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                        Convert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
                            <div className={`w-8 h-8 ${platform.color} rounded flex items-center justify-center`}>
                              <platform.icon className="w-4 h-4 text-white" />
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
                    { name: 'Spotify', icon: Music, value: 'spotify', color: 'bg-green-500' },
                    { name: 'Apple Music', icon: Music, value: 'apple_music', color: 'bg-gray-700' },
                    { name: 'SoundCloud', icon: Music, value: 'soundcloud', color: 'bg-orange-500' },
                    { name: 'Podcast', icon: Mic, value: 'podcast', color: 'bg-purple-500' },
                  ].map((platform) => (
                    <Card
                      key={platform.value}
                      className={`cursor-pointer bg-white hover:bg-gray-50 transition-colors border ${
                        selectedWidget === `music_${platform.value}` ? 'ring-2 ring-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => handleSocialSelect(platform.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${platform.color} rounded flex items-center justify-center`}>
                              <platform.icon className="w-4 h-4 text-white" />
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

              <div className="text-center">
                <Button variant="link" className="text-green-600">
                  See more
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Widget Configuration */}
          {selectedWidget && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Configure Widget</h3>
                
                {selectedWidget.startsWith('social_') && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="@username"
                        value={widgetData.username || ''}
                        onChange={(e) => setWidgetData({...widgetData, username: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">Profile URL</Label>
                      <Input
                        id="url"
                        placeholder="https://..."
                        value={widgetData.url || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {selectedWidget.startsWith('essential_') && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Widget title"
                        value={widgetData.title || ''}
                        onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://..."
                        value={widgetData.url || ''}
                        onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <Button onClick={handleAddWidget} className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Add Widget
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
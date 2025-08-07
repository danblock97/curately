'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ArrowRight,
  Plus,
  Grid3X3,
  Star,
  Zap,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { Widget } from './appearance-customizer'
import { toast } from 'sonner'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'
import { createClient } from '@/lib/supabase/client'



interface WidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWidget: (widget: Widget) => void
  socialLinks: Database['public']['Tables']['social_media_links']['Row'][]
  links: Database['public']['Tables']['links']['Row'][]
  userTier?: Database['public']['Enums']['user_tier']
  defaultType?: string | null
  profile?: Database['public']['Tables']['profiles']['Row']
}

const platforms = [
  { name: 'Instagram', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', icon: Instagram, value: 'instagram', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500', baseUrl: 'https://www.instagram.com/' },
  { name: 'Facebook', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg', icon: Facebook, value: 'facebook', color: 'bg-blue-600', baseUrl: 'https://www.facebook.com/' },
  { name: 'TikTok', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', icon: Package, value: 'tiktok', color: 'bg-black', baseUrl: 'https://www.tiktok.com/@' },
  { name: 'LinkedIn', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', icon: Linkedin, value: 'linkedin', color: 'bg-blue-700', baseUrl: 'https://www.linkedin.com/in/' },
  { name: 'YouTube', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', icon: Youtube, value: 'youtube', color: 'bg-red-500', baseUrl: 'https://www.youtube.com/@' },
  { name: 'X (Twitter)', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg', icon: Twitter, value: 'twitter', color: 'bg-black', baseUrl: 'https://x.com/' },
  { name: 'GitHub', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', icon: Github, value: 'github', color: 'bg-gray-800', baseUrl: 'https://github.com/' },
  { name: 'Spotify', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg', icon: Music, value: 'spotify', color: 'bg-green-500', baseUrl: 'https://open.spotify.com/user/' },
  { name: 'Twitch', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitch.svg', icon: Package, value: 'twitch', color: 'bg-purple-600', baseUrl: 'https://www.twitch.tv/' },
  { name: 'Kick', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/kick.svg', icon: Package, value: 'kick', color: 'bg-green-600', baseUrl: 'https://kick.com/' },
  { name: 'Website', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg', icon: Globe, value: 'website', color: 'bg-blue-500', baseUrl: '' },
]

const essentialWidgets = [
  { name: 'Link', icon: Link, value: 'link', description: 'Add an external link', color: 'bg-blue-500' },
  { name: 'Text', icon: Type, value: 'text', description: 'Add a free text block', color: 'bg-gray-600' },
  { name: 'Photo / Video', icon: ImageIcon, value: 'media', description: 'Show an image or video on your page', color: 'bg-green-500' },
  { name: 'Voice', icon: Mic, value: 'voice', description: 'Add a voice message', color: 'bg-purple-500' },
  { name: 'Product', icon: Package, value: 'product', description: 'Highlight a product', color: 'bg-orange-500' },
]

const proWidgets = [
  { name: 'Twitch Stream', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitch.svg', value: 'twitch_embed', description: 'Embed your live Twitch stream', color: 'bg-purple-600' },
  { name: 'YouTube Live', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', value: 'youtube_live', description: 'Embed your live YouTube stream', color: 'bg-red-600' },
  { name: 'Kick Stream', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/kick.svg', value: 'kick_embed', description: 'Embed your live Kick stream', color: 'bg-green-600' },
]

export function WidgetModal({ isOpen, onClose, onAddWidget, socialLinks, links, userTier = 'free', defaultType = null, profile }: WidgetModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [showDetailsPage, setShowDetailsPage] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const supabase = createClient()
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
    logoFile?: string // Base64 encoded logo for API
    outputType?: 'link' | 'qr_code' // New field for output type selection
    profileImage?: string // For storing profile images from metadata
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
      // Clean up any preview URLs to avoid memory leaks
      if (widgetData.customLogoUrl && widgetData.customLogoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(widgetData.customLogoUrl)
      }
      setSelectedWidget(null)
      setWidgetData({})
      setShowDetailsPage(false)
      setSearchTerm('')
      setIsConverting(false)
    }
  }, [isOpen, widgetData.customLogoUrl])

  // Convert file to base64 for QR code API
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  };

  if (!isOpen) return null

  const handleAddWidget = async () => {
    if (!selectedWidget) return

    // Show loading state for widgets that need metadata
    if (selectedWidget === 'pro_twitch_embed' || selectedWidget === 'pro_kick_embed') {
      setIsConverting(true)
    }

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
    } else if (selectedWidget.startsWith('platform_') && widgetData.outputType === 'qr_code') {
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
            logoFile: widgetData.logoFile, // Include base64 logo for custom uploads
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
      // Handle normal widget creation (social links, essential widgets, and pro widgets)
      let finalWidgetData = { ...widgetData }


      // For widgets that support profile images, fetch metadata for larger sizes
      const supportedPlatforms = ['twitch', 'spotify', 'tiktok', 'youtube', 'kick']
      const platformForMetadata = selectedWidget === 'pro_twitch_embed' ? 'twitch' : selectedWidget === 'pro_kick_embed' ? 'kick' : widgetData.platform
      const widgetSize = selectedWidget === 'pro_twitch_embed' || selectedWidget === 'pro_youtube_live' || selectedWidget === 'pro_kick_embed' ? 'large-square' : 'small-square'
      
      // Use profile images for supported platforms regardless of widget size (except small-circle)
      const shouldUseProfileImage = widgetSize !== 'small-circle'
      
      if (shouldUseProfileImage && platformForMetadata && supportedPlatforms.includes(platformForMetadata) && (widgetData.username || widgetData.url)) {
        try {
          let profileUrl = ''
          
          // Construct profile URL based on platform
          if (platformForMetadata === 'twitch' && widgetData.username) {
            profileUrl = `https://www.twitch.tv/${widgetData.username}`
          } else if (platformForMetadata === 'kick' && widgetData.username) {
            profileUrl = `https://kick.com/${widgetData.username}`
          } else if (platformForMetadata === 'spotify' && widgetData.username) {
            profileUrl = `https://open.spotify.com/user/${widgetData.username}`
          } else if (platformForMetadata === 'tiktok' && widgetData.username) {
            profileUrl = `https://www.tiktok.com/@${widgetData.username}`
          } else if (platformForMetadata === 'youtube' && widgetData.username) {
            profileUrl = widgetData.username.startsWith('UC') || widgetData.username.length === 24
              ? `https://www.youtube.com/channel/${widgetData.username}`
              : `https://www.youtube.com/@${widgetData.username}`
          } else if (widgetData.url) {
            profileUrl = widgetData.url
          }
          
          if (profileUrl) {
            const metadataResponse = await fetch(`/api/metadata?url=${encodeURIComponent(profileUrl)}`)
            if (metadataResponse.ok) {
              const metadata = await metadataResponse.json()
              
              if (metadata.profileImage || metadata.image) {
                finalWidgetData.profileImage = metadata.profileImage || metadata.image;
              } else if (metadata.appLogo && metadata.isPopularApp) {
                // Use app logo as fallback for popular apps like Kick that don't provide profile images
                finalWidgetData.profileImage = metadata.appLogo;
              }
              
              // Also try to get display name for Spotify
              if (platformForMetadata === 'spotify' && metadata.displayName) {
                finalWidgetData.displayName = metadata.displayName;
                // Use display name as the title instead of @username for better UX
                finalWidgetData.title = metadata.displayName;
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch ${platformForMetadata} metadata in widget creation:`, error);
        }
      }

      const widget: Widget = {
        id: Date.now().toString(),
        type: (selectedWidget.startsWith('platform_') ? 'social' : 
              selectedWidget.startsWith('essential') ? widgetData.type || 'link' :
              selectedWidget === 'pro_twitch_embed' || selectedWidget === 'pro_youtube_live' || selectedWidget === 'pro_kick_embed' ? 'social' : 'link') as Widget['type'],
        size: selectedWidget === 'pro_twitch_embed' || selectedWidget === 'pro_youtube_live' || selectedWidget === 'pro_kick_embed' ? 'large-square' : 'small-square',
        data: {
          ...finalWidgetData,
          platform: widgetData.platform,
          username: widgetData.username,
          url: widgetData.url,
          title: finalWidgetData.displayName || finalWidgetData.title || (widgetData.username ? `@${widgetData.username}` : widgetData.title || widgetData.platform),
          // Map the metadata fields to the correct database column names
          display_name: finalWidgetData.displayName,
          profile_image_url: finalWidgetData.profileImage
        },
        position: { x: 0, y: 0 },
        webPosition: { x: 0, y: 0 },
        mobilePosition: { x: 0, y: 0 }
      }


      onAddWidget(widget)
    }

    // Reset loading state
    if (selectedWidget === 'pro_twitch_embed' || selectedWidget === 'pro_kick_embed') {
      setIsConverting(false)
    }

    onClose()
    // Reset form
    setSelectedWidget(null)
    setWidgetData({})
    setIsConverting(false)
  }

  const handlePlatformSelect = (platform: string) => {
    const selectedPlatform = platforms.find(p => p.value === platform)
    setSelectedWidget(`platform_${platform}`)
    setWidgetData({ 
      platform, 
      username: '', 
      url: selectedPlatform?.baseUrl || 'https://',
      baseUrl: selectedPlatform?.baseUrl || 'https://',
      outputType: 'link' // Default to link
    })
  }

  const handleEssentialSelect = (type: string) => {
    if (type === 'twitch_embed') {
      setSelectedWidget('pro_twitch_embed')
      setWidgetData({ type: 'twitch_embed', username: '', platform: 'twitch', url: '' })
    } else if (type === 'youtube_live') {
      setSelectedWidget('pro_youtube_live')
      setWidgetData({ type: 'youtube_live', username: '', platform: 'youtube', url: '' })
    } else if (type === 'kick_embed') {
      setSelectedWidget('pro_kick_embed')
      setWidgetData({ type: 'kick_embed', username: '', platform: 'kick', url: '' })
    } else {
      setSelectedWidget(`essential_${type}`)
      setWidgetData({ type, title: '', url: '' })
    }
  }

  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEssentials = essentialWidgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProWidgets = proWidgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] max-h-[80vh] overflow-hidden relative border border-gray-200 flex flex-col"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Modal Header */}
          <div className="border-b border-gray-100 bg-white">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {showDetailsPage && (
                  <motion.button
                    onClick={() => setShowDetailsPage(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                  </motion.button>
                )}
                <motion.div
                  className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {showDetailsPage ? 'Configure Widget' : 'Add Widget'}
                  </h1>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showDetailsPage ? (
              /* Configuration Form */
              <motion.div 
                key="configure"
                className="flex-1 overflow-y-auto"
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <div className="px-6 py-4">
                  <div className="max-w-lg mx-auto">
                    
                    {/* Form Header */}
                    <motion.div 
                      className="text-center mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {(() => {
                          if (selectedWidget?.startsWith('platform_')) {
                            const platform = platforms.find(p => p.value === widgetData.platform);
                            const IconComponent = platform?.icon || Globe;
                            return <IconComponent className="w-5 h-5 text-purple-600" />;
                          }
                          if (selectedWidget?.startsWith('essential_')) {
                            const widget = essentialWidgets.find(w => w.value === widgetData.type);
                            const IconComponent = widget?.icon || Link;
                            return <IconComponent className="w-5 h-5 text-purple-600" />;
                          }
                          if (selectedWidget?.includes('deeplink')) {
                            return <Smartphone className="w-5 h-5 text-purple-600" />;
                          }
                          if (selectedWidget === 'convert_linktree') {
                            return <Zap className="w-5 h-5 text-purple-600" />;
                          }
                          return <Link className="w-5 h-5 text-purple-600" />;
                        })()}
                      </motion.div>
                      <h2 className="text-base font-bold text-gray-900 mb-1">
                        {(() => {
                          if (selectedWidget?.startsWith('platform_')) {
                            const platform = platforms.find(p => p.value === widgetData.platform);
                            if (widgetData.outputType === 'qr_code') {
                              return `${platform?.name || 'Platform'} QR Code`;
                            }
                            return `Add ${platform?.name || 'Platform'} Link`;
                          }
                          if (selectedWidget?.startsWith('essential_')) {
                            const widget = essentialWidgets.find(w => w.value === widgetData.type);
                            return `Add ${widget?.name || 'Widget'}`;
                          }
                          if (selectedWidget?.includes('deeplink')) {
                            return 'Create Deep Link';
                          }
                          if (selectedWidget === 'convert_linktree') {
                            return 'Import from Linktree';
                          }
                          if (selectedWidget === 'pro_twitch_embed') {
                            return 'Add Twitch Stream';
                          }
                          if (selectedWidget === 'pro_youtube_live') {
                            return 'Add YouTube Live';
                          }
                          if (selectedWidget === 'pro_kick_embed') {
                            return 'Add Kick Stream';
                          }
                          return 'Add Widget';
                        })()}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {(() => {
                          if (selectedWidget?.startsWith('platform_')) {
                            const platform = platforms.find(p => p.value === widgetData.platform);
                            if (widgetData.outputType === 'qr_code') {
                              return `Generate a branded QR code for ${platform?.name || 'this platform'}`;
                            }
                            return `Connect your ${platform?.name || 'social'} profile`;
                          }
                          if (selectedWidget?.startsWith('essential_')) {
                            const widget = essentialWidgets.find(w => w.value === widgetData.type);
                            return widget?.description || 'Configure your widget';
                          }
                          if (selectedWidget?.includes('deeplink')) {
                            return 'Smart app redirects';
                          }
                          if (selectedWidget === 'convert_linktree') {
                            return 'Import all your existing links';
                          }
                          if (selectedWidget === 'pro_twitch_embed') {
                            return 'Embed your live stream with automatic online/offline detection';
                          }
                          if (selectedWidget === 'pro_youtube_live') {
                            return 'Embed your live YouTube stream with automatic online/offline detection';
                          }
                          if (selectedWidget === 'pro_kick_embed') {
                            return 'Embed your live Kick stream with automatic online/offline detection';
                          }
                          return 'Configure your widget';
                        })()}
                      </p>
                    </motion.div>

                    {/* Form Fields */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {selectedWidget?.startsWith('platform_') ? (
                        /* Platform Configuration */
                        <>
                          {/* Output Type Selection */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Output Type</Label>
                            <div className="flex space-x-3">
                              <motion.button
                                type="button"
                                onClick={() => setWidgetData({...widgetData, outputType: 'link'})}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                                  widgetData.outputType === 'link' 
                                    ? 'border-purple-400 bg-purple-50 text-purple-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center space-x-2">
                                  <Link className="w-4 h-4" />
                                  <span className="text-sm font-medium">Social Link</span>
                                </div>
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => setWidgetData({...widgetData, outputType: 'qr_code'})}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                                  widgetData.outputType === 'qr_code' 
                                    ? 'border-purple-400 bg-purple-50 text-purple-700' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center space-x-2">
                                  <Package className="w-4 h-4" />
                                  <span className="text-sm font-medium">QR Code</span>
                                </div>
                              </motion.button>
                            </div>
                          </div>

                          {/* Platform Fields */}
                          {widgetData.outputType === 'qr_code' ? (
                            /* QR Code Fields */
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="qr-title" className="text-sm font-medium text-gray-700">QR Code Title</Label>
                                <Input
                                  id="qr-title"
                                  placeholder="My QR Code"
                                  value={widgetData.title || ''}
                                  onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                                  className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="qr-url" className="text-sm font-medium text-gray-700">
                                  {widgetData.platform === 'website' ? 'Website URL' : 
                                   widgetData.platform === 'instagram' ? 'Instagram URL' :
                                   widgetData.platform === 'tiktok' ? 'TikTok URL' :
                                   widgetData.platform === 'youtube' ? 'YouTube URL' :
                                   widgetData.platform === 'twitter' ? 'X (Twitter) URL' :
                                   widgetData.platform === 'linkedin' ? 'LinkedIn URL' :
                                   widgetData.platform === 'spotify' ? 'Spotify URL' :
                                   widgetData.platform === 'github' ? 'GitHub URL' :
                                   'URL'}
                                </Label>
                                <Input
                                  id="qr-url"
                                  placeholder={`https://${widgetData.platform || 'website'}.com/username`}
                                  value={widgetData.url || ''}
                                  onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                                  className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                                />
                              </div>

                              {/* Custom Logo Upload for Website QR Codes on Pro Plan Only */}
                              {userTier === 'pro' && widgetData.platform === 'website' && (
                                <div className="space-y-2">
                                  <Label htmlFor="custom-logo" className="text-sm font-medium text-gray-700">Custom Logo (Pro)</Label>
                                  <Input
                                    id="custom-logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setIsUploadingLogo(true)
                                        try {
                                          const logoFile = await convertFileToBase64(file)
                                          const previewUrl = URL.createObjectURL(file)
                                          
                                          setWidgetData({
                                            ...widgetData, 
                                            logoFile: logoFile,
                                            customLogoUrl: previewUrl
                                          })
                                          toast.success('Logo uploaded!')
                                        } catch (error) {
                                          console.error('Error uploading logo:', error)
                                          toast.error('Failed to upload logo')
                                        } finally {
                                          setIsUploadingLogo(false)
                                        }
                                      }
                                    }}
                                    className="h-10 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700"
                                  />
                                  {widgetData.customLogoUrl && (
                                    <div className="flex items-center space-x-2 mt-2">
                                      <img 
                                        src={widgetData.customLogoUrl} 
                                        alt="Logo preview" 
                                        className="w-8 h-8 object-cover rounded border"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (widgetData.customLogoUrl) {
                                            URL.revokeObjectURL(widgetData.customLogoUrl)
                                          }
                                          setWidgetData({...widgetData, logoFile: '', customLogoUrl: ''})
                                        }}
                                        className="text-xs text-red-600 hover:text-red-800"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            /* Social Link Fields */
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                                <Input
                                  id="title"
                                  placeholder="Link title"
                                  value={widgetData.title || ''}
                                  onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                                  className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="url" className="text-sm font-medium text-gray-700">
                                  {widgetData.platform === 'website' ? 'Website URL' : 'URL'}
                                </Label>
                                <Input
                                  id="url"
                                  placeholder={widgetData.platform === 'website' ? 'https://yourwebsite.com' : 'https://...'}
                                  value={widgetData.url || ''}
                                  onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                                  className={`h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 ${
                                    !!widgetData.baseUrl && widgetData.platform !== 'website' ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                                  }`}
                                  readOnly={!!widgetData.baseUrl && widgetData.platform !== 'website'}
                                />
                              </div>
                              {widgetData.platform !== 'website' && (
                                <div className="space-y-2">
                                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
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
                                    className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                                  />
                                </div>
                              )}

                            </>
                          )}
                        </>
                      ) : selectedWidget?.includes('deeplink') ? (
                        /* Deeplink Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="app-name" className="text-sm font-medium text-gray-700">App Name</Label>
                            <Input
                              id="app-name"
                              placeholder="My App"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ios-url" className="text-sm font-medium text-gray-700">iOS App URL</Label>
                            <Input
                              id="ios-url"
                              placeholder="https://apps.apple.com/app/your-app"
                              value={widgetData.appStoreUrl || ''}
                              onChange={(e) => setWidgetData({...widgetData, appStoreUrl: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="android-url" className="text-sm font-medium text-gray-700">Android App URL</Label>
                            <Input
                              id="android-url"
                              placeholder="https://play.google.com/store/apps/details?id=your.app"
                              value={widgetData.playStoreUrl || ''}
                              onChange={(e) => setWidgetData({...widgetData, playStoreUrl: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fallback-url" className="text-sm font-medium text-gray-700">Fallback URL</Label>
                            <Input
                              id="fallback-url"
                              placeholder="https://yourwebsite.com"
                              value={widgetData.url || ''}
                              onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                        </>
                      ) : selectedWidget?.startsWith('qr_') ? (
                        /* QR Code Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="qr-title" className="text-sm font-medium text-gray-700">QR Code Title</Label>
                            <Input
                              id="qr-title"
                              placeholder="My QR Code"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="qr-url" className="text-sm font-medium text-gray-700">
                              {widgetData.platform === 'website' ? 'Website URL' : 
                               widgetData.platform === 'instagram' ? 'Instagram URL' :
                               widgetData.platform === 'tiktok' ? 'TikTok URL' :
                               widgetData.platform === 'youtube' ? 'YouTube URL' :
                               widgetData.platform === 'x' ? 'X (Twitter) URL' :
                               widgetData.platform === 'linkedin' ? 'LinkedIn URL' :
                               widgetData.platform === 'spotify' ? 'Spotify URL' :
                               widgetData.platform === 'github' ? 'GitHub URL' :
                               'URL'}
                            </Label>
                            <Input
                              id="qr-url"
                              placeholder={`https://${widgetData.platform || 'website'}.com/username`}
                              value={widgetData.url || ''}
                              onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>

                          {/* Custom Logo Upload for Website QR Codes on Pro Plan Only */}
                          {userTier === 'pro' && widgetData.platform === 'website' && (
                            <div className="space-y-2">
                              <Label htmlFor="custom-logo" className="text-sm font-medium text-gray-700">Custom Logo (Pro)</Label>
                              <Input
                                id="custom-logo"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setIsUploadingLogo(true)
                                    try {
                                      const logoFile = await convertFileToBase64(file)
                                      const previewUrl = URL.createObjectURL(file)
                                      
                                      setWidgetData({
                                        ...widgetData, 
                                        logoFile: logoFile,
                                        customLogoUrl: previewUrl
                                      })
                                      toast.success('Logo uploaded!')
                                    } catch (error) {
                                      console.error('Error uploading logo:', error)
                                      toast.error('Failed to upload logo')
                                    } finally {
                                      setIsUploadingLogo(false)
                                    }
                                  }
                                }}
                                className="h-11 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700"
                              />
                              {widgetData.customLogoUrl && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <img 
                                    src={widgetData.customLogoUrl} 
                                    alt="Logo preview" 
                                    className="w-8 h-8 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (widgetData.customLogoUrl) {
                                        URL.revokeObjectURL(widgetData.customLogoUrl)
                                      }
                                      setWidgetData({...widgetData, logoFile: '', customLogoUrl: ''})
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : selectedWidget === 'convert_linktree' ? (
                        /* Linktree Conversion */
                        <div className="space-y-2">
                          <Label htmlFor="linktree-url" className="text-sm font-medium text-gray-700">Linktree URL</Label>
                          <Input
                            id="linktree-url"
                            placeholder="https://linktr.ee/yourusername"
                            value={widgetData.url || ''}
                            onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                            className="h-11 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                          />
                          <p className="text-xs text-gray-500">
                            We'll import all your links from your Linktree page
                          </p>
                        </div>
                      ) : widgetData.type === 'text' ? (
                        /* Text Widget Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="text-title" className="text-sm font-medium text-gray-700">Title</Label>
                            <Input
                              id="text-title"
                              placeholder="Text block title"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="text-content" className="text-sm font-medium text-gray-700">Content</Label>
                            <Textarea
                              id="text-content"
                              placeholder="Enter your text content..."
                              value={widgetData.content || ''}
                              onChange={(e) => setWidgetData({...widgetData, content: e.target.value})}
                              className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 min-h-[80px] resize-none"
                            />
                          </div>
                        </>
                      ) : widgetData.type === 'media' ? (
                        /* Media Widget Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="media-title" className="text-sm font-medium text-gray-700">Title</Label>
                            <Input
                              id="media-title"
                              placeholder="Photo/Video title"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="media-file" className="text-sm font-medium text-gray-700">Upload File</Label>
                            <Input
                              id="media-file"
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setWidgetData({...widgetData, file})
                                }
                              }}
                              className="h-10 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="media-caption" className="text-sm font-medium text-gray-700">Caption (Optional)</Label>
                            <Textarea
                              id="media-caption"
                              placeholder="Add a caption..."
                              value={widgetData.caption || ''}
                              onChange={(e) => setWidgetData({...widgetData, caption: e.target.value})}
                              className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 min-h-[60px] resize-none"
                            />
                          </div>
                        </>
                      ) : widgetData.type === 'voice' ? (
                        /* Voice Widget Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="voice-title" className="text-sm font-medium text-gray-700">Title</Label>
                            <Input
                              id="voice-title"
                              placeholder="Voice message title"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="voice-file" className="text-sm font-medium text-gray-700">Upload Audio</Label>
                            <Input
                              id="voice-file"
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setWidgetData({...widgetData, file})
                                }
                              }}
                              className="h-10 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="voice-caption" className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                            <Textarea
                              id="voice-caption"
                              placeholder="Describe your voice message..."
                              value={widgetData.caption || ''}
                              onChange={(e) => setWidgetData({...widgetData, caption: e.target.value})}
                              className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 min-h-[60px] resize-none"
                            />
                          </div>
                        </>
                      ) : widgetData.type === 'product' ? (
                        /* Product Widget Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="product-title" className="text-sm font-medium text-gray-700">Product Name</Label>
                            <Input
                              id="product-title"
                              placeholder="Product name"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-price" className="text-sm font-medium text-gray-700">Price</Label>
                            <Input
                              id="product-price"
                              placeholder="$29.99"
                              value={widgetData.price || ''}
                              onChange={(e) => setWidgetData({...widgetData, price: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-url" className="text-sm font-medium text-gray-700">Purchase URL</Label>
                            <Input
                              id="product-url"
                              placeholder="https://..."
                              value={widgetData.url || ''}
                              onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product-image" className="text-sm font-medium text-gray-700">Product Image</Label>
                            <Input
                              id="product-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setWidgetData({...widgetData, file})
                                }
                              }}
                              className="h-10 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-purple-50 file:text-purple-700"
                            />
                          </div>
                        </>
                      ) : widgetData.type === 'twitch_embed' ? (
                        /* Twitch Embed Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="twitch-channel" className="text-sm font-medium text-gray-700">Twitch Channel</Label>
                            <Input
                              id="twitch-channel"
                              placeholder="yourusername"
                              value={widgetData.username || ''}
                              onChange={(e) => {
                                const username = e.target.value.replace(/^@/, '')
                                setWidgetData({
                                  ...widgetData, 
                                  username,
                                  url: `https://www.twitch.tv/${username}`
                                })
                              }}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                            <p className="text-xs text-gray-500">
                              Enter your Twitch username (without @)
                            </p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-purple-900">Pro Feature</p>
                                <p className="text-xs text-purple-700 mt-1">
                                  This widget will show your live Twitch stream when you're online, or an attractive offline screen when you're not streaming. Viewers can click to visit your channel.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : widgetData.type === 'youtube_live' ? (
                        /* YouTube Live Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="youtube-channel" className="text-sm font-medium text-gray-700">YouTube Channel</Label>
                            <Input
                              id="youtube-channel"
                              placeholder="@yourusername or channel ID"
                              value={widgetData.username || ''}
                              onChange={(e) => {
                                const username = e.target.value.replace(/^@/, '')
                                setWidgetData({
                                  ...widgetData, 
                                  username,
                                  url: username.startsWith('UC') || username.length === 24 
                                    ? `https://www.youtube.com/channel/${username}` 
                                    : `https://www.youtube.com/@${username}`
                                })
                              }}
                              className="h-10 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20"
                            />
                            <p className="text-xs text-gray-500">
                              Enter your YouTube handle (@username) or Channel ID
                            </p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-red-900">Pro Feature</p>
                                <p className="text-xs text-red-700 mt-1">
                                  This widget will show your live YouTube stream when you're online, or an attractive offline screen when you're not streaming. Viewers can click to visit your channel.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : widgetData.type === 'kick_embed' ? (
                        /* Kick Stream Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="kick-channel" className="text-sm font-medium text-gray-700">Kick Channel</Label>
                            <Input
                              id="kick-channel"
                              placeholder="yourusername"
                              value={widgetData.username || ''}
                              onChange={(e) => {
                                const username = e.target.value.replace(/^@/, '')
                                setWidgetData({
                                  ...widgetData, 
                                  username,
                                  url: `https://kick.com/${username}`
                                })
                              }}
                              className="h-10 rounded-xl border-gray-200 focus:border-green-400 focus:ring-green-400/20"
                            />
                            <p className="text-xs text-gray-500">
                              Enter your Kick username (without @)
                            </p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-900">Pro Feature</p>
                                <p className="text-xs text-green-700 mt-1">
                                  This widget will show your live Kick stream when you're online, or an attractive offline screen when you're not streaming. Viewers can click to visit your channel.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Standard Link Configuration */
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                            <Input
                              id="title"
                              placeholder="Link title"
                              value={widgetData.title || ''}
                              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="url" className="text-sm font-medium text-gray-700">URL</Label>
                            <Input
                              id="url"
                              placeholder="https://..."
                              value={widgetData.url || ''}
                              onChange={(e) => setWidgetData({...widgetData, url: e.target.value})}
                              className="h-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          </div>
                        </>
                      )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div 
                      className="mt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button 
                        onClick={handleAddWidget} 
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl h-10 text-sm font-medium shadow-lg shadow-purple-500/25"
                        disabled={isConverting}
                      >
                        {isConverting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isConverting ? 'Creating...' : 'Add Widget'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Widget Selection Grid */
              <motion.div 
                key="browse"
                className="flex-1 overflow-y-auto"
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <div className="px-6 py-6">
                  
                  {/* Search Bar */}
                  <motion.div 
                    className="mb-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="relative max-w-md mx-auto">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search widgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-10 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 transition-all text-sm"
                      />
                    </div>
                  </motion.div>

                  <div className="space-y-8">
                    
                    {/* Convert Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Convert</h3>
                      </div>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className="cursor-pointer border-2 border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50"
                          onClick={() => {
                            setSelectedWidget('convert_linktree')
                            setWidgetData({ type: 'convert', title: 'Import from Linktree', url: '' })
                            setShowDetailsPage(true)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-bold">LT</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Import from Linktree</h4>
                                <p className="text-sm text-gray-600">Convert your existing bio links</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>

                    {/* Essential Widgets */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Star className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Essential</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {filteredEssentials.map((widget, index) => (
                          <motion.div
                            key={widget.value}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            whileHover={ { y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className="cursor-pointer border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 rounded-xl"
                              onClick={() => {
                                handleEssentialSelect(widget.value)
                                setShowDetailsPage(true)
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-9 h-9 ${widget.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                    <widget.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-sm">{widget.name}</h4>
                                    <p className="text-xs text-gray-600 truncate">{widget.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Pro Widgets - Visible to all, but disabled for free users */}
                    {filteredProWidgets.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center space-x-2 mb-4">
                          <Sparkles className={`w-5 h-5 ${userTier === 'pro' ? 'text-purple-500' : 'text-gray-400'}`} />
                          <h3 className={`text-lg font-semibold ${userTier === 'pro' ? 'text-gray-900' : 'text-gray-600'}`}>Pro Features</h3>
                          <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                            userTier === 'pro' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            PRO
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {filteredProWidgets.map((widget, index) => (
                            <motion.div
                              key={widget.value}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 + index * 0.05 }}
                              whileHover={userTier === 'pro' ? { y: -2, scale: 1.02 } : {}}
                              whileTap={userTier === 'pro' ? { scale: 0.98 } : {}}
                            >
                              <Card
                                className={`transition-all duration-200 rounded-xl ${
                                  userTier === 'pro' 
                                    ? 'cursor-pointer border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50' 
                                    : 'cursor-not-allowed border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60'
                                }`}
                                onClick={() => {
                                  if (userTier === 'pro') {
                                    handleEssentialSelect(widget.value)
                                    setShowDetailsPage(true)
                                  } else {
                                    toast.error('Upgrade to Pro to access Twitch Stream embeds and other premium features!')
                                  }
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                                      userTier === 'pro' ? widget.color : 'bg-gray-400'
                                    }`}>
                                      <img 
                                        src={widget.logoUrl} 
                                        alt={widget.name}
                                        className="w-4 h-4 object-contain filter invert brightness-0"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const fallback = target.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'block';
                                        }}
                                      />
                                      <div className="w-4 h-4 items-center justify-center text-white text-sm font-bold hidden">
                                        {widget.name.charAt(0)}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-medium text-sm ${
                                        userTier === 'pro' ? 'text-gray-900' : 'text-gray-500'
                                      }`}>{widget.name}</h4>
                                      <p className={`text-xs truncate ${
                                        userTier === 'pro' ? 'text-gray-600' : 'text-gray-400'
                                      }`}>{widget.description}</p>
                                    </div>
                                  </div>
                                  {userTier !== 'pro' && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Pro Feature</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            // Here you could add navigation to pricing page
                                            toast.info('Upgrade to Pro to unlock premium widgets!')
                                          }}
                                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                          Upgrade
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Platforms */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      data-section="platforms"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Globe className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Platforms</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {filteredPlatforms.map((platform, index) => (
                          <motion.div
                            key={platform.value}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.03 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Card
                              className="cursor-pointer border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 rounded-xl"
                              onClick={() => {
                                handlePlatformSelect(platform.value)
                                setShowDetailsPage(true)
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 ${platform.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                    <img 
                                      src={platform.logoUrl} 
                                      alt={platform.name}
                                      className="w-5 h-5 object-contain filter invert brightness-0"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                    />
                                    <div className="w-5 h-5 items-center justify-center text-white text-sm font-bold hidden">
                                      {platform.name.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-sm">{platform.name}</h4>
                                    <p className="text-xs text-gray-500">Link or QR Code</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
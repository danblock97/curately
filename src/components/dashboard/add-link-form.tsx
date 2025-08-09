'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { Link2, ExternalLink, QrCode, Upload, X } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'
import { getPlatformLogoUrl } from '@/lib/qr-code'

type Link = Database['public']['Tables']['links']['Row']
type QRCode = Database['public']['Tables']['qr_codes']['Row']

interface PlatformType {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  url: string
  placeholder: string
}

interface AddLinkFormProps {
  onLinkAdded: (link: Link) => void
  onQrCodeAdded?: (qrCode: QRCode) => void
  onCancel: () => void
  nextOrder: number
  selectedPlatform?: PlatformType | null
  existingLinks?: Link[]
  existingQrCodes?: QRCode[]
  defaultTab?: 'link_in_bio' | 'deeplink' | 'qr_code'
  pageId?: string
  userTier?: Database['public']['Enums']['user_tier']
}

export function AddLinkForm({ onLinkAdded, onQrCodeAdded, onCancel, nextOrder, selectedPlatform, existingLinks = [], existingQrCodes = [], defaultTab = 'link_in_bio', pageId, userTier = 'free' }: AddLinkFormProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  
  // Common fields
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  
  // Deeplink fields
  const [iosUrl, setIosUrl] = useState('')
  const [androidUrl, setAndroidUrl] = useState('')
  const [desktopUrl, setDesktopUrl] = useState('')
  const [fallbackUrl, setFallbackUrl] = useState('')
  
  // QR Code fields
  const [qrSize, setQrSize] = useState(200)
  const [qrFormat, setQrFormat] = useState('PNG')
  const [qrErrorCorrection, setQrErrorCorrection] = useState('M')
  const [qrForeground, setQrForeground] = useState('#000000')
  const [qrBackground, setQrBackground] = useState('#FFFFFF')
  const [qrLogoFile, setQrLogoFile] = useState<File | null>(null)
  const [qrLogoPreview, setQrLogoPreview] = useState<string | null>(null)
  const [qrPlatform, setQrPlatform] = useState<string>('')

  const handleLinkInBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check plan limits first
    const limitCheck = checkCanCreateLink(existingLinks, 'link_in_bio', userTier, existingQrCodes.map(qr => ({ is_active: true })))
    if (!limitCheck.canCreate) {
      toast.error(limitCheck.reason || 'Cannot create more links')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          order: nextOrder,
          pageId: pageId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create link')
        return
      }

      const result = await response.json()
      const link = result.success ? result.data.link : result.link
      onLinkAdded(link)
      toast.success('Link added successfully!')
      resetForm()
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeeplinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check plan limits first
    const limitCheck = checkCanCreateLink(existingLinks, 'deeplink', userTier, existingQrCodes.map(qr => ({ is_active: true })))
    if (!limitCheck.canCreate) {
      toast.error(limitCheck.reason || 'Cannot create more deeplinks')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/links/deeplink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          iosUrl: iosUrl.trim() || undefined,
          androidUrl: androidUrl.trim() || undefined,
          desktopUrl: desktopUrl.trim() || undefined,
          fallbackUrl: fallbackUrl.trim() || undefined,
          order: nextOrder,
          pageId: pageId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create deeplink')
        return
      }

      const result = await response.json()
      const link = result.success ? result.data.link : result.link
      onLinkAdded(link)
      toast.success('Deeplink added successfully!')
      resetForm()
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQRCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check plan limits first
    const limitCheck = checkCanCreateLink(existingLinks, 'qr_code', userTier, existingQrCodes.map(qr => ({ is_active: true })))
    if (!limitCheck.canCreate) {
      toast.error(limitCheck.reason || 'Cannot create more QR codes')
      return
    }
    
    setIsLoading(true)

    try {
      // Convert logo file to base64 if provided
      let logoFileBase64: string | undefined
      if (qrLogoFile) {
        const reader = new FileReader()
        logoFileBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(qrLogoFile)
        })
      }

      // Detect platform from URL if not manually set
      let detectedPlatform = qrPlatform
      if (!detectedPlatform && url) {
        const urlLower = url.toLowerCase()
        if (urlLower.includes('instagram.com')) detectedPlatform = 'instagram'
        else if (urlLower.includes('tiktok.com')) detectedPlatform = 'tiktok'
        else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) detectedPlatform = 'x'
        else if (urlLower.includes('facebook.com')) detectedPlatform = 'facebook'
        else if (urlLower.includes('linkedin.com')) detectedPlatform = 'linkedin'
        else if (urlLower.includes('youtube.com')) detectedPlatform = 'youtube'
        else if (urlLower.includes('spotify.com')) detectedPlatform = 'spotify'
        else if (urlLower.includes('github.com')) detectedPlatform = 'github'
        else if (urlLower.includes('discord.com') || urlLower.includes('discord.gg')) detectedPlatform = 'discord'
      }

      const response = await fetch('/api/links/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          size: qrSize,
          format: qrFormat,
          errorCorrection: qrErrorCorrection,
          foregroundColor: qrForeground,
          backgroundColor: qrBackground,
          pageId: pageId,
          logoFile: logoFileBase64,
          platform: detectedPlatform,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create QR code')
        return
      }

      const result = await response.json()
      if (result.success && result.data.qrCode) {
        // QR code was created, use the QR code callback
        if (onQrCodeAdded) {
          onQrCodeAdded(result.data.qrCode)
        }
        toast.success('QR code created successfully!')
      } else {
        // Fallback for legacy response format
        const link = result.link
        if (link) {
          onLinkAdded(link)
        }
        toast.success('QR code created successfully!')
      }
      resetForm()
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if user is pro for custom logo upload
    if (userTier !== 'pro') {
      toast.error('Custom logo upload is available for Pro users only')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file must be smaller than 2MB')
      return
    }

    setQrLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setQrLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setQrLogoFile(null)
    setQrLogoPreview(null)
  }

  const resetForm = () => {
    setTitle('')
    setUrl('')
    setIosUrl('')
    setAndroidUrl('')
    setDesktopUrl('')
    setFallbackUrl('')
    setQrSize(200)
    setQrFormat('PNG')
    setQrErrorCorrection('M')
    setQrForeground('#000000')
    setQrBackground('#FFFFFF')
    setQrLogoFile(null)
    setQrLogoPreview(null)
    setQrPlatform('')
  }

  // Pre-fill form if platform is selected
  React.useEffect(() => {
    if (selectedPlatform) {
      setTitle(selectedPlatform.name)
      setUrl(selectedPlatform.url)
      setQrPlatform(selectedPlatform.name.toLowerCase())
    } else {
      setTitle('')
      setUrl('')
      setQrPlatform('')
    }
  }, [selectedPlatform])

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      {selectedPlatform && (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlatform.color}`}>
            <selectedPlatform.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{selectedPlatform.name}</h4>
            <p className="text-sm text-gray-600">Enter your {selectedPlatform.name.toLowerCase()} details</p>
          </div>
        </div>
      )}

      {/* Simplified Form for Selected Platform */}
      {selectedPlatform ? (
        <form onSubmit={handleLinkInBioSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder={selectedPlatform.name}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-gray-900">
              {selectedPlatform.name === 'Website' ? 'Website URL' : `${selectedPlatform.name} URL`} *
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {selectedPlatform.url}
              </span>
              <Input
                id="url"
                type="text"
                placeholder={selectedPlatform.placeholder}
                value={url.startsWith(selectedPlatform.url) ? url.replace(selectedPlatform.url, '') : ''}
                onChange={(e) => setUrl(selectedPlatform.url + e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !url.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2" />
              ) : null}
              {isLoading ? 'Adding...' : 'Add Link'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'link_in_bio' | 'deeplink' | 'qr_code')}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="link_in_bio" className="flex items-center space-x-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Link2 className="w-4 h-4" />
              <span>Link in Bio</span>
            </TabsTrigger>
            <TabsTrigger value="deeplink" className="flex items-center space-x-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <ExternalLink className="w-4 h-4" />
              <span>Deeplink</span>
            </TabsTrigger>
            <TabsTrigger value="qr_code" className="flex items-center space-x-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link_in_bio" className="space-y-4">
            <form onSubmit={handleLinkInBioSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="My Portfolio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-gray-900">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !url.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2" />
                  ) : null}
                  {isLoading ? 'Adding...' : 'Add Link'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="deeplink" className="space-y-4">
            <form onSubmit={handleDeeplinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deeplink-title" className="text-gray-900">Title *</Label>
                <Input
                  id="deeplink-title"
                  type="text"
                  placeholder="My App Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deeplink-url" className="text-gray-900">Original URL *</Label>
                <Input
                  id="deeplink-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ios-url" className="text-gray-900">iOS URL</Label>
                  <Input
                    id="ios-url"
                    type="url"
                    placeholder="https://apps.apple.com/..."
                    value={iosUrl}
                    onChange={(e) => setIosUrl(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="android-url" className="text-gray-900">Android URL</Label>
                  <Input
                    id="android-url"
                    type="url"
                    placeholder="https://play.google.com/..."
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktop-url" className="text-gray-900">Desktop URL</Label>
                <Input
                  id="desktop-url"
                  type="url"
                  placeholder="https://web.example.com"
                  value={desktopUrl}
                  onChange={(e) => setDesktopUrl(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback-url" className="text-gray-900">Fallback URL</Label>
                <Input
                  id="fallback-url"
                  type="url"
                  placeholder="https://fallback.example.com"
                  value={fallbackUrl}
                  onChange={(e) => setFallbackUrl(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !url.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <LoadingButton isLoading={isLoading} loadingText="Creating...">
                    Create Deeplink
                  </LoadingButton>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="qr_code" className="space-y-4">
            <form onSubmit={handleQRCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-title" className="text-gray-900">Title *</Label>
                <Input
                  id="qr-title"
                  type="text"
                  placeholder="My QR Code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-url" className="text-gray-900">URL *</Label>
                <Input
                  id="qr-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-2">
                <Label className="text-gray-900">Logo (Optional)</Label>
                <div className="space-y-3">
                  {qrLogoPreview ? (
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={qrLogoPreview} 
                          alt="Logo preview" 
                          className="w-12 h-12 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{qrLogoFile?.name}</p>
                        <p className="text-xs text-gray-500">Logo will be automatically added to your QR code</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="qr-logo-upload"
                        disabled={userTier !== 'pro'}
                      />
                      <label htmlFor="qr-logo-upload" className={`cursor-pointer ${userTier !== 'pro' ? 'opacity-50' : ''}`}>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {userTier === 'pro' ? 'Click to upload custom logo' : 'Custom logos available on Pro'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {userTier === 'pro' ? 'PNG, JPG up to 2MB' : 'Platform logos are automatically added'}
                        </p>
                      </label>
                    </div>
                  )}
                </div>
                {userTier !== 'pro' && (
                  <p className="text-xs text-blue-600">
                    💡 Platform logos (Instagram, TikTok, etc.) are automatically added to your QR codes!
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size" className="text-gray-900">Size</Label>
                  <Select value={qrSize.toString()} onValueChange={(value) => setQrSize(Number(value))}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-gray-900/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="100" className="text-gray-900 hover:bg-gray-50">100x100</SelectItem>
                      <SelectItem value="200" className="text-gray-900 hover:bg-gray-50">200x200</SelectItem>
                      <SelectItem value="300" className="text-gray-900 hover:bg-gray-50">300x300</SelectItem>
                      <SelectItem value="400" className="text-gray-900 hover:bg-gray-50">400x400</SelectItem>
                      <SelectItem value="500" className="text-gray-900 hover:bg-gray-50">500x500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-format" className="text-gray-900">Format</Label>
                  <Select value={qrFormat} onValueChange={setQrFormat}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-gray-900/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="PNG" className="text-gray-900 hover:bg-gray-50">PNG</SelectItem>
                      <SelectItem value="SVG" className="text-gray-900 hover:bg-gray-50">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-foreground" className="text-gray-900">Foreground Color</Label>
                  <Input
                    id="qr-foreground"
                    type="color"
                    value={qrForeground}
                    onChange={(e) => setQrForeground(e.target.value)}
                    className="bg-white border-gray-300 h-10 w-full cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-background" className="text-gray-900">Background Color</Label>
                  <Input
                    id="qr-background"
                    type="color"
                    value={qrBackground}
                    onChange={(e) => setQrBackground(e.target.value)}
                    className="bg-white border-gray-300 h-10 w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !url.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <LoadingButton isLoading={isLoading} loadingText="Creating...">
                    Create QR Code
                  </LoadingButton>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
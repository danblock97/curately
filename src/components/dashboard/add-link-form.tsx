'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { Link2, ExternalLink, QrCode } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading'
import { checkCanCreateLink } from '@/hooks/use-plan-limits'

type Link = Database['public']['Tables']['links']['Row']

interface PlatformType {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  url: string
  placeholder: string
}

interface AddLinkFormProps {
  onLinkAdded: (link: Link) => void
  onQrCodeAdded?: (qrCode: any) => void
  onCancel: () => void
  nextOrder: number
  selectedPlatform?: PlatformType | null
  existingLinks?: Link[]
  defaultTab?: 'link_in_bio' | 'deeplink' | 'qr_code'
  pageId?: string
  userTier?: Database['public']['Enums']['user_tier']
}

export function AddLinkForm({ onLinkAdded, onQrCodeAdded, onCancel, nextOrder, selectedPlatform, existingLinks = [], defaultTab = 'link_in_bio', pageId, userTier = 'free' }: AddLinkFormProps) {
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

  const handleLinkInBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check plan limits first
    const limitCheck = checkCanCreateLink(existingLinks, 'link_in_bio', userTier)
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
    const limitCheck = checkCanCreateLink(existingLinks, 'deeplink', userTier)
    if (!limitCheck.canCreate) {
      toast.error(limitCheck.reason || 'Cannot create more links')
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
          originalUrl: url.trim(),
          iosUrl: iosUrl.trim() || undefined,
          androidUrl: androidUrl.trim() || undefined,
          desktopUrl: desktopUrl.trim() || undefined,
          fallbackUrl: fallbackUrl.trim() || undefined,
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
      toast.success('Deeplink created successfully!')
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
    const limitCheck = checkCanCreateLink(existingLinks, 'qr_code', userTier)
    if (!limitCheck.canCreate) {
      toast.error(limitCheck.reason || 'Cannot create more QR codes')
      return
    }
    
    setIsLoading(true)

    try {
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
  }

  // Pre-fill form if platform is selected
  React.useEffect(() => {
    if (selectedPlatform) {
      setTitle(selectedPlatform.name)
      setUrl(selectedPlatform.url)
    } else {
      setTitle('')
      setUrl('')
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
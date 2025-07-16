'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { Link2, ExternalLink, QrCode, AlertCircle } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading'
import { useFormValidation, linkInBioSchema, deeplinkSchema, qrCodeSchema } from '@/lib/validation'
import { handleClientError } from '@/lib/error-handler'

type Link = Database['public']['Tables']['links']['Row']

interface AddLinkFormProps {
  userId: string
  onLinkAdded: (link: Link) => void
  onCancel: () => void
  nextOrder: number
}

export function AddLinkForm({ userId, onLinkAdded, onCancel, nextOrder }: AddLinkFormProps) {
  const [activeTab, setActiveTab] = useState('link_in_bio')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
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

  const supabase = createClient()
  const linkInBioValidation = useFormValidation(linkInBioSchema)
  const deeplinkValidation = useFormValidation(deeplinkSchema)
  const qrCodeValidation = useFormValidation(qrCodeSchema)

  const clearErrors = () => setErrors({})
  
  const handleError = (error: unknown, context?: string) => {
    const errorMessage = handleClientError(error)
    toast.error(context ? `${context}: ${errorMessage}` : errorMessage)
    console.error('Form error:', error)
  }

  const handleLinkInBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate URL format
      let validUrl = url.trim()
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = `https://${validUrl}`
      }

      // Basic URL validation
      try {
        new URL(validUrl)
      } catch {
        toast.error('Please enter a valid URL')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: userId,
          title: title.trim(),
          url: validUrl,
          order: nextOrder,
          is_active: true,
          link_type: 'link_in_bio'
        })
        .select()
        .single()

      if (error) {
        toast.error('Error adding link. Please try again.')
        return
      }

      onLinkAdded(data)
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
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create deeplink')
        return
      }

      const { link } = await response.json()
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
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create QR code')
        return
      }

      const { link } = await response.json()
      onLinkAdded(link)
      toast.success('QR code created successfully!')
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Link</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link_in_bio" className="flex items-center space-x-2">
              <Link2 className="w-4 h-4" />
              <span>Link in Bio</span>
            </TabsTrigger>
            <TabsTrigger value="deeplink" className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Deeplink</span>
            </TabsTrigger>
            <TabsTrigger value="qr_code" className="flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>QR Code</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link_in_bio" className="space-y-4">
            <form onSubmit={handleLinkInBioSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="My Portfolio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !url.trim()}
                >
                  <LoadingButton isLoading={isLoading} loadingText="Adding...">
                    Add Link
                  </LoadingButton>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="deeplink" className="space-y-4">
            <form onSubmit={handleDeeplinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deeplink-title">Title *</Label>
                <Input
                  id="deeplink-title"
                  type="text"
                  placeholder="My App Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deeplink-url">Original URL *</Label>
                <Input
                  id="deeplink-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ios-url">iOS URL</Label>
                  <Input
                    id="ios-url"
                    type="url"
                    placeholder="https://apps.apple.com/..."
                    value={iosUrl}
                    onChange={(e) => setIosUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="android-url">Android URL</Label>
                  <Input
                    id="android-url"
                    type="url"
                    placeholder="https://play.google.com/..."
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desktop-url">Desktop URL</Label>
                <Input
                  id="desktop-url"
                  type="url"
                  placeholder="https://web.example.com"
                  value={desktopUrl}
                  onChange={(e) => setDesktopUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback-url">Fallback URL</Label>
                <Input
                  id="fallback-url"
                  type="url"
                  placeholder="https://fallback.example.com"
                  value={fallbackUrl}
                  onChange={(e) => setFallbackUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !url.trim()}
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
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="qr_code" className="space-y-4">
            <form onSubmit={handleQRCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-title">Title *</Label>
                <Input
                  id="qr-title"
                  type="text"
                  placeholder="My QR Code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-url">URL *</Label>
                <Input
                  id="qr-url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size">Size</Label>
                  <Select value={qrSize.toString()} onValueChange={(value) => setQrSize(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100x100</SelectItem>
                      <SelectItem value="200">200x200</SelectItem>
                      <SelectItem value="300">300x300</SelectItem>
                      <SelectItem value="400">400x400</SelectItem>
                      <SelectItem value="500">500x500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-format">Format</Label>
                  <Select value={qrFormat} onValueChange={setQrFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PNG">PNG</SelectItem>
                      <SelectItem value="SVG">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-foreground">Foreground Color</Label>
                  <Input
                    id="qr-foreground"
                    type="color"
                    value={qrForeground}
                    onChange={(e) => setQrForeground(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-background">Background Color</Label>
                  <Input
                    id="qr-background"
                    type="color"
                    value={qrBackground}
                    onChange={(e) => setQrBackground(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !url.trim()}
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
                >
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { Upload, X, Plus } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type SocialLink = Database['public']['Tables']['social_media_links']['Row']

interface AppearanceFormProps {
  profile: Profile
  socialLinks: SocialLink[]
}

const themes = [
  { value: 'light', label: 'Light', preview: 'bg-gray-50 text-gray-900' },
  { value: 'dark', label: 'Dark', preview: 'bg-gray-900 text-white' },
  { value: 'gradient1', label: 'Purple Gradient', preview: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' },
  { value: 'gradient2', label: 'Blue Gradient', preview: 'bg-gradient-to-br from-blue-500 to-teal-500 text-white' }
]

const socialPlatforms = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'website', label: 'Website' }
]

export function AppearanceForm({ profile, socialLinks: initialSocialLinks }: AppearanceFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [theme, setTheme] = useState(profile.theme)
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false)
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')
  const supabase = createClient()

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim()
        })
        .eq('id', profile.id)

      if (error) {
        toast.error('Error updating profile. Please try again.')
        return
      }

      toast.success('Profile updated successfully!')
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        toast.error('Error uploading avatar. Please try again.')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) {
        toast.error('Error updating avatar. Please try again.')
        return
      }

      toast.success('Avatar updated successfully!')
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleAddSocialLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSocialPlatform || !newSocialUrl) return

    try {
      let validUrl = newSocialUrl.trim()
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = `https://${validUrl}`
      }

      const { data, error } = await supabase
        .from('social_media_links')
        .insert({
          user_id: profile.id,
          platform: newSocialPlatform as Database['public']['Tables']['social_media_links']['Row']['platform'],
          url: validUrl
        })
        .select()
        .single()

      if (error) {
        toast.error('Error adding social link. Please try again.')
        return
      }

      setSocialLinks(prev => [...prev, data])
      setNewSocialPlatform('')
      setNewSocialUrl('')
      toast.success('Social link added successfully!')
    } catch {
      toast.error('An error occurred. Please try again.')
    }
  }

  const handleDeleteSocialLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('social_media_links')
        .delete()
        .eq('id', linkId)

      if (error) {
        toast.error('Error deleting social link. Please try again.')
        return
      }

      setSocialLinks(prev => prev.filter(link => link.id !== linkId))
      toast.success('Social link deleted successfully!')
    } catch {
      toast.error('An error occurred. Please try again.')
    }
  }

  const handleThemeUpdate = async () => {
    setIsUpdatingTheme(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme })
        .eq('id', profile.id)

      if (error) {
        toast.error('Error updating theme. Please try again.')
        return
      }

      toast.success('Theme updated successfully!')
      
      // Refresh the page to reflect theme changes
      window.location.reload()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsUpdatingTheme(false)
    }
  }

  const usedPlatforms = socialLinks.map(link => link.platform)
  const availablePlatforms = socialPlatforms.filter(platform => !usedPlatforms.includes(platform.value as Database['public']['Tables']['social_media_links']['Row']['platform']))

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Profile Information</CardTitle>
          <CardDescription className="text-gray-600">
            Update your display name, bio, and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || profile.username} />
                <AvatarFallback className="text-xl">
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" disabled={isUploadingAvatar} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                    </Button>
                  </div>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700">Bio</Label>
              <textarea
                id="bio"
                placeholder="Tell people about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                {bio.length}/160 characters
              </p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Theme</CardTitle>
          <CardDescription className="text-gray-600">
            Choose how your profile page looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {themes.map((themeOption) => (
                <div
                  key={themeOption.value}
                  className={`relative cursor-pointer rounded-lg border-2 transition-colors ${
                    theme === themeOption.value ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setTheme(themeOption.value as Database['public']['Tables']['profiles']['Row']['theme'])}
                >
                  <div className={`p-4 rounded-lg ${themeOption.preview}`}>
                    <div className="text-sm font-medium">{themeOption.label}</div>
                    <div className="text-xs opacity-75 mt-1">Preview</div>
                  </div>
                  {theme === themeOption.value && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="default">Selected</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Theme Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Preview</h4>
              <div className={`p-6 rounded-lg ${themes.find(t => t.value === theme)?.preview || 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-current/20 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {(displayName || profile.display_name || profile.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">
                    {displayName || profile.display_name || profile.username}
                  </h3>
                  {(bio || profile.bio) && (
                    <p className="text-sm opacity-80">
                      {bio || profile.bio}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-white text-gray-900' : theme === 'gradient1' || theme === 'gradient2' ? 'bg-white/20 backdrop-blur-sm' : 'bg-white border border-gray-200'} transition-all`}>
                      <span className="text-sm font-medium">Sample Link</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Theme Button */}
            {theme !== profile.theme && (
              <div className="flex justify-center">
                <Button onClick={handleThemeUpdate} disabled={isUpdatingTheme}>
                  {isUpdatingTheme ? 'Saving Theme...' : 'Save Theme'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Social Media Links</CardTitle>
          <CardDescription className="text-gray-600">
            Add links to your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {socialLinks.length > 0 && (
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <div className="font-medium capitalize text-gray-900">{link.platform}</div>
                      <div className="text-sm text-gray-500 truncate">{link.url}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSocialLink(link.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {availablePlatforms.length > 0 && (
              <form onSubmit={handleAddSocialLink} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Platform</Label>
                    <Select value={newSocialPlatform} onValueChange={setNewSocialPlatform}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlatforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!newSocialPlatform || !newSocialUrl}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social Link
                </Button>
              </form>
            )}

            {availablePlatforms.length === 0 && (
              <p className="text-sm text-gray-500">
                All available platforms have been added.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
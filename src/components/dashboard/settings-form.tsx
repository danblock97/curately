'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { ExternalLink, Github, AlertTriangle, User as UserIcon, Shield, Bell, Palette, Link2, BarChart3, Globe } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Page = Database['public']['Tables']['pages']['Row']

interface SettingsFormProps {
  user: User
  profile: Profile
  pages: Page[]
}

export function SettingsForm({ user, profile, pages }: SettingsFormProps) {
  // Get current page (primary page)
  const currentPage = pages.find(p => p.is_primary) || pages[0]
  
  const [username, setUsername] = useState(currentPage?.username || '')
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [backgroundColor, setBackgroundColor] = useState(currentPage?.background_color || '#ffffff')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [isUpdatingBackgroundColor, setIsUpdatingBackgroundColor] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const supabase = createClient()

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

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
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingUsername(true)

    try {
      const { error } = await supabase
        .from('pages')
        .update({ username: username.toLowerCase().trim() })
        .eq('id', currentPage?.id)

      if (error) {
        if (error.code === '23505') {
          toast.error('Username already taken. Please choose another.')
        } else {
          toast.error('Error updating username. Please try again.')
        }
        return
      }

      toast.success('Username updated successfully!')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsUpdatingUsername(false)
    }
  }

  const handleBackgroundColorUpdate = async (color: string) => {
    if (profile.tier !== 'pro') {
      toast.error('Background color customization is only available for Pro users.')
      return
    }

    setIsUpdatingBackgroundColor(true)

    try {
      const { error } = await supabase
        .from('pages')
        .update({ background_color: color })
        .eq('id', currentPage?.id)

      if (error) {
        toast.error('Error updating background color. Please try again.')
        return
      }

      setBackgroundColor(color)
      toast.success('Background color updated successfully!')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsUpdatingBackgroundColor(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setIsDeletingAccount(true)

    try {
      // Delete the user's profile (this will cascade delete links and social links)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id)

      if (error) {
        toast.error('Error deleting account. Please try again.')
        return
      }

      // Sign out the user
      await supabase.auth.signOut()
      
      toast.success('Account deleted successfully.')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="w-4 h-4" />
      case 'google':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full max-w-md bg-gray-100">
        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Account</span>
        </TabsTrigger>
        <TabsTrigger value="preferences" className="flex items-center space-x-2">
          <Palette className="w-4 h-4" />
          <span>Preferences</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Advanced</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-gray-900">Display Name</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                    className="text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    This name will be displayed on your public profile
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-900">Bio</Label>
                  <Input
                    id="bio"
                    type="text"
                    placeholder="Tell people about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={160}
                    className="text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    {bio.length}/160 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Globe className="w-5 h-5 text-gray-600" />
                <span>Public Profile</span>
              </CardTitle>
              <CardDescription>
                Your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">Username</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-900 font-mono">@{currentPage?.username}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Public URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-900">curately.co.uk/{currentPage?.username}</span>
                  <a
                    href={`/${currentPage?.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Profile Stats</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900">0</div>
                    <div className="text-sm text-gray-500">Total Visits</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900">0</div>
                    <div className="text-sm text-gray-500">Total Clicks</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Account Tab */}
      <TabsContent value="account" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Shield className="w-5 h-5 text-gray-600" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and security information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Email Address</Label>
                  <p className="text-sm text-gray-900 font-mono">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">Account Created</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">Account Type</Label>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-gray-900 border-gray-300">
                      {profile.tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </Badge>
                    {profile.tier === 'free' ? (
                      <Button
                        onClick={() => window.location.href = '/pricing'}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-sm"
                        size="sm"
                      >
                        Upgrade to Pro
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          try {
                            console.log('🔄 Requesting customer portal...')
                            const response = await fetch('/api/customer-portal', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                            })
                            
                            console.log('📊 Portal response status:', response.status)
                            
                            if (!response.ok) {
                              const errorText = await response.text()
                              console.error('❌ Portal API error:', errorText)
                              toast.error('Failed to open billing portal. Please try again.')
                              return
                            }
                            
                            const data = await response.json()
                            console.log('📋 Portal data:', data)
                            
                            const { url, error } = data
                            if (error) {
                              console.error('❌ Portal error:', error)
                              toast.error('Failed to open billing portal. Please try again.')
                              return
                            }
                            if (url) {
                              console.log('✅ Redirecting to portal:', url)
                              window.location.href = url
                            }
                          } catch (error) {
                            console.error('❌ Portal exception:', error)
                            toast.error('Failed to open billing portal. Please try again.')
                          }
                        }}
                        variant="outline"
                        className="border-gray-300 text-gray-900 hover:bg-gray-50 text-sm"
                        size="sm"
                      >
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {user.app_metadata?.providers && user.app_metadata.providers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-900">Connected Accounts</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.app_metadata.providers.map((provider: string) => (
                      <Badge key={provider} variant="outline" className="flex items-center space-x-1 text-gray-900 border-gray-300">
                        {getProviderIcon(provider)}
                        <span className="capitalize">{provider}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Link2 className="w-5 h-5 text-gray-600" />
                <span>Username Settings</span>
              </CardTitle>
              <CardDescription>
                Change your username and public profile URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUsernameUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-900">Username</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 font-mono">curately.co.uk/</span>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      required
                      minLength={3}
                      maxLength={30}
                      className="font-mono text-gray-900 bg-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    3-30 characters. Letters, numbers, and underscores only.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingUsername || username === currentPage?.username || !username.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {isUpdatingUsername ? 'Updating...' : 'Update Username'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Preferences Tab */}
      <TabsContent value="preferences" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Section */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <span>Analytics Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure your analytics and data settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900">Data Retention</h4>
                    <p className="text-sm text-gray-500">
                      Analytics data is kept for {profile.tier === 'pro' ? 'unlimited time' : '30 days'}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${
                    profile.tier === 'pro' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {profile.tier === 'pro' ? 'Pro Plan: Forever' : 'Free Plan: 30 Days'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Color Info Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Palette className="w-5 h-5 text-gray-600" />
                <span>Background Color</span>
              </CardTitle>
              <CardDescription>
                Customize your page background color in the Appearance editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Palette className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">
                  {profile.tier === 'pro' ? 'Available in Appearance' : 'Pro Feature'}
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  {profile.tier === 'pro' 
                    ? 'Customize your background color in the Appearance editor' 
                    : 'Upgrade to Pro to customize your background color'
                  }
                </p>
                {profile.tier === 'pro' ? (
                  <Button asChild variant="outline" size="sm" className="border-gray-300">
                    <a href="/dashboard/appearance">
                      Go to Appearance
                    </a>
                  </Button>
                ) : (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Upgrade to Pro
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Advanced Tab */}
      <TabsContent value="advanced" className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              Irreversible and destructive actions. Proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Delete Account</span>
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data including:
                </p>
                <ul className="text-sm text-gray-600 mb-4 space-y-1 ml-4">
                  <li>• Your profile and all links</li>
                  <li>• All analytics data</li>
                  <li>• QR codes and deep links</li>
                  <li>• Custom appearance settings</li>
                </ul>
                <p className="text-sm font-medium text-red-600 mb-4">
                  This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingAccount ? 'Deleting Account...' : 'Delete My Account'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
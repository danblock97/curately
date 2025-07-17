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
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { ExternalLink, Github, AlertTriangle } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface SettingsFormProps {
  user: User
  profile: Profile
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const [username, setUsername] = useState(profile.username)
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const supabase = createClient()

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingUsername(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase().trim() })
        .eq('id', profile.id)

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Account Created</Label>
              <p className="text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {user.app_metadata?.providers && user.app_metadata.providers.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Connected Accounts</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.app_metadata.providers.map((provider: string) => (
                  <Badge key={provider} variant="outline" className="flex items-center space-x-1">
                    {getProviderIcon(provider)}
                    <span className="capitalize">{provider}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-700">Public Profile</Label>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-900">curately.co.uk/{profile.username}</span>
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>
            Update your username. This will change your public profile URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">curately.co.uk/</span>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-gray-500">
                3-30 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isUpdatingUsername || username === profile.username || !username.trim()}
            >
              {isUpdatingUsername ? 'Updating...' : 'Update Username'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, Edit3, Settings, Globe } from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Page = Database['public']['Tables']['pages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PagesManagerProps {
  profile: Profile
  userId: string
}

export function PagesManager({ profile, userId }: PagesManagerProps) {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const supabase = createClient()

  // Load user's pages
  useEffect(() => {
    loadPages()
  }, [userId])

  const loadPages = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Failed to load pages:', error)
      toast.error('Failed to load pages')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      newErrors.username = 'Username must be 3-50 characters and contain only letters, numbers, underscores, or dashes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreatePage = async () => {
    if (!validateForm()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/pages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.toLowerCase(),
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create page')
      }

      toast.success('Page created successfully!')
      setShowCreateForm(false)
      setUsername('')
      setDisplayName('')
      setBio('')
      setErrors({})
      
      // Reload pages
      await loadPages()

    } catch (error) {
      console.error('Failed to create page:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create page'
      toast.error(errorMessage)
      
      if (errorMessage.includes('already taken')) {
        setErrors({ username: 'This username is already taken' })
      }
    } finally {
      setIsCreating(false)
    }
  }

  const canCreatePage = profile.tier === 'pro' && pages.length < 2

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Pages</h2>
          <p className="text-gray-600">
            Manage your public pages. Pro users can create up to 2 pages.
          </p>
        </div>
        {canCreatePage && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        )}
      </div>

      {/* Plan limitation notice */}
      {profile.tier === 'free' && (
        <Card className="border border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Upgrade to Pro for Multiple Pages</h3>
                <p className="text-sm text-amber-700">
                  Create a second public page with its own unique username. Perfect for different brands or projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pages List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading pages...</div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {page.display_name || page.username}
                        </h3>
                        {page.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        {!page.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">@{page.username}</p>
                      {page.bio && (
                        <p className="text-sm text-gray-500 mt-1">{page.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${page.username}`, '_blank')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/appearance?pageId=${page.id}`)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Page Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Page</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setErrors({})
                    setUsername('')
                    setDisplayName('')
                    setBio('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your-page-name"
                    className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your page URL: /{username || 'your-page-name'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Display Name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell people about this page..."
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <Button
                  onClick={handleCreatePage}
                  disabled={isCreating}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                >
                  {isCreating ? 'Creating...' : 'Create Page'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setErrors({})
                    setUsername('')
                    setDisplayName('')
                    setBio('')
                  }}
                  className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
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
  const [pageName, setPageName] = useState('')
  const [pageDescription, setPageDescription] = useState('')
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
    } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      newErrors.username = 'Username must be 3-50 characters and contain only letters, numbers, and underscores (no spaces)'
    }

    if (!pageName.trim()) {
      newErrors.pageName = 'Page name is required'
    } else if (pageName.trim().length < 1 || pageName.trim().length > 50) {
      newErrors.pageName = 'Page name must be 1-50 characters'
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
          display_name: pageName.trim() || null,
          bio: pageDescription.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create page')
      }

      toast.success('Page created successfully!')
      setShowCreateForm(false)
      setUsername('')
      setPageName('')
      setPageDescription('')
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

  const canCreatePage = profile.tier === 'pro' && pages.filter(page => page.is_active !== false).length < 2

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Pages</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your public pages. Pro users can create up to 2 pages.
          </p>
        </div>
        {canCreatePage && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto"
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
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
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

      {/* Inactive Pages Notice */}
      {!isLoading && pages.some(page => !page.is_active) && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Pages Deactivated</h3>
                <p className="text-sm text-orange-700">
                  Some pages were deactivated due to free plan limits. Upgrade to Pro to reactivate them.
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
            <Card key={page.id} className={`${
              page.is_active 
                ? "bg-white border border-gray-200" 
                : "bg-gray-50 border border-gray-300 opacity-75"
            }`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      page.is_active 
                        ? "bg-gray-100" 
                        : "bg-gray-200"
                    }`}>
                      <Globe className={`w-6 h-6 ${
                        page.is_active 
                          ? "text-gray-600" 
                          : "text-gray-400"
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {page.page_title || page.username}
                        </h3>
                        <div className="flex items-center space-x-2">
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
                      </div>
                      <p className="text-sm text-gray-600 truncate">@{page.username}</p>
                      {page.page_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{page.page_description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${page.username}`, '_blank')}
                      className="text-gray-600 hover:text-gray-900 w-full sm:w-auto"
                      disabled={!page.is_active}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {page.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/appearance?pageId=${page.id}`)}
                        className="text-gray-600 hover:text-gray-900 w-full sm:w-auto"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.error('This page is inactive. Upgrade to Pro to reactivate and edit your additional pages.')
                        }}
                        className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 w-full sm:w-auto"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Upgrade to Edit</span>
                        <span className="sm:hidden">Upgrade</span>
                      </Button>
                    )}
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
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl mx-4">
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
                    setPageName('')
                    setPageDescription('')
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
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="your_page_name"
                    className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your page URL: /{username || 'your_page_name'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="pageName" className="text-sm font-medium text-gray-700">
                    Page Name *
                  </Label>
                  <Input
                    id="pageName"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="My Awesome Page"
                    className={`mt-1 ${errors.pageName ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.pageName && (
                    <p className="text-sm text-red-600 mt-1">{errors.pageName}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    This will be displayed as your page title
                  </p>
                </div>

                <div>
                  <Label htmlFor="pageDescription" className="text-sm font-medium text-gray-700">
                    Page Description
                  </Label>
                  <Textarea
                    id="pageDescription"
                    value={pageDescription}
                    onChange={(e) => setPageDescription(e.target.value)}
                    placeholder="Describe what visitors can find on this page..."
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional description shown to visitors
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
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
                    setPageName('')
                    setPageDescription('')
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
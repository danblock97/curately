'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Link2, Sparkles, ArrowRight, Check, FileText, Upload, Image as ImageIcon } from 'lucide-react'

interface ProfileSetupProps {
  userId: string
}

export function ProfileSetup({ userId }: ProfileSetupProps) {
  // Profile data
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  // Page data
  const [username, setUsername] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const [pageDescription, setPageDescription] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    { id: 'welcome', title: 'Welcome!', description: 'Let\'s get you started' },
    { id: 'profile', title: 'Profile Setup', description: 'Tell us about yourself' },
    { id: 'page', title: 'Page Setup', description: 'Create your first page' },
    { id: 'complete', title: 'All Set!', description: 'You\'re ready to go!' }
  ]

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalAvatarUrl = avatarUrl.trim() || null
      
      // Upload avatar file if selected
      if (avatarFile) {
        setIsUploadingAvatar(true)
        
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${userId}.${fileExt}`
        const filePath = `${userId}/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          console.error('Avatar upload error:', uploadError)
          toast.error('Error uploading avatar. Please try again.')
          setIsLoading(false)
          setIsUploadingAvatar(false)
          return
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        finalAvatarUrl = publicUrl
        setIsUploadingAvatar(false)
      }
      
      // Create the profile record (account info + global display data)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          tier: 'free',
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: finalAvatarUrl
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        toast.error('Error creating profile. Please try again.')
        setIsLoading(false)
        return
      }

      setCurrentStep(2) // Move to page setup
      toast.success('Profile created successfully!')
    } catch (error) {
      console.error('Profile setup error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if username is available
      const { data: existingPage } = await supabase
        .from('pages')
        .select('username')
        .eq('username', username.toLowerCase().trim())
        .single()

      if (existingPage) {
        toast.error('Username already taken. Please choose another.')
        setIsLoading(false)
        return
      }

      // Create the primary page record (page-specific info)
      const { error: pageError } = await supabase
        .from('pages')
        .insert({
          user_id: userId,
          username: username.toLowerCase().trim(),
          page_title: pageTitle.trim() || 'My Page',
          page_description: pageDescription.trim() || 'Welcome to my page',
          background_color: '#ffffff',
          is_primary: true,
          is_active: true
        })

      if (pageError) {
        console.error('Page creation error:', pageError)
        if (pageError.code === '23505') {
          toast.error('Username already taken. Please choose another.')
        } else {
          toast.error('Error creating page. Please try again.')
        }
        setIsLoading(false)
        return
      }

      setCurrentStep(3) // Move to completion
      toast.success('Page created successfully!')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        console.log('Attempting to redirect to dashboard...')
        try {
          router.push('/dashboard')
        } catch (error) {
          console.error('Router.push failed, trying window.location:', error)
          window.location.href = '/dashboard'
        }
      }, 2000)
    } catch (error) {
      console.error('Page setup error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStarted = () => {
    setCurrentStep(1)
  }

  // Handle blob URL creation and cleanup
  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile)
      setAvatarPreviewUrl(url)
      
      // Cleanup function to revoke the blob URL
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setAvatarPreviewUrl('')
    }
  }, [avatarFile])

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-white"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 pt-8">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index <= currentStep 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 text-gray-600 border border-gray-300'
                }`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all ${
                    index < currentStep ? 'bg-gray-900' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-md">
          {currentStep === 0 && (
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                  <Link2 className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-gray-900">
                    Welcome to Curately!
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Let's set up your profile and create your first page
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Create your unique profile</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Share all your links in one place</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm">Customize your page design</span>
                </div>
              </div>

              <Button
                onClick={handleGetStarted}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Set Up Your Profile</h2>
                <p className="text-gray-600">
                  Tell us about yourself - this information will be shown across all your pages
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-gray-900">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={50}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                    />
                    <p className="text-xs text-gray-500">
                      This will be shown across all your pages
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-900">Bio</Label>
                    <textarea
                      id="bio"
                      placeholder="Tell people about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={160}
                      rows={3}
                      className="flex w-full rounded-md border bg-white border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500">
                      {bio.length}/160 characters • Shown across all your pages
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900">Profile Picture</Label>
                    <div className="space-y-4">
                      {/* Avatar Preview */}
                      {(avatarUrl || avatarPreviewUrl) && (
                        <div className="flex justify-center">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                            <img
                              src={avatarPreviewUrl || avatarUrl}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Avatar preview failed to load')
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmM2Y0ZjYiIHN0cm9rZT0iIzllYTNhOCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xNiAxNi0zLjUtNC41LTIuNSAzTDggMTBsLTQgNmgxMloiIGZpbGw9IiM5ZWEzYTgiLz4KPC9zdmc+'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (avatarPreviewUrl) {
                                  URL.revokeObjectURL(avatarPreviewUrl)
                                  setAvatarPreviewUrl('')
                                }
                                setAvatarFile(null)
                                setAvatarUrl('')
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* File Upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                toast.error('Please select an image file')
                                return
                              }
                              
                              // Validate file size (5MB limit)
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error('File size must be less than 5MB')
                                return
                              }
                              
                              console.log('File selected:', file.name, file.type, file.size)
                              setAvatarFile(file)
                              setAvatarUrl('') // Clear URL if file is selected
                            }
                          }}
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Click to upload an image
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {/* OR separator */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <Input
                          type="url"
                          placeholder="https://example.com/your-avatar.jpg"
                          value={avatarUrl}
                          onChange={(e) => {
                            setAvatarUrl(e.target.value)
                            if (e.target.value) {
                              // Clear file and preview if URL is entered
                              if (avatarPreviewUrl) {
                                URL.revokeObjectURL(avatarPreviewUrl)
                                setAvatarPreviewUrl('')
                              }
                              setAvatarFile(null)
                            }
                          }}
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Or paste an image URL
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                    disabled={isLoading || isUploadingAvatar}
                  >
                    {(isLoading || isUploadingAvatar) ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2" />
                    ) : null}
                    {isUploadingAvatar ? 'Uploading Avatar...' : isLoading ? 'Creating Profile...' : 'Continue'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Create Your First Page</h2>
                <p className="text-gray-600">
                  Set up your page URL and page-specific content
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <form onSubmit={handlePageSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-900">Username *</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 whitespace-nowrap">curately.co.uk/</span>
                      <Input
                        id="username"
                        type="text"
                        placeholder="yourusername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        required
                        minLength={3}
                        maxLength={30}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      3-30 characters. Letters, numbers, and underscores only.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageTitle" className="text-gray-900">Page Title *</Label>
                    <Input
                      id="pageTitle"
                      type="text"
                      placeholder="My Awesome Page"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      required
                      maxLength={50}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
                    />
                    <p className="text-xs text-gray-500">
                      The title displayed on this specific page
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageDescription" className="text-gray-900">Page Description</Label>
                    <textarea
                      id="pageDescription"
                      placeholder="Welcome to my page..."
                      value={pageDescription}
                      onChange={(e) => setPageDescription(e.target.value)}
                      maxLength={200}
                      rows={3}
                      className="flex w-full rounded-md border bg-white border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500">
                      {pageDescription.length}/200 characters • Description for this specific page
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                    disabled={isLoading || !username.trim() || !pageTitle.trim()}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2" />
                    ) : null}
                    {isLoading ? 'Creating Page...' : 'Create Page'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    All Set!
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Your profile and first page have been created successfully
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your URL:</span>
                    <span className="text-gray-900 font-mono">curately.co.uk/{username}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Display Name:</span>
                    <span className="text-gray-900">{displayName || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Page Title:</span>
                    <span className="text-gray-900">{pageTitle || 'My Page'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Page Description:</span>
                    <span className="text-gray-900">{pageDescription || 'Welcome to my page'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bio:</span>
                    <span className="text-gray-900">{bio || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                  <span className="text-sm">Setting up your dashboard...</span>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={() => {
                      console.log('Manual redirect to dashboard...')
                      try {
                        router.push('/dashboard')
                      } catch (error) {
                        console.error('Manual router.push failed, using window.location:', error)
                        window.location.href = '/dashboard'
                      }
                    }}
                    className="mt-4 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
                  >
                    Go to Dashboard
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Not redirecting automatically? Click the button above.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
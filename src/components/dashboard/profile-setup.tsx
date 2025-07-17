'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { User, Link2, Sparkles, ArrowRight, Check } from 'lucide-react'

interface ProfileSetupProps {
  userId: string
}

export function ProfileSetup({ userId }: ProfileSetupProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    { id: 'welcome', title: 'Welcome!', description: 'Let\'s get you started' },
    { id: 'profile', title: 'Profile Setup', description: 'Tell us about yourself' },
    { id: 'complete', title: 'All Set!', description: 'Your profile is ready' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username.toLowerCase().trim(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          theme: 'light'
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('Username already taken. Please choose another.')
        } else {
          toast.error('Error creating profile. Please try again.')
        }
        return
      }

      setCurrentStep(2)
      toast.success('Profile created successfully!')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStarted = () => {
    setCurrentStep(1)
  }

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
          <div className="flex items-center justify-center space-x-4 mb-8">
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
                  <div className={`w-16 h-0.5 mx-4 transition-all ${
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
                    Let's set up your profile to get started with your link-in-bio page
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
                  Choose your username and tell people about yourself
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      {bio.length}/160 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                    disabled={isLoading || !username.trim()}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin mr-2" />
                    ) : null}
                    {isLoading ? 'Creating Profile...' : 'Create Profile'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {currentStep === 2 && (
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
                    Your profile has been created successfully
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
                    <span className="text-gray-600">Bio:</span>
                    <span className="text-gray-900">{bio || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                <span className="text-sm">Setting up your dashboard...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface Page {
  id: string
  user_id: string
  username: string
  page_title: string
  page_description: string | null
  background_color: string
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [primaryPage, setPrimaryPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth')
          return
        }

        setUser(user)

        // Get user profile with display fields
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError)
        } else if (profile) {
          setProfile(profile)

          // Get primary page for display data
          const { data: primaryPage, error: pageError } = await supabase
            .from('pages')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_primary', true)
            .single()
          
          if (pageError && pageError.code !== 'PGRST116') {
            console.error('Error fetching primary page:', pageError)
          } else if (primaryPage) {
            setPrimaryPage(primaryPage)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadData()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setProfile(null)
        setPrimaryPage(null)
        router.push('/auth')
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Reload data when user signs in
        checkAuthAndLoadData()
      }
    })

    // Listen for custom events from ProfileSetup completion
    const handleProfileSetupComplete = () => {
      checkAuthAndLoadData()
    }

    window.addEventListener('profileSetupComplete', handleProfileSetupComplete)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('profileSetupComplete', handleProfileSetupComplete)
    }
  }, [router, supabase])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect is handled above
  if (!user) {
    return null
  }

  // If no profile exists, don't show the sidebar/header layout (user needs to complete setup)
  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    )
  }

  // Render full dashboard layout
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardHeader user={user} profile={profile} primaryPage={primaryPage} />
      <div className="flex flex-1">
        <DashboardSidebar profile={profile} primaryPage={primaryPage} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
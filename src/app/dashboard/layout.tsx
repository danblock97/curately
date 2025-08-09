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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true
    const checkAuthAndLoadData = async () => {
      if (hasCheckedAuth) return
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth')
          return
        }

        if (!isMounted) return
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
            if (!isMounted) return
            setPrimaryPage(primaryPage)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      } finally {
        if (!isMounted) return
        setIsLoading(false)
        setHasCheckedAuth(true)
      }
    }

    // Run auth check on mount only once
    checkAuthAndLoadData()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setProfile(null)
        setPrimaryPage(null)
        setHasCheckedAuth(false)
        router.push('/auth')
      } else if (event === 'SIGNED_IN' && session?.user && !hasCheckedAuth) {
        // Reload data when user signs in only if we haven't checked yet
        setHasCheckedAuth(false)
        checkAuthAndLoadData()
      }
    })

    // Listen for custom events from ProfileSetup completion
    const handleProfileSetupComplete = () => {
      checkAuthAndLoadData()
    }

    window.addEventListener('profileSetupComplete', handleProfileSetupComplete)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      window.removeEventListener('profileSetupComplete', handleProfileSetupComplete)
    }
  }, [router, supabase, hasCheckedAuth])

  // Render layout immediately since server handles auth protection
  // The header and sidebar components will handle their own loading states
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <DashboardHeader user={user} profile={profile} primaryPage={primaryPage} />
      <div className="flex flex-1 relative z-10 lg:flex-row flex-col">
        <DashboardSidebar profile={profile} primaryPage={primaryPage} />
        <main className="flex-1 min-h-0 overflow-auto w-full">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
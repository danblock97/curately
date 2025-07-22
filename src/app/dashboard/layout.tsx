import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Get user profile with display fields
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, tier, display_name, bio, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single()

  // Get primary page for display data (only if profile exists)
  let primaryPage = null
  let pageError = null
  
  if (profile) {
    const result = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()
    
    primaryPage = result.data
    pageError = result.error
    
    if (pageError && pageError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching primary page:', pageError)
    }
  } else if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError)
  }

  // If no profile exists, don't show the sidebar/header layout (user needs to complete setup)
  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    )
  }
  
  // If no primary page, still show layout but with limited functionality
  if (!primaryPage) {
  }
  

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
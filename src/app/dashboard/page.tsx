import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LinkManager } from '@/components/dashboard/link-manager'
import { ProfileSetup } from '@/components/dashboard/profile-setup'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  // If no profile exists, show profile setup
  if (!profile) {
    return <ProfileSetup userId={user.id} />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Links</h1>
        <p className="text-gray-600">
          Manage your links and customize your profile page
        </p>
      </div>
      
      <LinkManager links={links || []} userId={user.id} />
    </div>
  )
}
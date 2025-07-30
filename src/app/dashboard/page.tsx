import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSetup } from '@/components/dashboard/profile-setup'
import { InactiveContentManager } from '@/components/dashboard/inactive-content-manager'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

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

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })

  // If no profile exists or no pages exist, show profile setup
  if (!profile || !pages || pages.length === 0) {
    return <ProfileSetup userId={user.id} />
  }

  return (
    <div className="w-full">
      <DashboardOverview 
        links={(links || []).filter(Boolean)} 
        qrCodes={(qrCodes || []).filter(Boolean)}
        userId={user.id} 
        profile={profile} 
        pages={pages || []}
      />
      <InactiveContentManager profile={profile} />
    </div>
  )
}
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
    .select('id, tier, display_name, bio, avatar_url, created_at, updated_at')
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

  // If no profile exists, show profile setup
  if (!profile) {
    return <ProfileSetup userId={user.id} />
  }

  return (
    <div className="w-full">
      <LinkManager 
        links={(links || []).filter(Boolean)} 
        qrCodes={(qrCodes || []).filter(Boolean)}
        userId={user.id} 
        profile={profile} 
        pages={pages || []}
      />
    </div>
  )
}
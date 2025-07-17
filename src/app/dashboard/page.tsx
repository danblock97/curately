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
    .select(`
      *,
      qr_codes (
        qr_code_data,
        format,
        size,
        foreground_color,
        background_color
      )
    `)
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  // If no profile exists, show profile setup
  if (!profile) {
    return <ProfileSetup userId={user.id} />
  }

  return (
    <div className="w-full">
      <LinkManager links={links || []} userId={user.id} />
    </div>
  )
}
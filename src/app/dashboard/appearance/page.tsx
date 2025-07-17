import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppearanceCustomizer } from '@/components/dashboard/appearance-customizer'

export default async function AppearancePage() {
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

  const { data: socialLinks } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', user.id)

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('order')

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <AppearanceCustomizer 
      profile={profile} 
      socialLinks={socialLinks || []} 
      links={links || []}
    />
  )
}
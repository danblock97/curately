import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppearanceForm } from '@/components/dashboard/appearance-form'

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

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appearance</h1>
        <p className="text-gray-600">
          Customize how your profile page looks
        </p>
      </div>
      
      <AppearanceForm profile={profile} socialLinks={socialLinks || []} />
    </div>
  )
}
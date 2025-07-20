import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PagesManager } from '@/components/dashboard/pages-manager'

export default async function PagesPage() {
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

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <PagesManager profile={profile} userId={user.id} />
    </div>
  )
}
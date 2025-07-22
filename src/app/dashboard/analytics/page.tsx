import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from '@/components/dashboard/analytics-client'

export default async function AnalyticsPage() {
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
    .order('clicks', { ascending: false })

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('clicks', { ascending: false })

  return <AnalyticsClient links={links || []} qrCodes={qrCodes || []} profile={profile} />
}
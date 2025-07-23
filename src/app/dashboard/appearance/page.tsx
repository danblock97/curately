import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppearanceCustomizer } from '@/components/dashboard/appearance-customizer'

interface PageProps {
  searchParams: Promise<{
    pageId?: string
  }>
}

export default async function AppearancePage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams
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

  const { data: socialLinks } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', user.id)

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
    .order('order')

  // Also fetch standalone QR codes
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index')

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <AppearanceCustomizer 
      profile={profile} 
      socialLinks={socialLinks || []} 
      links={links || []}
      qrCodes={qrCodes || []}
      pages={pages || []}
      selectedPageId={resolvedSearchParams.pageId}
    />
  )
}
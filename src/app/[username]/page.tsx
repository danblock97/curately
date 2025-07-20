import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilePage } from '@/components/profile/profile-page'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Get page by username with profile data
  const { data: page } = await supabase
    .from('pages')
    .select('*, profiles(display_name, bio, avatar_url, tier)')
    .eq('username', resolvedParams.username)
    .eq('is_active', true)
    .single()

  if (!page) {
    notFound()
  }

  // Get active links for this page
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
    .eq('page_id', page.id)
    .eq('is_active', true)
    .order('order', { ascending: true })

  // Get social media links for the user
  const { data: socialLinks } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', page.user_id)

  return (
    <ProfilePage
      page={page}
      profile={page.profiles}
      links={links || []}
      socialLinks={socialLinks || []}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('page_title, page_description, profiles(display_name, bio, avatar_url)')
    .eq('username', resolvedParams.username)
    .eq('is_active', true)
    .single()

  if (!page || !page.profiles) {
    return {
      title: 'User not found - Curately'
    }
  }

  const profile = page.profiles
  const title = page.page_title || profile.display_name || resolvedParams.username
  const description = page.page_description || profile.bio || `Check out ${title}'s links`

  return {
    title: `${title} - Curately`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}
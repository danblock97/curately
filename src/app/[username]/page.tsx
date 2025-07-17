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

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', resolvedParams.username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get active links
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
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('order', { ascending: true })

  // Get social media links
  const { data: socialLinks } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', profile.id)

  return (
    <ProfilePage
      profile={profile}
      links={links || []}
      socialLinks={socialLinks || []}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('username', resolvedParams.username)
    .single()

  if (!profile) {
    return {
      title: 'User not found - Curately'
    }
  }

  return {
    title: `${profile.display_name || resolvedParams.username} - Curately`,
    description: profile.bio || `Check out ${profile.display_name || resolvedParams.username}'s links`,
    openGraph: {
      title: `${profile.display_name || resolvedParams.username}`,
      description: profile.bio || `Check out ${profile.display_name || resolvedParams.username}'s links`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}
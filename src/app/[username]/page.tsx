import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilePage } from '@/components/profile/profile-page'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

interface QRCodeRecord {
  id: string
  user_id: string
  page_id: string
  title: string
  url: string
  clicks: number
  is_active: boolean
  short_code: string
  order_index: number
  qr_code_data: string
  created_at: string
  updated_at: string
  size?: number
  platform?: string
  username?: string
  display_name?: string
  profile_image_url?: string
  widget_type?: string
  content?: string
  caption?: string
  foreground_color?: string
  background_color?: string
  price?: string
  app_store_url?: string
  play_store_url?: string
  file_url?: string
  widget_position?: string
  web_position?: string
  mobile_position?: string
  format?: string
}

export default async function UserProfilePage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()


  // Get page by username
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('username', resolvedParams.username)
    .eq('is_active', true)
    .single()

  if (!page) {
    notFound()
  }

  // Get profile data separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', page.user_id)
    .single()

  // Get active links for this page
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('page_id', page.id)
    .eq('is_active', true)
    .order('order', { ascending: true })

  // Get active QR codes for this page
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('page_id', page.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true })


  // Get social media links for the user
  const { data: socialLinks } = await supabase
    .from('social_media_links')
    .select('*')
    .eq('user_id', page.user_id)


  // Combine links and QR codes into a single array for the ProfilePage component
  // First, enhance links with QR code data if they have matching QR codes
  const enhancedLinks = (links || []).map(link => {
    // Check if this link has a matching QR code
    const matchingQRCode = (qrCodes || []).find(qr => qr.url === link.url || qr.title === link.title)
    if (matchingQRCode) {
      return {
        ...link,
        link_type: 'qr_code', // Override link_type to qr_code
        qr_codes: {
          qr_code_data: matchingQRCode.qr_code_data,
          format: matchingQRCode.format,
          size: matchingQRCode.size,
          foreground_color: matchingQRCode.foreground_color,
          background_color: matchingQRCode.background_color
        }
      }
    }
    return link
  })

  // QR codes need to be converted to look like links with qr_codes data embedded
  const qrCodesAsLinks = (qrCodes || [])
    .filter(qr => !(links || []).some(link => qr.url === link.url || qr.title === link.title)) // Exclude QR codes already merged with links
    .map((qr: QRCodeRecord) => ({
    id: qr.id,
    user_id: qr.user_id,
    page_id: qr.page_id,
    title: qr.title,
    url: qr.url,
    link_type: 'qr_code',
    type: 'qr_code', // Add type property for ProfilePage component compatibility
    order: qr.order_index,
    clicks: qr.clicks,
    is_active: qr.is_active,
    created_at: qr.created_at,
    updated_at: qr.updated_at,
    size: qr.size,
    platform: qr.platform,
    username: qr.username,
    display_name: qr.display_name,
    profile_image_url: qr.profile_image_url,
    widget_type: qr.widget_type || 'qr_code',
    content: qr.content,
    caption: qr.caption,
    price: qr.price,
    app_store_url: qr.app_store_url,
    play_store_url: qr.play_store_url,
    file_url: qr.file_url,
    widget_position: qr.widget_position,
    web_position: qr.web_position,
    mobile_position: qr.mobile_position,
    // Embed QR code specific data
    qr_codes: {
      qr_code_data: qr.qr_code_data,
      format: qr.format,
      size: qr.size,
      foreground_color: qr.foreground_color,
      background_color: qr.background_color
    }
  }))

  // Combine all items and sort by order
  const allLinks = [...enhancedLinks, ...qrCodesAsLinks].sort((a, b) => (a.order || 0) - (b.order || 0))

  if (!profile) {
    notFound()
  }

  return (
    <ProfilePage
      page={page}
      profile={profile}
      links={allLinks}
      socialLinks={socialLinks || []}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('page_title, page_description, user_id')
    .eq('username', resolvedParams.username)
    .eq('is_active', true)
    .single()

  if (!page) {
    return {
      title: 'User not found - Curately'
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url')
    .eq('id', page.user_id)
    .single()

  if (!profile) {
    return {
      title: 'User not found - Curately'
    }
  }
  const title = profile?.display_name || page.page_title || resolvedParams.username
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
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Monitor, 
  Smartphone, 
  Copy, 
  Link, 
  Image as ImageIcon, 
  Type, 
  Grid3x3, 
  X,
  ArrowLeft,
  Upload,
  Edit,
  Maximize2,
  ChevronDown,
  Trash2,
  Mic,
  Package,
  Palette
} from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { WidgetModal } from './widget-modal'
import { createClient } from '@/lib/supabase/client'
import { usePlanLimits, checkCanCreateLink } from '@/hooks/use-plan-limits'

type Profile = Database['public']['Tables']['profiles']['Row']
type SocialLink = Database['public']['Tables']['social_media_links']['Row']
type Link = Database['public']['Tables']['links']['Row']
type Page = Database['public']['Tables']['pages']['Row']

interface AppearanceCustomizerProps {
  profile: Profile
  socialLinks: SocialLink[]
  links: Link[]
  pages: Page[]
}

export interface Widget {
  id: string
  type: 'social' | 'link' | 'image' | 'text' | 'voice' | 'product' | 'app' | 'media'
  size: 'thin' | 'small-square' | 'medium-square' | 'large-square' | 'wide' | 'tall'
  data: {
    platform?: string
    username?: string
    displayName?: string
    url?: string
    title?: string
    type?: string
    description?: string
    favicon?: string
    isPopularApp?: boolean
    appName?: string
    appLogo?: string
    profileImage?: string
    content?: string
    caption?: string
    file?: File
    price?: string
    appStoreUrl?: string
    playStoreUrl?: string
    fileUrl?: string
  }
  position: { x: number; y: number }
  webPosition: { x: number; y: number }
  mobilePosition: { x: number; y: number }
}

const sizeOptions = [
  { value: 'thin', label: 'Thin Rectangle', icon: <div className="w-3 h-0.5 bg-white border border-black rounded-full"></div> },
  { value: 'wide', label: 'Wide Rectangle', icon: <div className="w-3 h-1.5 bg-white border border-black rounded-sm"></div> },
  { value: 'tall', label: 'Tall Rectangle', icon: <div className="w-0.5 h-3 bg-white border border-black rounded-full"></div> },
  { value: 'small-square', label: 'Small Square', icon: <div className="w-2 h-2 bg-white border border-black rounded-sm"></div> },
  { value: 'large-square', label: 'Large Square', icon: <div className="w-3 h-3 bg-white border border-black rounded-sm"></div> }
]

// Mobile widgets are always small squares - no size options needed

export function AppearanceCustomizer({ profile, socialLinks, links, pages }: AppearanceCustomizerProps) {
  const [activeView, setActiveView] = useState<'web' | 'mobile'>('web')
  const [showWidgetModal, setShowWidgetModal] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; widget: Widget } | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showResizeMenu, setShowResizeMenu] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false)
  
  // Plan limits
  const planUsage = usePlanLimits(links, profile.tier)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingBackgroundColor, setIsUpdatingBackgroundColor] = useState(false)
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showTextDialog, setShowTextDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageTitle, setImageTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Handle hydration and initialize profile data
  useEffect(() => {
    setIsHydrated(true)
    setDisplayName(profile?.display_name || '')
    setBio(profile?.bio || '')
    
    // Initialize current page and background color
    const initialPage = pages?.find(p => p.is_primary) || pages?.[0] || null
    setCurrentPage(initialPage)
    setBackgroundColor(initialPage?.background_color || '#ffffff')
  }, [profile, pages])

  // Update background color when current page changes
  useEffect(() => {
    if (currentPage?.background_color) {
      setBackgroundColor(currentPage.background_color)
    }
  }, [currentPage?.id, currentPage?.background_color])

  // Load existing widgets from database on component mount
  useEffect(() => {
    const loadWidgets = async () => {
      // Prevent multiple concurrent loads
      if (isLoadingWidgets) {
        console.log('Already loading widgets, skipping...')
        return
      }
      
      if (!profile?.id) {
        console.log('No profile ID, skipping widget load')
        return
      }
      
      try {
        setIsLoadingWidgets(true)
        console.log('Loading widgets for page:', currentPage?.id, 'with', links?.length, 'links')
        
        // Load regular links
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profile?.id)
          .order('order')
        
        // Load QR codes separately (they're now independent)
        const { data: qrCodesData, error: qrCodesError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('user_id', profile?.id)
          .order('order_index')

        if (linksError) {
          console.error('Error loading links:', linksError)
          toast.error('Failed to load existing links')
          setIsLoadingWidgets(false)
          return
        }
        
        if (qrCodesError) {
          console.error('Error loading QR codes:', qrCodesError)
          toast.error('Failed to load existing QR codes')
          setIsLoadingWidgets(false)
          return
        }

        // Combine and process both regular links and QR codes
        const allItems = [
          ...(linksData || []).map(link => ({ ...link, type: 'link' })),
          ...(qrCodesData || []).map(qr => ({ ...qr, type: 'qr_code' }))
        ]
        
        if (allItems.length > 0) {
          // Convert all items to widgets with proper positioning and fetch metadata
          const linkWidgets: Widget[] = await Promise.all(
            allItems.map(async (item, index) => {
              console.log('Processing item:', item)
              let metadata = { description: '', favicon: '', isPopularApp: false, appName: '', appLogo: '' }
              
              // For regular links, fetch metadata
              if (item.type === 'link') {
                try {
                  // Only fetch metadata if URL exists and is valid
                  if (item.url && typeof item.url === 'string') {
                    const metadataResponse = await fetch(`/api/metadata?url=${encodeURIComponent(item.url)}`)
                    if (metadataResponse.ok) {
                      metadata = await metadataResponse.json()
                    }
                  }
                } catch (error) {
                  console.error('Failed to fetch metadata for item:', item.url, error)
                }
              }

              // Extract platform and username from URL to fetch display name
              let platform = ''
              let username = ''
              let displayName = ''
              
              try {
                // Only process URL if it exists and is valid
                if (item.url && typeof item.url === 'string') {
                  const urlObj = new URL(item.url)
                  const hostname = urlObj.hostname.toLowerCase()
                
                  if (hostname.includes('github.com')) {
                  platform = 'github'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0]
                  }
                } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
                  platform = 'twitter'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0]
                  }
                } else if (hostname.includes('instagram.com')) {
                  platform = 'instagram'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0]
                  }
                } else if (hostname.includes('tiktok.com')) {
                  platform = 'tiktok'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0].replace('@', '')
                  }
                } else if (hostname.includes('linkedin.com')) {
                  platform = 'linkedin'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 1 && pathSegments[0] === 'in') {
                    username = pathSegments[1]
                  }
                } else if (hostname.includes('youtube.com')) {
                  platform = 'youtube'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0].replace('@', '')
                  }
                } else if (hostname.includes('facebook.com')) {
                  platform = 'facebook'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0]
                  }
                } else if (hostname.includes('spotify.com')) {
                  platform = 'spotify'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 1 && pathSegments[0] === 'user') {
                    username = pathSegments[1] // Extract just the user ID, ignore query params
                  }
                } else if (hostname.includes('music.apple.com')) {
                  platform = 'apple_music'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 1 && pathSegments[0] === 'profile') {
                    username = pathSegments[1]
                  }
                } else if (hostname.includes('soundcloud.com')) {
                  platform = 'soundcloud'
                  const pathSegments = urlObj.pathname.split('/').filter(Boolean)
                  if (pathSegments.length > 0) {
                    username = pathSegments[0]
                  }
                }
                }
                
                // Fetch display name if we have platform and username
                if (platform && username) {
                  try {
                    console.log('Fetching display name for existing widget:', platform, username)
                    const profileMetadata = await fetchProfileMetadata(platform, username)
                    displayName = profileMetadata.displayName
                    console.log('Got display name for existing widget:', displayName)
                  } catch (error) {
                    console.warn('Failed to fetch display name for existing widget:', error)
                  }
                }
              } catch (error) {
                console.warn('Failed to extract platform info from URL:', item.url, error)
              }

              // Safe JSON parsing with fallback - position mobile widgets more tightly
              let widgetPosition = { x: 20, y: index * 80 + 20 }
              let webPosition = { x: 20, y: index * 80 + 20 }
              // Mobile position: 2 columns, 128px + 16px margin = 144px spacing
              const mobileCol = index % 2
              const mobileRow = Math.floor(index / 2)
              let mobilePosition = { 
                x: 20 + mobileCol * 144, // 20px margin + 144px per column (128px widget + 16px margin)
                y: 20 + mobileRow * 144  // 20px margin + 144px per row (128px widget + 16px margin)
              }
              
              try {
                if (item.widget_position && typeof item.widget_position === 'string') {
                  widgetPosition = JSON.parse(item.widget_position)
                } else if (item.widget_position && typeof item.widget_position === 'object') {
                  widgetPosition = item.widget_position as { x: number; y: number }
                }
              } catch (error) {
                console.warn('Failed to parse widget_position:', item.widget_position, error)
              }
              
              try {
                if (item.web_position && typeof item.web_position === 'string') {
                  webPosition = JSON.parse(item.web_position)
                } else if (item.web_position && typeof item.web_position === 'object') {
                  webPosition = item.web_position as { x: number; y: number }
                }
              } catch (error) {
                console.warn('Failed to parse web_position:', item.web_position, error)
              }
              
              try {
                if (item.mobile_position && typeof item.mobile_position === 'string') {
                  mobilePosition = JSON.parse(item.mobile_position)
                } else if (item.mobile_position && typeof item.mobile_position === 'object') {
                  mobilePosition = item.mobile_position as { x: number; y: number }
                }
              } catch (error) {
                console.warn('Failed to parse mobile_position:', item.mobile_position, error)
              }

              return {
                id: item.id,
                type: item.type === 'qr_code' ? 'link' : (item.widget_type || 'link') as const,
                size: (item.size || 'thin') as const,
                data: {
                  title: item.title || '',
                  url: item.url || '',
                  description: metadata.description || '',
                  favicon: metadata.favicon || '',
                  isPopularApp: metadata.isPopularApp || false,
                  appName: metadata.appName || '',
                  appLogo: metadata.appLogo || metadata.favicon || '',
                  platform: item.platform || platform || undefined,
                  username: item.username || username || undefined,
                  displayName: item.display_name || displayName || '',
                  profileImage: item.profile_image_url || '',
                  content: item.content || '',
                  caption: item.caption || '',
                  price: item.price || '',
                  appStoreUrl: item.app_store_url || '',
                  playStoreUrl: item.play_store_url || '',
                  fileUrl: item.file_url || '',
                  link_type: item.type === 'qr_code' ? 'qr_code' : (item.link_type || undefined),
                  // For QR codes, include QR-specific data
                  qr_codes: item.type === 'qr_code' ? [{
                    qr_code_data: item.qr_code_data,
                    format: item.format,
                    size: item.size,
                    foreground_color: item.foreground_color,
                    background_color: item.background_color
                  }] : undefined
                },
                position: widgetPosition,
                webPosition: webPosition,
                mobilePosition: mobilePosition
              }
            })
          )

          // Auto-arrange mobile widgets if they're overlapping (for migration from old data)
          const arrangedWidgets = autoArrangeMobileWidgets(linkWidgets)
          setWidgets(arrangedWidgets)
          console.log(`Loaded ${arrangedWidgets.length} existing links as widgets with metadata`)
          console.log('Widget positions:', arrangedWidgets.map(w => ({ id: w.id, title: w.data.title, mobile: w.mobilePosition, web: w.webPosition })))
        } else {
          // No links found, start with empty widgets
          setWidgets([])
          console.log('No existing links found, starting with empty widgets')
        }
      } catch (error) {
        console.error('Error loading widgets:', error)
        toast.error('Failed to load existing links')
      } finally {
        setIsLoadingWidgets(false)
      }
    }

    if (profile?.id) {
      loadWidgets()
    } else {
      // If no profile, just finish loading
      setIsLoadingWidgets(false)
    }
  }, [links?.length, currentPage?.id, profile?.id])

  const fetchLinkMetadata = async (url: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const metadata = await response.json()
        return {
          title: metadata.title || url,
          description: metadata.description || '',
          favicon: metadata.favicon || '',
          isPopularApp: metadata.isPopularApp || false,
          appName: metadata.appName || '',
          appLogo: metadata.appLogo || '',
          displayName: ''
        }
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
    } finally {
      setIsLoading(false)
    }
    return { title: url, description: '', favicon: '', isPopularApp: false, appName: '', appLogo: '', displayName: '' }
  }

  const fetchProfilePicture = async (platform: string, username: string) => {
    try {
      // Generate profile picture URLs for different platforms
      const profileUrls: { [key: string]: string } = {
        github: `https://github.com/${username}.png`,
        twitter: `https://unavatar.io/twitter/${username}`,
        instagram: `https://unavatar.io/instagram/${username}`,
        linkedin: `https://unavatar.io/linkedin/${username}`,
        tiktok: `https://unavatar.io/tiktok/${username}`,
        youtube: `https://unavatar.io/youtube/${username}`,
        facebook: `https://unavatar.io/facebook/${username}`,
        spotify: `https://unavatar.io/spotify/${username}`,
        apple_music: `https://unavatar.io/apple-music/${username}`,
        soundcloud: `https://unavatar.io/soundcloud/${username}`
      }
      
      const profileUrl = profileUrls[platform.toLowerCase()]
      if (!profileUrl) {
        console.warn(`No profile URL template for platform: ${platform}`)
        return ''
      }
      
      console.log(`Fetching profile picture for ${platform}/${username} from:`, profileUrl)
      
      // For GitHub, we can reliably return the URL since GitHub always provides a profile picture
      if (platform.toLowerCase() === 'github') {
        return profileUrl
      }
      
      // For other platforms, try to load the image to verify it exists
      return new Promise<string>((resolve) => {
        const img = new Image()
        img.onload = () => {
          console.log(`Profile picture found for ${platform}/${username}`)
          resolve(profileUrl)
        }
        img.onerror = () => {
          console.warn(`Profile picture not found for ${platform}/${username}`)
          resolve('')
        }
        img.src = profileUrl
        
        // Set timeout to avoid hanging
        setTimeout(() => {
          console.warn(`Profile picture timeout for ${platform}/${username}`)
          resolve('')
        }, 5000)
      })
    } catch (error) {
      console.warn('Failed to fetch profile picture:', error)
      return ''
    }
  }

  const fetchProfileMetadata = async (platform: string, username: string): Promise<{profileImage: string, displayName: string}> => {
    try {
      const profileImage = await fetchProfilePicture(platform, username)
      let displayName = username
      
      // Fetch display names from platform APIs where possible
      if (platform.toLowerCase() === 'github') {
        try {
          const response = await fetch(`https://api.github.com/users/${username}`)
          if (response.ok) {
            const data = await response.json()
            console.log('GitHub API response:', data)
            displayName = data.name || data.login || username
            console.log('Extracted display name:', displayName)
          }
        } catch (error) {
          console.warn('Failed to fetch GitHub display name:', error)
        }
      } else if (platform.toLowerCase() === 'twitter') {
        // For Twitter/X, we can try to extract display name from metadata
        // Since we don't have direct API access, we'll use a heuristic approach
        try {
          console.log('Fetching Twitter/X profile for:', username)
          const response = await fetch(`https://unavatar.io/twitter/${username}`)
          if (response.ok) {
            console.log('Twitter/X profile found via unavatar.io')
            // If unavatar works, we have a valid user - use username as display name for now
            displayName = `@${username}`
          } else {
            console.log('Twitter/X profile not found via unavatar.io, status:', response.status)
            displayName = `@${username}`
          }
        } catch (error) {
          console.warn('Failed to fetch Twitter display name:', error)
          displayName = `@${username}`
        }
      } else if (platform.toLowerCase() === 'instagram') {
        displayName = `@${username}`
      } else if (platform.toLowerCase() === 'tiktok') {
        displayName = `@${username}`
      } else if (platform.toLowerCase() === 'linkedin') {
        displayName = username
      } else if (platform.toLowerCase() === 'youtube') {
        displayName = `@${username}`
      } else if (platform.toLowerCase() === 'spotify') {
        // For Spotify, try to extract display name from metadata or clean username
        const cleanUsername = username.split('?')[0] // Remove query parameters
        displayName = cleanUsername
      } else if (platform.toLowerCase() === 'apple_music') {
        displayName = username
      } else if (platform.toLowerCase() === 'soundcloud') {
        displayName = username
      } else if (platform.toLowerCase() === 'podcast') {
        displayName = username
      } else {
        displayName = username
      }
      
      return { profileImage, displayName }
    } catch (error) {
      console.warn('Failed to fetch profile metadata:', error)
      return { profileImage: '', displayName: username }
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    try {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${profile.id}/widgets/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('widget-uploads')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data } = supabase.storage
        .from('widget-uploads')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const handleAddLink = () => {
    setShowLinkDialog(true)
  }

  const handleAddImage = () => {
    setShowImageDialog(true)
  }

  const handleAddText = () => {
    setShowTextDialog(true)
  }

  const handleCreateLink = async () => {
    if (!linkUrl.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    // Check plan limits before creating link
    const canCreate = checkCanCreateLink(links, 'link_in_bio', profile.tier)
    if (!canCreate.canCreate) {
      toast.error(canCreate.reason || 'Cannot create link')
      return
    }

    setIsLoading(true)
    try {
      let finalUrl = linkUrl.trim()
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }

      const metadata = await fetchLinkMetadata(finalUrl)
      
      // Save to links table first
      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .insert({
          user_id: profile?.id,
          page_id: currentPage?.id || pages?.find(p => p.is_primary)?.id || pages?.[0]?.id,
          title: linkTitle.trim() || metadata.title,
          url: finalUrl,
          order: widgets.length + 1,
          is_active: true,
          link_type: 'link_in_bio'
        })
        .select()
        .single()

      if (linkError) {
        toast.error('Failed to create link')
        return
      }

      // Create widget with database ID
      const newWidget: Widget = {
        id: linkData.id,
        type: 'link',
        size: activeView === 'mobile' ? 'small-square' : 'thin',
        data: {
          title: linkData.title,
          url: linkData.url,
          description: metadata.description,
          favicon: metadata.favicon,
          isPopularApp: metadata.isPopularApp,
          appName: metadata.appName,
          appLogo: metadata.appLogo
        },
        position: { x: 20, y: 20 },
        webPosition: { x: 20, y: 20 },
        mobilePosition: { x: 20, y: 20 }
      }

      // Note: Widget positioning is handled in UI state, not persisted to database
      // The widgets table is not being used for this implementation
      
      setWidgets(prev => [...prev, newWidget])
      setShowLinkDialog(false)
      setLinkUrl('')
      setLinkTitle('')
      toast.success('Link created successfully!')
    } catch (error) {
      console.error('Error creating link:', error)
      toast.error('Failed to create link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateImage = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid image URL')
      return
    }

    const newWidget: Widget = {
      id: `image-${Date.now()}`,
      type: 'image',
      size: 'small-square',
      data: {
        title: imageTitle.trim() || 'Image',
        url: imageUrl.trim()
      },
      position: { x: 20, y: 20 },
      webPosition: { x: 20, y: 20 },
      mobilePosition: { x: 20, y: 20 }
    }
    
    setWidgets(prev => [...prev, newWidget])
    setShowImageDialog(false)
    setImageUrl('')
    setImageTitle('')
  }

  const handleCreateText = () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text')
      return
    }

    const newWidget: Widget = {
      id: `text-${Date.now()}`,
      type: 'text',
      size: activeView === 'mobile' ? 'small-square' : 'wide',
      data: {
        title: textContent.trim(),
        type: 'text'
      },
      position: { x: 20, y: 20 },
      webPosition: { x: 20, y: 20 },
      mobilePosition: { x: 20, y: 20 }
    }
    
    setWidgets(prev => [...prev, newWidget])
    setShowTextDialog(false)
    setTextContent('')
  }

  const handleViewChange = (view: 'web' | 'mobile') => {
    setActiveView(view)
  }

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${profile?.username}`)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const updateProfile = async (field: 'display_name' | 'bio', value: string) => {
    if (isUpdating) return
    setIsUpdating(true)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value.trim() })
        .eq('id', profile?.id)

      if (error) {
        toast.error('Failed to update profile')
        return
      }

      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value)
  }

  const handleDisplayNameBlur = () => {
    if (displayName !== (profile?.display_name || profile?.username)) {
      updateProfile('display_name', displayName)
    }
  }

  const handleBioChange = (value: string) => {
    setBio(value)
  }

  const handleBioBlur = () => {
    if (bio !== (profile?.bio || '')) {
      updateProfile('bio', bio)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}.${fileExt}`
      const filePath = `${profile?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        toast.error('Failed to upload avatar')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id)

      if (updateError) {
        toast.error('Failed to update avatar')
        return
      }

      toast.success('Avatar updated!')
      window.location.reload()
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  const handleBackgroundColorUpdate = async (color: string) => {
    if (profile.tier && profile.tier !== 'pro') {
      toast.error('Background color customization is only available for Pro users.')
      return
    }

    // Validate hex color format
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/
    if (!hexColorRegex.test(color)) {
      toast.error('Invalid color format. Please use a valid hex color.')
      return
    }

    setIsUpdatingBackgroundColor(true)

    try {
      if (!currentPage) {
        toast.error('No page selected')
        return
      }
      console.log('Updating background color:', { color, pageId: currentPage.id })
      const { data, error } = await supabase
        .from('pages')
        .update({ background_color: color })
        .eq('id', currentPage.id)
        .select()

      if (error) {
        console.error('Background color update error:', error)
        toast.error(`Error updating background color: ${error.message}`)
        return
      }

      console.log('Background color update result:', data)
      setBackgroundColor(color)
      // Update current page state with new background color
      if (data && data[0]) {
        setCurrentPage(data[0])
      }
      toast.success('Background color updated successfully!')
    } catch (error) {
      console.error('Caught error in background color update:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsUpdatingBackgroundColor(false)
    }
  }

  const handleAddWidget = async (widget: Widget) => {
    try {
      if (!profile?.id) {
        toast.error('Profile not found')
        return
      }

      // Check plan limits before creating widget
      const linkTypeForCheck = widget.type === 'media' || widget.type === 'image' ? 'link_in_bio' : 'link_in_bio'
      const canCreate = checkCanCreateLink(links, linkTypeForCheck, profile.tier)
      
      if (!canCreate.canCreate) {
        toast.error(canCreate.reason || 'Cannot create widget')
        return
      }

      // Prepare the URL and title
      let finalUrl = widget.data.url || ''
      let title = widget.data.title || widget.data.platform || 'Widget'
      
      // For social platforms, use the username as title if available
      if (widget.data.username) {
        title = widget.data.platform === 'website' ? widget.data.username : `@${widget.data.username}`
      }

      // For media widgets without URL, use a placeholder that satisfies the constraint
      if (!finalUrl && (widget.type === 'media' || widget.type === 'image')) {
        finalUrl = 'https://placeholder.local/media'
      }

      // Ensure URL has protocol
      if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }

      // Final fallback for empty URLs - use placeholder to satisfy constraint
      if (!finalUrl) {
        finalUrl = 'https://placeholder.local/widget'
      }

      // Fetch metadata if we have a real URL (not placeholder)
      let metadata = { title, description: '', favicon: '', isPopularApp: false, appName: '', appLogo: '', profileImage: '', displayName: '', fileUrl: '' }
      if (finalUrl && !finalUrl.includes('placeholder.local')) {
        try {
          const linkMeta = await fetchLinkMetadata(finalUrl)
          metadata = { ...linkMeta, profileImage: '', displayName: '', fileUrl: '' }
        } catch (error) {
          console.warn('Failed to fetch metadata:', error)
        }
      }
      
      // Try to get profile metadata for social platforms
      if (widget.data.platform && widget.data.username) {
        try {
          console.log('Fetching profile metadata for:', widget.data.platform, widget.data.username)
          const profileMetadata = await fetchProfileMetadata(widget.data.platform, widget.data.username)
          if (profileMetadata.profileImage) {
            console.log('Profile picture found:', profileMetadata.profileImage)
            metadata.profileImage = profileMetadata.profileImage
          }
          if (profileMetadata.displayName && profileMetadata.displayName !== widget.data.username) {
            console.log('Display name found:', profileMetadata.displayName)
            metadata.displayName = profileMetadata.displayName
            // Update the title to use display name
            title = `@${widget.data.username}`
          }
          
          // For Spotify, try to extract display name from metadata description
          if (widget.data.platform === 'spotify' && !metadata.displayName) {
            try {
              const metadataResponse = await fetch(`/api/metadata?url=${encodeURIComponent(widget.data.url || '')}`)
              if (metadataResponse.ok) {
                const metadataData = await metadataResponse.json()
                if (metadataData.description) {
                  // Extract name from descriptions like "User · Dan Block"
                  const parts = metadataData.description.split(' · ')
                  if (parts.length > 1) {
                    metadata.displayName = parts[1].trim()
                  }
                }
              }
            } catch (error) {
              console.warn('Failed to fetch Spotify metadata:', error)
            }
          }
        } catch (error) {
          console.warn('Failed to fetch profile metadata:', error)
        }
      }
      
      // For social platforms without username, try to extract from URL
      if (!metadata.profileImage && widget.data.url && widget.data.platform && !widget.data.username) {
        try {
          const url = new URL(widget.data.url)
          const pathSegments = url.pathname.split('/').filter(Boolean)
          let extractedUsername = ''
          
          if (widget.data.platform === 'spotify' && pathSegments.length > 1 && pathSegments[0] === 'user') {
            extractedUsername = pathSegments[1] // For Spotify: /user/1145175414
          } else if (pathSegments.length > 0) {
            extractedUsername = pathSegments[0].replace('@', '') // For other platforms
          }
          
          if (extractedUsername) {
            const profileMetadata = await fetchProfileMetadata(widget.data.platform, extractedUsername)
            if (profileMetadata.profileImage) {
              metadata.profileImage = profileMetadata.profileImage
            }
            if (profileMetadata.displayName && profileMetadata.displayName !== extractedUsername) {
              metadata.displayName = profileMetadata.displayName
            }
          }
        } catch (error) {
          console.warn('Failed to extract username from URL:', error)
        }
      }
      
      // Handle file upload for media widgets
      if (widget.data.file) {
        try {
          const fileUrl = await uploadFile(widget.data.file)
          if (fileUrl) {
            metadata.fileUrl = fileUrl
          }
        } catch (error) {
          console.warn('Failed to upload file:', error)
        }
      }
      
      // Save to links table
      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .insert({
          user_id: profile?.id,
          page_id: currentPage?.id || pages?.find(p => p.is_primary)?.id || pages?.[0]?.id,
          title: title.trim() || metadata.title,
          url: finalUrl,
          order: widgets.length + 1,
          is_active: true,
          link_type: 'link_in_bio',
          size: widget.size,
          platform: widget.data.platform,
          username: widget.data.username,
          display_name: metadata.displayName,
          profile_image_url: metadata.profileImage,
          widget_type: widget.type,
          content: widget.data.content,
          caption: widget.data.caption,
          price: widget.data.price,
          app_store_url: widget.data.appStoreUrl,
          play_store_url: widget.data.playStoreUrl,
          file_url: metadata.fileUrl,
          widget_position: JSON.stringify(widget.position),
          web_position: JSON.stringify(widget.webPosition),
          mobile_position: JSON.stringify(widget.mobilePosition)
        })
        .select()
        .single()

      if (linkError) {
        console.error('Database error:', linkError)
        toast.error('Failed to save widget')
        return
      }

      // Create widget with database ID
      const newWidget: Widget = {
        id: linkData.id,
        type: widget.type,
        size: widget.size,
        data: {
          title: linkData.title,
          url: linkData.url,
          description: metadata.description,
          favicon: metadata.favicon,
          isPopularApp: metadata.isPopularApp,
          appName: metadata.appName,
          appLogo: metadata.appLogo,
          platform: widget.data.platform,
          username: widget.data.username,
          displayName: metadata.displayName || '',
          profileImage: metadata.profileImage || '',
          content: widget.data.content,
          caption: widget.data.caption,
          price: widget.data.price,
          appStoreUrl: widget.data.appStoreUrl,
          playStoreUrl: widget.data.playStoreUrl,
          fileUrl: metadata.fileUrl || ''
        },
        position: getInitialPosition(widget),
        webPosition: getInitialPosition(widget),
        mobilePosition: getInitialPosition(widget)
      }

      console.log('Created widget with data:', newWidget.data)

      setWidgets(prev => [...prev, newWidget])
      setShowWidgetModal(false)
      toast.success('Widget added successfully')
      
    } catch (error) {
      console.error('Error adding widget:', error)
      toast.error('Failed to add widget')
    }
  }

  // Function to handle view switching without automatic conversion
  const handleViewSwitch = (newView: 'web' | 'mobile') => {
    setActiveView(newView)
  }

  const handleResizeWidget = async (widgetId: string, newSize: Widget['size']) => {
    try {
      // In mobile view, only allow small squares
      if (activeView === 'mobile' && newSize !== 'small-square') {
        toast.error('Only small squares are allowed in mobile view')
        return
      }

      // Find the widget to determine if it's a QR code or regular link
      const widget = widgets.find(w => w.id === widgetId)
      if (!widget) {
        toast.error('Widget not found')
        return
      }

      // Check if this is a QR code widget
      const isQRCode = widget.data?.link_type === 'qr_code'
      
      // Update size in appropriate database table
      const { error } = await supabase
        .from(isQRCode ? 'qr_codes' : 'links')
        .update({ size: newSize })
        .eq('id', widgetId)
        .eq('user_id', profile?.id)

      if (error) {
        console.error('Error updating widget size:', error)
        toast.error('Failed to update widget size')
        return
      }

      // Update widget state with new size
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? { ...w, size: newSize } : w
      ))

      setShowResizeMenu(null)
      toast.success('Widget size updated')
    } catch (error) {
      console.error('Error updating widget size:', error)
      toast.error('Failed to update widget size')
    }
  }

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      console.log('Attempting to delete widget:', widgetId)
      // Find the widget to determine its type
      const widget = widgets.find(w => w.id === widgetId)
      
      if (!widget) {
        console.error('Widget not found in local state:', widgetId)
        toast.error('Widget not found')
        return
      }

      console.log('Found widget to delete:', widget)

      // Delete from links table for all widget types (they're all stored as links now)
      const { error: linkError } = await supabase
        .from('links')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', profile?.id)

      if (linkError) {
        console.error('Error deleting link from database:', linkError)
        toast.error('Failed to delete link')
        return
      }

      console.log('Successfully deleted from database')

      // Remove from local state
      setWidgets(prev => prev.filter(w => w.id !== widgetId))
      toast.success('Widget deleted successfully!')
    } catch (error) {
      console.error('Error removing widget:', error)
      toast.error('Failed to delete widget')
    }
  }

  const handleWidgetResize = (widgetId: string, newSize: Widget['size']) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, size: newSize } : w
    ))
  }

  // Enhanced grid system for better widget positioning
  const GRID_SIZE = 20
  const WIDGET_MARGINS = 8
  
  const snapToGrid = (position: { x: number; y: number }) => {
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    }
  }

  const getWidgetDimensions = (size: Widget['size']) => {
    // Mobile view dimensions (smaller to fit phone screen) - only small squares allowed
    if (activeView === 'mobile') {
      // All mobile widgets are small squares (128px for 2 per row with margins)
      return { width: 128, height: 128 }
    }
    
    // Web view dimensions (original sizes)
    switch (size) {
      case 'thin': return { width: 320, height: 48 }
      case 'small-square': return { width: 192, height: 192 }
      case 'medium-square': return { width: 224, height: 224 }
      case 'large-square': return { width: 320, height: 320 }
      case 'wide': return { width: 320, height: 128 }
      case 'tall': return { width: 208, height: 320 }
      default: return { width: 320, height: 48 }
    }
  }

  const checkCollision = (widget1: Widget, widget2: Widget) => {
    const dims1 = getWidgetDimensions(widget1.size)
    const dims2 = getWidgetDimensions(widget2.size)
    const pos1 = activeView === 'web' ? widget1.webPosition : widget1.mobilePosition
    const pos2 = activeView === 'web' ? widget2.webPosition : widget2.mobilePosition

    return !(
      pos1.x + dims1.width + WIDGET_MARGINS <= pos2.x ||
      pos2.x + dims2.width + WIDGET_MARGINS <= pos1.x ||
      pos1.y + dims1.height + WIDGET_MARGINS <= pos2.y ||
      pos2.y + dims2.height + WIDGET_MARGINS <= pos1.y
    )
  }

  const findValidPosition = (widget: Widget, targetPosition: { x: number; y: number }) => {
    const snappedPosition = snapToGrid(targetPosition)
    const testWidget = {
      ...widget,
      [activeView === 'web' ? 'webPosition' : 'mobilePosition']: snappedPosition
    }

    // Check if position is valid (no collisions)
    const hasCollision = widgets.some(w => 
      w.id !== widget.id && checkCollision(testWidget, w)
    )

    if (!hasCollision) {
      return snappedPosition
    }

    // If collision detected, find the nearest valid position
    const containerWidth = activeView === 'mobile' ? 272 : (gridRef.current ? gridRef.current.getBoundingClientRect().width - 48 : 600) // Mobile: 320-48=272 (2 widgets of 128px + margins), Web: full width minus padding
    const maxSearchDistance = activeView === 'mobile' ? 100 : 200
    
    for (let distance = GRID_SIZE; distance <= maxSearchDistance; distance += GRID_SIZE) {
      // Try positions in expanding squares around the target
      for (let x = -distance; x <= distance; x += GRID_SIZE) {
        for (let y = -distance; y <= distance; y += GRID_SIZE) {
          const candidatePosition = {
            x: Math.max(0, Math.min(containerWidth - getWidgetDimensions(widget.size).width, snappedPosition.x + x)),
            y: Math.max(0, snappedPosition.y + y)
          }
          
          const candidateWidget = {
            ...widget,
            [activeView === 'web' ? 'webPosition' : 'mobilePosition']: candidatePosition
          }

          const hasCollision = widgets.some(w => 
            w.id !== widget.id && checkCollision(candidateWidget, w)
          )

          if (!hasCollision) {
            return candidatePosition
          }
        }
      }
    }

    // If no valid position found, place below all widgets
    const maxY = widgets.reduce((max, w) => {
      if (w.id === widget.id) return max
      const pos = activeView === 'web' ? w.webPosition : w.mobilePosition
      const dims = getWidgetDimensions(w.size)
      return Math.max(max, pos.y + dims.height + WIDGET_MARGINS)
    }, 0)

    return { x: 20, y: Math.max(20, maxY + 20) }
  }

  const autoArrangeMobileWidgets = (widgets: Widget[]): Widget[] => {
    // Check if mobile widgets need to be rearranged (for migration from old data)
    const mobilePositions = widgets.map(w => w.mobilePosition)
    const hasOverlaps = mobilePositions.some((pos1, i) => 
      mobilePositions.some((pos2, j) => i !== j && pos1.x === pos2.x && pos1.y === pos2.y)
    )
    
    if (!hasOverlaps) {
      return widgets // No overlaps, return as-is
    }
    
    // Rearrange widgets in a 2-column grid
    return widgets.map((widget, index) => {
      const mobileCol = index % 2
      const mobileRow = Math.floor(index / 2)
      const newMobilePosition = { 
        x: 20 + mobileCol * 144, 
        y: 20 + mobileRow * 144  
      }
      
      return {
        ...widget,
        mobilePosition: newMobilePosition
      }
    })
  }

  const getInitialPosition = (widget: Widget) => {
    if (activeView === 'mobile') {
      // For mobile, find the next position in the 2-column grid
      const existingCount = widgets.length
      const mobileCol = existingCount % 2
      const mobileRow = Math.floor(existingCount / 2)
      const initialMobilePos = { 
        x: 20 + mobileCol * 144, 
        y: 20 + mobileRow * 144  
      }
      const tempWidget = { ...widget, position: initialMobilePos, webPosition: { x: 20, y: 20 }, mobilePosition: initialMobilePos }
      return findValidPosition(tempWidget, initialMobilePos)
    } else {
      // For web, use the existing logic
      const tempWidget = { ...widget, position: { x: 20, y: 20 }, webPosition: { x: 20, y: 20 }, mobilePosition: { x: 20, y: 20 } }
      return findValidPosition(tempWidget, { x: 20, y: 20 })
    }
  }

  const handleWidgetMove = async (widgetId: string, newPosition: { x: number; y: number }) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget) return
    
    const validPosition = findValidPosition(widget, newPosition)
    
    try {
      // Update position in database
      const updateData = {
        widget_position: JSON.stringify(validPosition),
        [activeView === 'web' ? 'web_position' : 'mobile_position']: JSON.stringify(validPosition)
      }
      
      const { error } = await supabase
        .from('links')
        .update(updateData)
        .eq('id', widgetId)
        .eq('user_id', profile?.id)

      if (error) {
        console.error('Error updating widget position:', error)
        toast.error('Failed to update widget position')
        return
      }

      // Update in local state
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? {
          ...w,
          position: validPosition,
          [activeView === 'web' ? 'webPosition' : 'mobilePosition']: validPosition
        } : w
      ))
    } catch (error) {
      console.error('Error updating widget position:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWidget || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const widget = widgets.find(w => w.id === draggedWidget)
    if (!widget) return

    // Account for container padding (24px on each side)
    const mousePosition = {
      x: Math.max(0, Math.min(rect.width - 48, e.clientX - rect.left - dragOffset.x - 24)),
      y: Math.max(0, e.clientY - rect.top - dragOffset.y - 24)
    }

    const previewPosition = findValidPosition(widget, mousePosition)
    setDragPreview({ x: previewPosition.x, y: previewPosition.y, widget })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWidget || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    // Account for container padding (24px on each side)
    const newPosition = {
      x: Math.max(0, Math.min(rect.width - 48, e.clientX - rect.left - dragOffset.x - 24)),
      y: Math.max(0, e.clientY - rect.top - dragOffset.y - 24)
    }

    handleWidgetMove(draggedWidget, newPosition)
    setDragPreview(null)
  }

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    setDragOffset(offset)
    setDraggedWidget(widgetId)
    setDragPreview(null)
    
    // Add some visual feedback
    if (e.currentTarget) {
      (e.currentTarget as HTMLElement).style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    if (e.currentTarget) {
      (e.currentTarget as HTMLElement).style.opacity = '1'
    }
    setDraggedWidget(null)
    setDragPreview(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear preview if leaving the container, not child elements
    if (e.currentTarget === e.target) {
      setDragPreview(null)
    }
  }

  const getWidgetSizeClass = (size: Widget['size'], inRightPanel = false) => {
    if (inRightPanel) {
      switch (size) {
        case 'thin': return 'w-80 h-14'
        case 'small-square': return 'w-48 h-48'
        case 'medium-square': return 'w-56 h-56'
        case 'large-square': return 'w-80 h-80'
        case 'wide': return 'w-80 h-36'
        case 'tall': return 'w-52 h-80'
        default: return 'w-full h-14'
      }
    }
    
    // Mobile view classes - only small squares allowed (2 per row)
    if (activeView === 'mobile') {
      return 'w-32 h-32' // ~128px for 2 per row with margins
    }
    
    // Web view classes (original sizes)
    switch (size) {
      case 'thin': return 'w-80 h-12'
      case 'small-square': return 'w-48 h-48'
      case 'medium-square': return 'w-56 h-56'
      case 'large-square': return 'w-80 h-80'
      case 'wide': return 'w-80 h-32'
      case 'tall': return 'w-52 h-80'
      default: return 'w-full h-12'
    }
  }

  const renderWidget = (widget: Widget, inRightPanel = false) => {
    // In mobile view, force all widgets to be treated as small-square for consistent behavior
    const effectiveSize = activeView === 'mobile' ? 'small-square' : widget.size
    const sizeClass = getWidgetSizeClass(effectiveSize, inRightPanel)
    const isHovered = hoveredWidget === widget.id
    const isDragged = draggedWidget === widget.id
    const currentPosition = activeView === 'web' ? widget.webPosition : widget.mobilePosition

    const widgetContent = () => {
      const renderSocialWidget = () => {
        // Handle QR Code widgets first
        if (widget.data.link_type === 'qr_code' && widget.data.qr_codes && widget.data.qr_codes[0]) {
          const qrData = widget.data.qr_codes[0]
          
          // Get QR code size based on widget size and view - make it fill most of the space
          const getQRSize = () => {
            if (effectiveSize === 'thin') {
              return activeView === 'mobile' ? 'w-10 h-10' : 'w-12 h-12'
            }
            
            switch (effectiveSize) {
              case 'small-square':
                return activeView === 'mobile' ? 'w-20 h-20' : 'w-28 h-28'
              case 'medium-square':
                return activeView === 'mobile' ? 'w-32 h-32' : 'w-44 h-44'
              case 'large-square':
                return activeView === 'mobile' ? 'w-40 h-40' : 'w-56 h-56'
              default:
                return activeView === 'mobile' ? 'w-20 h-20' : 'w-28 h-28'
            }
          }
          
          const qrSizeClass = getQRSize()
          
          // Different layouts based on effective size
          if (effectiveSize === 'thin') {
            return (
              <div className="flex items-center h-full space-x-3 px-3">
                <div className={`${qrSizeClass} bg-white border border-gray-300 rounded-lg p-1 flex-shrink-0`}>
                  {qrData.format === 'SVG' ? (
                    <div 
                      className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrData.qr_code_data }}
                    />
                  ) : (
                    <img 
                      src={qrData.qr_code_data}
                      alt={`QR Code for ${widget.data.title}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {widget.data.title || 'QR Code'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    Scan to visit
                  </div>
                </div>
              </div>
            )
          }
          
          // Square layouts - match exact social widget styling
          return (
            <div className={`relative h-full w-full overflow-hidden ${
              activeView === 'mobile' ? 'rounded-lg' : 'rounded-xl'
            }`}>
              {/* QR Code with white background */}
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                {qrData.format === 'SVG' ? (
                  <div 
                    className={`${qrSizeClass} [&>svg]:w-full [&>svg]:h-full`}
                    dangerouslySetInnerHTML={{ __html: qrData.qr_code_data }}
                  />
                ) : (
                  <img 
                    src={qrData.qr_code_data}
                    alt={`QR Code for ${widget.data.title}`}
                    className={`${qrSizeClass} object-contain`}
                  />
                )}
              </div>
              
              {/* Text overlay - compact and positioned to minimize QR code coverage */}
              <div className={`absolute z-10 ${
                activeView === 'mobile' ? 'bottom-1 left-1 right-1' : 'bottom-1 left-1 right-1'
              }`}>
                <div className={`${
                  activeView === 'mobile' ? 'text-xs' : 'text-xs'
                } font-medium text-black bg-white/90 px-1.5 py-0.5 rounded text-center truncate`}>
                  {widget.data.title || 'QR Code'}
                </div>
              </div>
            </div>
          )
        }
        
        const getSocialInfo = (platform: string) => {
          const socialIcons: { [key: string]: { bg: string; logo: string; gradient: string; logoStyle?: string; fallback: string } } = {
            twitter: { bg: 'bg-black', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg', gradient: 'from-gray-700 to-gray-900', logoStyle: 'invert', fallback: '𝕏' },
            instagram: { bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', gradient: 'from-pink-400 via-red-500 to-yellow-500', logoStyle: 'invert', fallback: '📷' },
            facebook: { bg: 'bg-blue-600', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg', gradient: 'from-blue-500 to-blue-700', logoStyle: 'invert', fallback: 'f' },
            linkedin: { bg: 'bg-blue-700', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', gradient: 'from-blue-600 to-blue-800', logoStyle: 'invert', fallback: 'in' },
            youtube: { bg: 'bg-red-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', gradient: 'from-red-500 to-red-700', logoStyle: 'invert', fallback: '▶️' },
            tiktok: { bg: 'bg-black', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', gradient: 'from-gray-900 to-black', logoStyle: 'invert', fallback: '🎵' },
            github: { bg: 'bg-gray-800', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', gradient: 'from-gray-700 to-gray-900', logoStyle: 'invert', fallback: '⚡' },
            spotify: { bg: 'bg-green-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg', gradient: 'from-green-400 to-green-600', logoStyle: 'invert', fallback: '🎵' },
            apple_music: { bg: 'bg-red-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applemusic.svg', gradient: 'from-red-400 to-red-600', logoStyle: 'invert', fallback: '🎵' },
            soundcloud: { bg: 'bg-orange-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/soundcloud.svg', gradient: 'from-orange-400 to-orange-600', logoStyle: 'invert', fallback: '☁️' },
            podcast: { bg: 'bg-purple-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/podcast.svg', gradient: 'from-purple-400 to-purple-600', logoStyle: 'invert', fallback: '🎙️' },
            website: { bg: 'bg-blue-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg', gradient: 'from-blue-400 to-blue-600', logoStyle: 'invert', fallback: '🌐' }
          }
          return socialIcons[platform.toLowerCase()] || { bg: 'bg-gray-500', logo: '', gradient: 'from-gray-400 to-gray-600', fallback: '🔗' }
        }
        
        // Extract platform from URL if not provided
        let platform = widget.data.platform || ''
        if (!platform && widget.data.url) {
          try {
            const urlObj = new URL(widget.data.url)
            const hostname = urlObj.hostname.toLowerCase()
            if (hostname.includes('github.com')) platform = 'GitHub'
            else if (hostname.includes('twitter.com') || hostname.includes('x.com')) platform = 'Twitter'
            else if (hostname.includes('instagram.com')) platform = 'Instagram'
            else if (hostname.includes('facebook.com')) platform = 'Facebook'
            else if (hostname.includes('linkedin.com')) platform = 'LinkedIn'
            else if (hostname.includes('youtube.com')) platform = 'YouTube'
            else if (hostname.includes('tiktok.com')) platform = 'TikTok'
            else if (hostname.includes('spotify.com')) platform = 'Spotify'
            else if (hostname.includes('music.apple.com')) platform = 'Apple Music'
            else if (hostname.includes('soundcloud.com')) platform = 'SoundCloud'
          } catch (e) {
            // Invalid URL, use default
          }
        }
        
        // Ensure platform name is properly capitalized
        const getCapitalizedPlatform = (platformName: string) => {
          const platformMap: { [key: string]: string } = {
            'github': 'GitHub',
            'twitter': 'Twitter', 
            'x': 'X',
            'instagram': 'Instagram',
            'facebook': 'Facebook',
            'linkedin': 'LinkedIn',
            'youtube': 'YouTube',
            'tiktok': 'TikTok',
            'spotify': 'Spotify',
            'apple_music': 'Apple Music',
            'soundcloud': 'SoundCloud',
            'website': 'Website'
          }
          return platformMap[platformName.toLowerCase()] || platformName.charAt(0).toUpperCase() + platformName.slice(1)
        }
        
        const capitalizedPlatform = getCapitalizedPlatform(platform)
        const socialInfo = getSocialInfo(platform)
        
        // Different layouts based on effective size (mobile view forces small-square)
        if (effectiveSize === 'thin') {
          return (
            <div className={`flex items-center h-full ${
              activeView === 'mobile' ? 'space-x-2 px-2' : 'space-x-3'
            }`}>
              <div className={`${
                activeView === 'mobile' ? 'w-6 h-6 rounded-lg' : 'w-8 h-8 rounded-xl'
              } flex items-center justify-center overflow-hidden bg-gradient-to-br ${socialInfo.gradient} ${
                activeView === 'mobile' ? 'p-1' : 'p-1.5'
              }`}>
                {widget.data.appLogo || socialInfo.logo ? (
                  <img 
                    src={widget.data.appLogo || socialInfo.logo} 
                    alt={platform}
                    className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-white text-xs font-bold">${socialInfo.fallback || (platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className={`text-white ${
                    activeView === 'mobile' ? 'text-xs' : 'text-sm'
                  } font-bold`}>
                    {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${
                  activeView === 'mobile' ? 'text-gray-900 text-xs' : 'text-gray-900 text-sm'
                } truncate`}>
                  {activeView === 'mobile'
                    ? (capitalizedPlatform || 'Link')
                    : (widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || capitalizedPlatform || 'Link'))
                  }
                </div>
              </div>
            </div>
          )
        }
        
        if (effectiveSize === 'small-square') {
          return (
            <div className={`relative h-full w-full overflow-hidden ${
              activeView === 'mobile' ? 'rounded-lg' : 'rounded-xl'
            }`}>
              {/* Background - Profile Picture or Platform Logo */}
              {widget.data.profileImage ? (
                <div className="absolute inset-0">
                  <img 
                    src={widget.data.profileImage} 
                    alt={widget.data.username || platform}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className={`absolute inset-0 ${
                    activeView === 'mobile' 
                      ? 'bg-gradient-to-t from-black/80 to-transparent' 
                      : 'bg-gradient-to-t from-black/60 to-transparent'
                  }`}></div>
                </div>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${socialInfo.gradient} flex items-center justify-center`}>
                  {socialInfo.logo ? (
                    <img 
                      src={socialInfo.logo} 
                      alt={platform}
                      className={`${
                        activeView === 'mobile' ? 'w-6 h-6' : 'w-8 h-8'
                      } object-contain ${socialInfo.logoStyle || ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-text');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`fallback-text ${
                    activeView === 'mobile' ? 'text-sm' : 'text-lg'
                  } font-bold text-white ${socialInfo.logo ? 'hidden' : ''}`}>
                    {socialInfo.fallback}
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className={`absolute ${
                activeView === 'mobile' ? 'bottom-1 left-1 right-1' : 'bottom-2 left-2 right-2'
              }`}>
                <div className={`${
                  activeView === 'mobile' ? 'text-xs' : 'text-xs'
                } font-medium text-white leading-tight`}>
                  {activeView === 'mobile'
                    ? (capitalizedPlatform || 'Link')
                    : (widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || capitalizedPlatform || 'Link'))
                  }
                </div>
                {widget.data.username && platform && activeView !== 'mobile' && (
                  <div className="text-xs text-white/80 mt-0.5 capitalize">
                    {platform}
                  </div>
                )}
              </div>
            </div>
          )
        }
        
        if (effectiveSize === 'medium-square') {
          return (
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              {/* Background - Profile Picture or Platform Logo */}
              {widget.data.profileImage ? (
                <div className="absolute inset-0">
                  <img 
                    src={widget.data.profileImage} 
                    alt={widget.data.username || platform}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${socialInfo.gradient} flex items-center justify-center`}>
                  {socialInfo.logo ? (
                    <img 
                      src={socialInfo.logo} 
                      alt={platform}
                      className={`w-12 h-12 object-contain ${socialInfo.logoStyle || ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-text');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`fallback-text text-2xl font-bold text-white ${socialInfo.logo ? 'hidden' : ''}`}>
                    {socialInfo.fallback}
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-sm font-medium text-white">
                  {widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link')}
                </div>
                {widget.data.username && platform && (
                  <div className="text-xs text-white/80 mt-1 capitalize">
                    {platform}
                  </div>
                )}
              </div>
            </div>
          )
        }
        
        if (effectiveSize === 'large-square') {
          return (
            <div className="relative h-full w-full overflow-hidden rounded-3xl">
              {/* Background - Profile Picture or Platform Logo */}
              {widget.data.profileImage ? (
                <div className="absolute inset-0">
                  <img 
                    src={widget.data.profileImage} 
                    alt={widget.data.username || platform}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Profile image failed to load:', widget.data.profileImage, 'for', widget.data.username, widget.data.platform)
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Find parent container and add fallback
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="absolute inset-0 bg-gradient-to-br ${socialInfo.gradient} flex items-center justify-center">
                            ${socialInfo.logo ? `<img src="${socialInfo.logo}" alt="${platform}" class="w-16 h-16 object-contain ${socialInfo.logoStyle || ''}" />` : ''}
                            <span class="text-3xl font-bold text-white ${socialInfo.logo ? 'hidden' : ''}">${socialInfo.fallback}</span>
                          </div>
                        `;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${socialInfo.gradient} flex items-center justify-center`}>
                  {socialInfo.logo ? (
                    <img 
                      src={socialInfo.logo} 
                      alt={platform}
                      className={`w-16 h-16 object-contain ${socialInfo.logoStyle || ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-text');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`fallback-text text-3xl font-bold text-white ${socialInfo.logo ? 'hidden' : ''}`}>
                    {socialInfo.fallback}
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-base font-semibold text-white">
                  {widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link')}
                </div>
                {widget.data.username && platform && (
                  <div className="text-sm text-white/80 mt-1 capitalize">
                    {platform}
                  </div>
                )}
              </div>
            </div>
          )
        }
        
        // Default wide layout (for wide and tall rectangles)
        return (
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            {/* Background - Profile Picture or Platform Logo */}
            {widget.data.profileImage ? (
              <div className="absolute inset-0">
                <img 
                  src={widget.data.profileImage} 
                  alt={widget.data.username || platform}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${socialInfo.gradient} flex items-center justify-center`}>
                {socialInfo.logo ? (
                  <img 
                    src={socialInfo.logo} 
                    alt={platform}
                    className={`w-14 h-14 object-contain ${socialInfo.logoStyle || ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-text');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`fallback-text text-2xl font-bold text-white ${socialInfo.logo ? 'hidden' : ''}`}>
                  {socialInfo.fallback}
                </span>
              </div>
            )}
            
            {/* Content */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-sm font-medium text-white">
                {widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link')}
              </div>
              {widget.data.username && platform && (
                <div className="text-xs text-white/80 mt-1 capitalize">
                  {platform}
                </div>
              )}
            </div>
          </div>
        )
      }
      
      const renderOtherWidget = () => {
        switch (widget.type) {
          case 'text':
            return (
              <div className="flex flex-col h-full p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Type className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-xs text-gray-500">Text</div>
                </div>
                <div className="flex-1 text-sm text-gray-900 line-clamp-3">
                  {widget.data.content || widget.data.title || 'Text content...'}
                </div>
              </div>
            )
          case 'media':
            return (
              <div className="flex flex-col h-full relative">
                {widget.data.fileUrl ? (
                  <>
                    <img 
                      src={widget.data.fileUrl} 
                      alt={widget.data.caption || 'Media'}
                      className="w-full h-full object-cover rounded"
                    />
                    {widget.data.caption && widget.size !== 'thin' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="text-white text-xs">{widget.data.caption}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            )
          case 'voice':
            return (
              <div className="flex items-center space-x-3 h-full">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">Voice Message</div>
                  <div className="text-xs text-gray-500">Click to play</div>
                </div>
              </div>
            )
          case 'product':
            return (
              <div className="flex items-center space-x-3 h-full">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{widget.data.title || 'Product'}</div>
                  {widget.data.price && (
                    <div className="text-sm text-green-600 font-semibold">{widget.data.price}</div>
                  )}
                  {widget.size !== 'thin' && (
                    <div className="text-xs text-gray-500">Product</div>
                  )}
                </div>
              </div>
            )
          case 'app':
            return (
              <div className="flex items-center space-x-3 h-full">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">{widget.data.title || 'App'}</div>
                  {widget.size !== 'thin' && (
                    <div className="text-xs text-gray-500">Download App</div>
                  )}
                </div>
              </div>
            )
          default:
            return renderSocialWidget()
        }
      }
      
      switch (widget.type) {
        case 'social':
          return renderSocialWidget()
        case 'link':
          return renderSocialWidget()
        default:
          return renderOtherWidget()
      }
    }

    if (inRightPanel) {
      return (
        <div
          key={widget.id}
          className={`${sizeClass} ${isDragged ? 'opacity-50' : ''}`}
          onMouseEnter={() => setHoveredWidget(widget.id)}
          onMouseLeave={() => setHoveredWidget(null)}
        >
          <Card className="h-full relative bg-white border border-gray-200">
            <CardContent className="p-4 h-full flex items-center justify-center">
              {widgetContent()}
            </CardContent>
            
            {isHovered && (
              <div className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-lg p-1 shadow-lg flex items-center space-x-1">
                {/* Only show resize options in web view */}
                {activeView === 'web' && sizeOptions.map(size => (
                  <Button
                    key={size.value}
                    variant={effectiveSize === size.value ? 'default' : 'ghost'}
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => handleResizeWidget(widget.id, size.value as Widget['size'])}
                    title={size.label}
                  >
                    {size.icon}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveWidget(widget.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      )
    }

    return (
      <div
        key={widget.id}
        className={`absolute ${sizeClass} ${isDragged ? 'opacity-50' : ''} transition-all duration-150 ease-out`}
        style={{
          transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
          zIndex: isDragged ? 50 : 1
        }}
        onMouseEnter={() => setHoveredWidget(widget.id)}
        onMouseLeave={() => setHoveredWidget(null)}
        draggable
        onDragStart={(e) => handleDragStart(e, widget.id)}
        onDragEnd={handleDragEnd}
      >
        <Card className={`h-full relative cursor-move ${
          activeView === 'mobile' 
            ? 'bg-transparent border-none shadow-none' 
            : 'bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
        } transition-all duration-150`}>
          <CardContent className={`h-full flex items-center justify-center ${
            activeView === 'mobile' ? 'p-0' : 'p-4'
          }`}>
            {widgetContent()}
          </CardContent>
          
          {/* Hover Controls */}
          {isHovered && (
            <div className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-lg p-1 shadow-lg flex items-center space-x-1">
              {/* Only show resize options in web view */}
              {activeView === 'web' && sizeOptions.map(size => (
                <Button
                  key={size.value}
                  variant={effectiveSize === size.value ? 'default' : 'ghost'}
                  size="sm"
                  className="w-6 h-6 p-0"
                  onClick={() => handleResizeWidget(widget.id, size.value as Widget['size'])}
                  title={size.label}
                >
                  {size.icon}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                onClick={() => handleRemoveWidget(widget.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </Card>
        {showResizeMenu === widget.id && (
          <div className="absolute top-10 right-0 bg-white border-2 border-black rounded-lg shadow-xl p-3 z-20">
            <div className="text-xs text-black font-semibold mb-2">Resize Widget</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={widget.size === 'thin' ? 'default' : 'outline'}
                className={`text-xs h-8 border-2 border-black font-medium ${
                  widget.size === 'thin' 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => handleResizeWidget(widget.id, 'thin')}
              >
                Thin
              </Button>
              <Button
                size="sm"
                variant={widget.size === 'small-square' ? 'default' : 'outline'}
                className={`text-xs h-8 border-2 border-black font-medium ${
                  widget.size === 'small-square' 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => handleResizeWidget(widget.id, 'small-square')}
              >
                Small
              </Button>
              <Button
                size="sm"
                variant={widget.size === 'medium-square' ? 'default' : 'outline'}
                className={`text-xs h-8 border-2 border-black font-medium ${
                  widget.size === 'medium-square' 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => handleResizeWidget(widget.id, 'medium-square')}
              >
                Medium
              </Button>
              <Button
                size="sm"
                variant={widget.size === 'large-square' ? 'default' : 'outline'}
                className={`text-xs h-8 border-2 border-black font-medium ${
                  widget.size === 'large-square' 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => handleResizeWidget(widget.id, 'large-square')}
              >
                Large
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return
          </Button>
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewSwitch('web')}
              className={`rounded-lg font-semibold transition-all ${
                activeView === 'web' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Web
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewSwitch('mobile')}
              className={`rounded-lg font-semibold transition-all ${
                activeView === 'mobile' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="ghost" size="sm">
            See page analytics
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Left Side - Profile Preview */}
        <div className={`${activeView === 'web' ? 'w-1/2' : 'w-full'} p-4 flex flex-col items-center`}>
          <div className={`w-full ${activeView === 'web' ? 'max-w-md' : 'max-w-7xl'}`}>
            {/* Profile Section */}
            <div className="text-center mb-8">
              <div className="relative mb-6 group">
                <label className="cursor-pointer block">
                  <div className="relative">
                    <Avatar className={`${activeView === 'web' ? 'w-36 h-36' : 'w-24 h-24'} mx-auto mb-4 ring-4 ring-white shadow-2xl`}>
                      <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                      <AvatarFallback className={`${activeView === 'web' ? 'text-4xl' : 'text-2xl'} bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold`}>
                        {isHydrated ? displayName.charAt(0).toUpperCase() || 'U' : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute inset-0 ${activeView === 'web' ? 'w-36 h-36' : 'w-24 h-24'} mx-auto mb-4 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                      <div className="text-center">
                        <Edit className={`${activeView === 'web' ? 'w-6 h-6' : 'w-4 h-4'} text-white mb-1 mx-auto`} />
                        <span className={`text-white ${activeView === 'web' ? 'text-xs' : 'text-xs'} font-medium`}>
                          Edit Photo
                        </span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                onBlur={handleDisplayNameBlur}
                className={`${
                  activeView === 'web' ? 'text-4xl' : 'text-2xl'
                } font-black mb-3 bg-transparent border-none text-center w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 rounded-lg px-3 py-2 transition-all hover:bg-gray-50/50 backdrop-blur-sm`}
                placeholder="Your name"
              />
              <textarea
                value={bio}
                onChange={(e) => handleBioChange(e.target.value)}
                onBlur={handleBioBlur}
                className={`${
                  activeView === 'web' ? 'text-lg' : 'text-base'
                } text-gray-700 font-medium mb-6 bg-transparent border-none text-center w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 rounded-lg px-3 py-2 transition-all hover:bg-gray-50/50 backdrop-blur-sm leading-relaxed`}
                placeholder="Tell people about yourself..."
                rows={activeView === 'web' ? 3 : 2}
              />
            </div>

            {/* Widgets Area - Only for mobile view */}
            {activeView === 'mobile' && (
              <div className="flex justify-center">
                <div 
                  ref={gridRef}
                  className={`relative min-h-[calc(100vh-250px)] w-80 bg-gray-50 rounded-lg p-6 border-2 border-dashed transition-all duration-200 ${
                    draggedWidget ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragLeave={handleDragLeave}
                  style={{
                    backgroundImage: `radial-gradient(circle at ${GRID_SIZE/2}px ${GRID_SIZE/2}px, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                    maxWidth: '320px',
                    overflow: 'visible',
                    minHeight: '600px'
                  }}
              >
                {!isHydrated || isLoadingWidgets ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-gray-500">Loading widgets...</div>
                  </div>
                ) : widgets.length === 0 ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center text-gray-500">
                      <div className="text-lg font-medium mb-2">No widgets yet</div>
                      <div className="text-sm">Use the toolbar below to add your first widget</div>
                    </div>
                  </div>
                ) : (
                  <div suppressHydrationWarning>
                    {widgets.map(widget => renderWidget(widget))}
                    
                    {/* Drag Preview */}
                    {dragPreview && (
                      <div
                        className="absolute pointer-events-none transition-all duration-100 ease-out"
                        style={{
                          transform: `translate(${dragPreview.x}px, ${dragPreview.y}px)`,
                          zIndex: 100
                        }}
                      >
                        <div className={`${getWidgetSizeClass(activeView === 'mobile' ? 'small-square' : dragPreview.widget.size)} opacity-60`}>
                          <Card className="h-full relative bg-blue-100 border-2 border-blue-400 border-dashed shadow-lg">
                            <CardContent className="p-4 h-full flex items-center justify-center">
                              <div className="text-blue-600 font-medium animate-pulse">Drop here</div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Widget Grid (Web View Only) */}
        {activeView === 'web' && (
          <div className="w-1/2 p-4">
            <div 
              ref={gridRef}
              className={`relative min-h-[calc(100vh-250px)] w-full bg-gray-50 rounded-lg p-6 border-2 border-dashed transition-all duration-200 ${
                draggedWidget ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              style={{
                backgroundImage: `radial-gradient(circle at ${GRID_SIZE/2}px ${GRID_SIZE/2}px, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              {!isHydrated || isLoadingWidgets ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-gray-500">Loading widgets...</div>
                </div>
              ) : widgets.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">No widgets yet</div>
                    <div className="text-sm">Use the toolbar below to add your first widget</div>
                  </div>
                </div>
              ) : (
                <div suppressHydrationWarning>
                  {widgets.map(widget => renderWidget(widget))}
                  
                  {/* Drag Preview */}
                  {dragPreview && (
                    <div
                      className="absolute pointer-events-none transition-all duration-100 ease-out"
                      style={{
                        transform: `translate(${dragPreview.x}px, ${dragPreview.y}px)`,
                        zIndex: 100
                      }}
                    >
                      <div className={`${getWidgetSizeClass(dragPreview.widget.size)} opacity-60`}>
                        <Card className="h-full relative bg-blue-100 border-2 border-blue-400 border-dashed shadow-lg">
                          <CardContent className="p-4 h-full flex items-center justify-center">
                            <div className="text-blue-600 font-medium animate-pulse">Drop here</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-full shadow-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLink}
              className="rounded-full text-gray-700 hover:bg-gray-100"
            >
              <Copy className="w-4 h-4 mr-1" />
              Share
            </Button>
            <div className="w-px h-6 bg-gray-200"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddLink}
              className="rounded-full text-gray-700 hover:bg-gray-100"
            >
              <Link className="w-4 h-4 mr-1" />
              Link
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddImage}
              className="rounded-full text-gray-700 hover:bg-gray-100"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddText}
              className="rounded-full text-gray-700 hover:bg-gray-100"
            >
              <Type className="w-4 h-4 mr-1" />
              Text
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWidgetModal(true)}
              className="rounded-full text-gray-700 hover:bg-gray-100"
            >
              <Grid3x3 className="w-4 h-4 mr-1" />
              Widgets
            </Button>
            {(profile.tier === 'pro' || !profile.tier) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                className="rounded-full text-gray-700 hover:bg-gray-100"
              >
                <Palette className="w-4 h-4 mr-1" />
                Background
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Widget Modal */}
      {showWidgetModal && (
        <WidgetModal
          isOpen={showWidgetModal}
          onClose={() => setShowWidgetModal(false)}
          onAddWidget={handleAddWidget}
          socialLinks={socialLinks}
          links={links}
        />
      )}

      {/* Background Color Picker */}
      {showBackgroundPicker && (profile.tier === 'pro' || !profile.tier) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Background Color</h3>
                    <p className="text-white/80 text-sm">Customize your page background</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowBackgroundPicker(false)}
                  className="text-white hover:bg-white/20 border-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {/* Color Picker Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bg-color" className="text-base font-semibold text-gray-900 mb-3 block">
                    Pick a Color
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        id="bg-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-16 h-16 rounded-2xl border-2 border-gray-200 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                        disabled={isUpdatingBackgroundColor}
                      />
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-offset-2 ring-gray-900/10"></div>
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#ffffff"
                        pattern="^#[0-9a-fA-F]{6}$"
                        className="font-mono text-lg text-gray-900 bg-gray-50 border-gray-200 h-12 rounded-xl"
                        disabled={isUpdatingBackgroundColor}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Color Presets */}
                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">
                    Popular Colors
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', 
                      '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000',
                      '#fef2f2', '#fee2e2', '#fecaca', '#f87171', '#ef4444', '#dc2626',
                      '#fefce8', '#fef3c7', '#fde68a', '#facc15', '#eab308', '#ca8a04',
                      '#f0fdf4', '#dcfce7', '#bbf7d0', '#4ade80', '#22c55e', '#16a34a',
                      '#eff6ff', '#dbeafe', '#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb',
                      '#faf5ff', '#f3e8ff', '#e9d5ff', '#c084fc', '#a855f7', '#9333ea'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                          backgroundColor === color ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        disabled={isUpdatingBackgroundColor}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Live Preview */}
                <div>
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">
                    Live Preview
                  </Label>
                  <div 
                    className="w-full h-24 rounded-xl border-2 border-gray-200 flex items-center justify-center relative overflow-hidden shadow-inner"
                    style={{ backgroundColor: backgroundColor || '#ffffff' }}
                  >
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                      <span className="text-sm text-gray-900 font-medium">Your Page Background</span>
                    </div>
                    <div className="absolute top-2 left-2 w-3 h-3 bg-white/50 rounded-full"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
                
              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <Button
                  onClick={() => handleBackgroundColorUpdate(backgroundColor)}
                  disabled={isUpdatingBackgroundColor || backgroundColor === currentPage?.background_color}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isUpdatingBackgroundColor ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Applying...</span>
                    </div>
                  ) : (
                    'Apply Changes'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBackgroundColor('#ffffff')
                    handleBackgroundColorUpdate('#ffffff')
                  }}
                  disabled={isUpdatingBackgroundColor}
                  className="h-12 px-6 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Link Popover */}
      {showLinkDialog && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="w-80 bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add Link</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(false)}>
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="link-url" className="text-sm font-medium text-gray-700">URL</Label>
                  <Input
                    id="link-url"
                    type="url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateLink()}
                    className="mt-1 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="link-title" className="text-sm font-medium text-gray-700">Title (optional)</Label>
                  <Input
                    id="link-title"
                    placeholder="Custom title"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateLink()}
                    className="mt-1 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLinkDialog(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateLink} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Popover */}
      {showImageDialog && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="w-80 bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add Image</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowImageDialog(false)}>
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="image-url" className="text-sm font-medium text-gray-700">Image URL</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateImage()}
                    className="mt-1 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="image-title" className="text-sm font-medium text-gray-700">Title (optional)</Label>
                  <Input
                    id="image-title"
                    placeholder="Image title"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateImage()}
                    className="mt-1 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowImageDialog(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateImage}>
                    Create
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Text Popover */}
      {showTextDialog && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="w-80 bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add Text</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowTextDialog(false)}>
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="text-content" className="text-sm font-medium text-gray-700">Text Content</Label>
                  <Input
                    id="text-content"
                    placeholder="Enter your text"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateText()}
                    className="mt-1 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowTextDialog(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateText}>
                    Create
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
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
  Package
} from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { toast } from 'sonner'
import { WidgetModal } from './widget-modal'
import { createClient } from '@/lib/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']
type SocialLink = Database['public']['Tables']['social_media_links']['Row']
type Link = Database['public']['Tables']['links']['Row']

interface AppearanceCustomizerProps {
  profile: Profile
  socialLinks: SocialLink[]
  links: Link[]
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

export function AppearanceCustomizer({ profile, socialLinks, links }: AppearanceCustomizerProps) {
  const [activeView, setActiveView] = useState<'web' | 'mobile'>('web')
  const [showWidgetModal, setShowWidgetModal] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [showResizeMenu, setShowResizeMenu] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true)
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
    setDisplayName(profile?.display_name || profile?.username || '')
    setBio(profile?.bio || '')
  }, [])

  // Load existing widgets from database on component mount
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        setIsLoadingWidgets(true)
        // Load links that can be converted to widgets
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profile?.id)
          .eq('is_active', true)
          .order('order')

        if (linksError) {
          console.error('Error loading links:', linksError)
          toast.error('Failed to load existing links')
          setIsLoadingWidgets(false)
          return
        }

        if (linksData && linksData.length > 0) {
          // Convert links to widgets with proper positioning and fetch metadata
          const linkWidgets: Widget[] = await Promise.all(
            linksData.map(async (link, index) => {
              let metadata = { description: '', favicon: '', isPopularApp: false, appName: '', appLogo: '' }
              
              try {
                // Fetch metadata for each link
                const metadataResponse = await fetch(`/api/metadata?url=${encodeURIComponent(link.url)}`)
                if (metadataResponse.ok) {
                  metadata = await metadataResponse.json()
                }
              } catch (error) {
                console.error('Failed to fetch metadata for link:', link.url, error)
              }

              // Extract platform and username from URL to fetch display name
              let platform = ''
              let username = ''
              let displayName = ''
              
              try {
                const urlObj = new URL(link.url)
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
                console.warn('Failed to extract platform info from URL:', link.url, error)
              }

              return {
                id: link.id,
                type: (link.widget_type || 'link') as const,
                size: (link.size || 'thin') as const,
                data: {
                  title: link.title,
                  url: link.url,
                  description: metadata.description || '',
                  favicon: metadata.favicon || '',
                  isPopularApp: metadata.isPopularApp || false,
                  appName: metadata.appName || '',
                  appLogo: metadata.appLogo || metadata.favicon || '',
                  platform: link.platform || platform || undefined,
                  username: link.username || username || undefined,
                  displayName: link.display_name || displayName || '',
                  profileImage: link.profile_image_url || '',
                  content: link.content || '',
                  caption: link.caption || '',
                  price: link.price || '',
                  appStoreUrl: link.app_store_url || '',
                  playStoreUrl: link.play_store_url || '',
                  fileUrl: link.file_url || ''
                },
                position: link.widget_position ? JSON.parse(link.widget_position) : { x: 20, y: index * 80 + 20 },
                webPosition: link.web_position ? JSON.parse(link.web_position) : { x: 20, y: index * 80 + 20 },
                mobilePosition: link.mobile_position ? JSON.parse(link.mobile_position) : { x: 20, y: index * 80 + 20 }
              }
            })
          )

          setWidgets(linkWidgets)
          console.log(`Loaded ${linkWidgets.length} existing links as widgets with metadata`)
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
  }, [profile?.id, supabase])

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
      if (!profileUrl) return ''
      
      // For GitHub, we can reliably return the URL since GitHub always provides a profile picture
      if (platform.toLowerCase() === 'github') {
        return profileUrl
      }
      
      // For other platforms, try to load the image to verify it exists
      return new Promise<string>((resolve) => {
        const img = new Image()
        img.onload = () => resolve(profileUrl)
        img.onerror = () => resolve('')
        img.src = profileUrl
        
        // Set timeout to avoid hanging
        setTimeout(() => resolve(''), 5000)
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
          const response = await fetch(`https://unavatar.io/twitter/${username}`)
          if (response.ok) {
            // If unavatar works, we have a valid user - use username as display name for now
            displayName = `@${username}`
          } else {
            displayName = `@${username}`
          }
        } catch (error) {
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
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `widgets/${fileName}`

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
        size: 'thin',
        data: {
          title: linkData.title,
          url: linkData.url,
          description: metadata.description,
          favicon: metadata.favicon,
          isPopularApp: metadata.isPopularApp,
          appName: metadata.appName,
          appLogo: metadata.appLogo
        },
        position: { x: 20, y: widgets.length * 80 + 20 },
        webPosition: { x: 20, y: widgets.length * 80 + 20 },
        mobilePosition: { x: 20, y: widgets.length * 80 + 20 }
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
      position: { x: 20, y: widgets.length * 80 + 20 },
      webPosition: { x: 20, y: widgets.length * 80 + 20 },
      mobilePosition: { x: 20, y: widgets.length * 80 + 20 }
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
      size: 'wide',
      data: {
        title: textContent.trim(),
        type: 'text'
      },
      position: { x: 20, y: widgets.length * 80 + 20 },
      webPosition: { x: 20, y: widgets.length * 80 + 20 },
      mobilePosition: { x: 20, y: widgets.length * 80 + 20 }
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

  const handleAddWidget = async (widget: Widget) => {
    try {
      if (!profile?.id) {
        toast.error('Profile not found')
        return
      }

      // Prepare the URL and title
      let finalUrl = widget.data.url || ''
      let title = widget.data.title || widget.data.platform || 'Widget'
      
      // For social platforms, use the username as title if available
      if (widget.data.username) {
        title = widget.data.platform === 'website' ? widget.data.username : `@${widget.data.username}`
      }

      // Ensure URL has protocol
      if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`
      }

      // Fetch metadata if we have a URL
      let metadata = { title, description: '', favicon: '', isPopularApp: false, appName: '', appLogo: '', profileImage: '' }
      if (finalUrl) {
        try {
          metadata = await fetchLinkMetadata(finalUrl)
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
              const metadataResponse = await fetch(`/api/metadata?url=${encodeURIComponent(widget.data.url)}`)
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
        position: widget.position,
        webPosition: widget.webPosition,
        mobilePosition: widget.mobilePosition
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

  const handleResizeWidget = async (widgetId: string, newSize: Widget['size']) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('links')
        .update({ size: newSize })
        .eq('id', widgetId)
        .eq('user_id', profile?.id)

      if (error) {
        console.error('Error updating widget size:', error)
        toast.error('Failed to update widget size')
        return
      }

      // Fetch the updated widget data from database to ensure we have all fields
      const { data: updatedWidget, error: fetchError } = await supabase
        .from('links')
        .select('*')
        .eq('id', widgetId)
        .eq('user_id', profile?.id)
        .single()

      if (fetchError) {
        console.error('Error fetching updated widget:', fetchError)
        // Fallback to simple size update
        setWidgets(prev => prev.map(widget => 
          widget.id === widgetId ? { ...widget, size: newSize } : widget
        ))
      } else {
        console.log('Updated widget data from database:', updatedWidget)
        // Update with complete data from database
        setWidgets(prev => prev.map(widget => 
          widget.id === widgetId ? {
            ...widget,
            size: newSize,
            data: {
              ...widget.data,
              profileImage: updatedWidget.profile_image_url || '',
              displayName: updatedWidget.display_name || '',
              platform: updatedWidget.platform || widget.data.platform,
              username: updatedWidget.username || widget.data.username,
              // Ensure all other fields are preserved
              title: updatedWidget.title || widget.data.title,
              url: updatedWidget.url || widget.data.url,
              content: updatedWidget.content || widget.data.content,
              caption: updatedWidget.caption || widget.data.caption,
              price: updatedWidget.price || widget.data.price,
              appStoreUrl: updatedWidget.app_store_url || widget.data.appStoreUrl,
              playStoreUrl: updatedWidget.play_store_url || widget.data.playStoreUrl,
              fileUrl: updatedWidget.file_url || widget.data.fileUrl
            }
          } : widget
        ))
      }

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

  const snapToGrid = (position: { x: number; y: number }) => {
    const gridSize = 20
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    }
  }

  const handleWidgetMove = async (widgetId: string, newPosition: { x: number; y: number }) => {
    const snappedPosition = snapToGrid(newPosition)
    
    try {
      // Update in database
      const updateData = {
        widget_position: JSON.stringify(snappedPosition),
        [activeView === 'web' ? 'web_position' : 'mobile_position']: JSON.stringify(snappedPosition)
      }
      
      const { error } = await supabase
        .from('links')
        .update(updateData)
        .eq('id', widgetId)
        .eq('user_id', profile?.id)

      if (error) {
        console.error('Error updating widget position:', error)
        return
      }

      // Update in local state
      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? {
          ...w,
          position: snappedPosition,
          [activeView === 'web' ? 'webPosition' : 'mobilePosition']: snappedPosition
        } : w
      ))
    } catch (error) {
      console.error('Error updating widget position:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWidget || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const newPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    handleWidgetMove(draggedWidget, newPosition)
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
    const sizeClass = getWidgetSizeClass(widget.size, inRightPanel)
    const isHovered = hoveredWidget === widget.id
    const isDragged = draggedWidget === widget.id
    const currentPosition = activeView === 'web' ? widget.webPosition : widget.mobilePosition

    const widgetContent = () => {
      const renderSocialWidget = () => {
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
            if (hostname.includes('github.com')) platform = 'github'
            else if (hostname.includes('twitter.com') || hostname.includes('x.com')) platform = 'twitter'
            else if (hostname.includes('instagram.com')) platform = 'instagram'
            else if (hostname.includes('facebook.com')) platform = 'facebook'
            else if (hostname.includes('linkedin.com')) platform = 'linkedin'
            else if (hostname.includes('youtube.com')) platform = 'youtube'
            else if (hostname.includes('tiktok.com')) platform = 'tiktok'
            else if (hostname.includes('spotify.com')) platform = 'spotify'
            else if (hostname.includes('music.apple.com')) platform = 'apple_music'
            else if (hostname.includes('soundcloud.com')) platform = 'soundcloud'
          } catch (e) {
            // Invalid URL, use default
          }
        }
        
        const socialInfo = getSocialInfo(platform)
        
        // Different layouts based on size
        if (widget.size === 'thin') {
          return (
            <div className="flex items-center space-x-3 h-full">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br ${socialInfo.gradient} p-1.5`}>
                {widget.data.appLogo || socialInfo.logo ? (
                  <>
                    <img 
                      src={widget.data.appLogo || socialInfo.logo} 
                      alt={platform}
                      className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-text');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <span className={`fallback-text text-white text-sm font-bold ${socialInfo.logo ? 'hidden' : ''}`}>
                      {socialInfo.fallback || (platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                    </span>
                  </>
                ) : (
                  <span className="text-white text-sm font-bold">
                    {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link')}
                </div>
              </div>
            </div>
          )
        }
        
        if (widget.size === 'small-square') {
          return (
            <div className="relative h-full w-full overflow-hidden rounded-xl">
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
                      className={`w-8 h-8 object-contain ${socialInfo.logoStyle || ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-text');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`fallback-text text-lg font-bold text-white ${socialInfo.logo ? 'hidden' : ''}`}>
                    {socialInfo.fallback}
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-xs font-medium text-white">
                  {widget.data.displayName || (widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link')}
                </div>
                {widget.data.username && platform && (
                  <div className="text-xs text-white/80 mt-0.5 capitalize">
                    {platform}
                  </div>
                )}
              </div>
            </div>
          )
        }
        
        if (widget.size === 'medium-square') {
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
        
        if (widget.size === 'large-square') {
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
                {sizeOptions.map(size => (
                  <Button
                    key={size.value}
                    variant={widget.size === size.value ? 'default' : 'ghost'}
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={() => handleWidgetResize(widget.id, size.value as Widget['size'])}
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
        className={`absolute ${sizeClass} ${isDragged ? 'opacity-50' : ''}`}
        style={{
          transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
          zIndex: isDragged ? 50 : 1
        }}
        onMouseEnter={() => setHoveredWidget(widget.id)}
        onMouseLeave={() => setHoveredWidget(null)}
        draggable
        onDragStart={() => setDraggedWidget(widget.id)}
        onDragEnd={() => setDraggedWidget(null)}
      >
        <Card className="h-full relative cursor-move bg-white border border-gray-200">
          <CardContent className="p-4 h-full flex items-center justify-center">
            {widgetContent()}
          </CardContent>
          
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('web')}
              className={activeView === 'web' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-100'}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Web
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('mobile')}
              className={activeView === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-100'}
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
      <div className="flex">
        {/* Left Side - Profile Preview */}
        <div className={`${activeView === 'web' ? 'w-1/2' : 'w-full'} p-8 flex flex-col items-center`}>
          <div className="w-full max-w-md">
            {/* Profile Section */}
            <div className="text-center mb-8">
              <div className="relative mb-4 group">
                <label className="cursor-pointer block">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="text-3xl">
                      {isHydrated ? displayName.charAt(0).toUpperCase() || 'U' : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 w-32 h-32 mx-auto mb-4 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-6 h-6 text-white" />
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
                className="text-2xl font-bold mb-2 bg-transparent border-none text-center w-full text-gray-900 focus:outline-none focus:ring-0 focus:bg-gray-50 rounded px-2"
                placeholder="Your name"
              />
              <textarea
                value={bio}
                onChange={(e) => handleBioChange(e.target.value)}
                onBlur={handleBioBlur}
                className="text-gray-600 text-sm mb-4 bg-transparent border-none text-center w-full resize-none focus:outline-none focus:ring-0 focus:bg-gray-50 rounded px-2"
                placeholder="Tell people about yourself..."
                rows={2}
              />
            </div>

            {/* Widgets Area - Only for mobile view */}
            {activeView === 'mobile' && (
              <div 
                ref={gridRef}
                className="relative min-h-[400px] space-y-4"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!isHydrated || isLoadingWidgets ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-gray-500">Loading widgets...</div>
                  </div>
                ) : (
                  widgets.map(widget => renderWidget(widget))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Widget Grid (Web View Only) */}
        {activeView === 'web' && (
          <div className="w-1/2 p-8">
            <div className="flex flex-wrap gap-4 justify-start">
              {!isHydrated || isLoadingWidgets ? (
                <div className="flex items-center justify-center w-full h-40">
                  <div className="text-gray-500">Loading widgets...</div>
                </div>
              ) : (
                widgets.map(widget => renderWidget(widget, true))
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
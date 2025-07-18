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
  { value: 'thin', label: 'Thin Rectangle', icon: '▬' },
  { value: 'tall', label: 'Tall Rectangle', icon: '▮' },
  { value: 'wide', label: 'Wide Rectangle', icon: '▭' },
  { value: 'small-square', label: 'Small Square', icon: '◻' },
  { value: 'large-square', label: 'Large Square', icon: '⬜' }
]

export function AppearanceCustomizer({ profile, socialLinks, links }: AppearanceCustomizerProps) {
  const [activeView, setActiveView] = useState<'web' | 'mobile'>('web')
  const [showWidgetModal, setShowWidgetModal] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [showResizeMenu, setShowResizeMenu] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(profile.display_name || profile.username)
  const [bio, setBio] = useState(profile.bio || '')
  const [isUpdating, setIsUpdating] = useState(false)
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

  // Load existing widgets from database on component mount
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        // Load links that can be converted to widgets
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_active', true)
          .order('order')

        if (linksError) {
          console.error('Error loading links:', linksError)
          toast.error('Failed to load existing links')
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

              return {
                id: link.id,
                type: 'link' as const,
                size: 'thin' as const,
                data: {
                  title: link.title,
                  url: link.url,
                  description: metadata.description || '',
                  favicon: metadata.favicon || '',
                  isPopularApp: metadata.isPopularApp || false,
                  appName: metadata.appName || '',
                  appLogo: metadata.appLogo || metadata.favicon || ''
                },
                position: { x: 20, y: index * 80 + 20 },
                webPosition: { x: 20, y: index * 80 + 20 },
                mobilePosition: { x: 20, y: index * 80 + 20 }
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
      }
    }

    if (profile?.id) {
      loadWidgets()
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
          appLogo: metadata.appLogo || ''
        }
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
    } finally {
      setIsLoading(false)
    }
    return { title: url, description: '', favicon: '', isPopularApp: false, appName: '', appLogo: '' }
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
        facebook: `https://unavatar.io/facebook/${username}`
      }
      
      const profileUrl = profileUrls[platform.toLowerCase()]
      if (!profileUrl) return ''
      
      // Test if the image exists
      const response = await fetch(profileUrl, { method: 'HEAD' })
      if (response.ok) {
        return profileUrl
      }
      
      return ''
    } catch (error) {
      console.warn('Failed to fetch profile picture:', error)
      return ''
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
          user_id: profile.id,
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
      await navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`)
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
        .eq('id', profile.id)

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
    if (displayName !== (profile.display_name || profile.username)) {
      updateProfile('display_name', displayName)
    }
  }

  const handleBioChange = (value: string) => {
    setBio(value)
  }

  const handleBioBlur = () => {
    if (bio !== (profile.bio || '')) {
      updateProfile('bio', bio)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

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
        .eq('id', profile.id)

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
      if (!profile) {
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
      
      // Try to get profile picture for social platforms
      if (widget.data.platform && widget.data.username) {
        try {
          const profilePicUrl = await fetchProfilePicture(widget.data.platform, widget.data.username)
          if (profilePicUrl) {
            metadata.profileImage = profilePicUrl
          }
        } catch (error) {
          console.warn('Failed to fetch profile picture:', error)
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
          user_id: profile.id,
          title: title.trim() || metadata.title,
          url: finalUrl,
          order: widgets.length + 1,
          is_active: true,
          link_type: 'link_in_bio'
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

      setWidgets(prev => [...prev, newWidget])
      setShowWidgetModal(false)
      toast.success('Widget added successfully')
      
    } catch (error) {
      console.error('Error adding widget:', error)
      toast.error('Failed to add widget')
    }
  }

  const handleResizeWidget = (widgetId: string, newSize: Widget['size']) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId ? { ...widget, size: newSize } : widget
    ))
    setShowResizeMenu(null)
  }

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      // Find the widget to determine its type
      const widget = widgets.find(w => w.id === widgetId)
      
      if (!widget) {
        toast.error('Widget not found')
        return
      }

      // Only delete from links table if it's a link widget (has a database ID)
      if (widget.type === 'link' && !widgetId.includes('text-') && !widgetId.includes('image-')) {
        const { error: linkError } = await supabase
          .from('links')
          .delete()
          .eq('id', widgetId)
          .eq('user_id', profile.id)

        if (linkError) {
          console.error('Error deleting link:', linkError)
          toast.error('Failed to delete link')
          return
        }
      }

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

  const handleWidgetMove = (widgetId: string, newPosition: { x: number; y: number }) => {
    const snappedPosition = snapToGrid(newPosition)
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? {
        ...w,
        position: snappedPosition,
        [activeView === 'web' ? 'webPosition' : 'mobilePosition']: snappedPosition
      } : w
    ))
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
          const socialIcons: { [key: string]: { bg: string; logo: string; gradient: string; logoStyle?: string } } = {
            twitter: { bg: 'bg-black', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg', gradient: 'from-gray-700 to-gray-900', logoStyle: 'invert' },
            instagram: { bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', gradient: 'from-pink-400 via-red-500 to-yellow-500', logoStyle: 'invert' },
            facebook: { bg: 'bg-blue-600', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg', gradient: 'from-blue-500 to-blue-700', logoStyle: 'invert' },
            linkedin: { bg: 'bg-blue-700', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', gradient: 'from-blue-600 to-blue-800', logoStyle: 'invert' },
            youtube: { bg: 'bg-red-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', gradient: 'from-red-500 to-red-700', logoStyle: 'invert' },
            tiktok: { bg: 'bg-black', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', gradient: 'from-gray-900 to-black', logoStyle: 'invert' },
            github: { bg: 'bg-gray-800', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', gradient: 'from-gray-700 to-gray-900', logoStyle: 'invert' },
            spotify: { bg: 'bg-green-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg', gradient: 'from-green-400 to-green-600', logoStyle: 'invert' },
            apple_music: { bg: 'bg-red-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/applemusic.svg', gradient: 'from-red-400 to-red-600', logoStyle: 'invert' },
            soundcloud: { bg: 'bg-orange-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/soundcloud.svg', gradient: 'from-orange-400 to-orange-600', logoStyle: 'invert' },
            podcast: { bg: 'bg-purple-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/podcast.svg', gradient: 'from-purple-400 to-purple-600', logoStyle: 'invert' },
            website: { bg: 'bg-blue-500', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg', gradient: 'from-blue-400 to-blue-600', logoStyle: 'invert' }
          }
          return socialIcons[platform.toLowerCase()] || { bg: 'bg-gray-500', logo: '', gradient: 'from-gray-400 to-gray-600' }
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
                  <img 
                    src={widget.data.appLogo || socialInfo.logo} 
                    alt={platform}
                    className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-white text-sm font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link'}
                </div>
              </div>
            </div>
          )
        }
        
        if (widget.size === 'small-square') {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br ${socialInfo.gradient} mb-1 shadow-md p-2`}>
                {widget.data.appLogo || socialInfo.logo ? (
                  <img 
                    src={widget.data.appLogo || socialInfo.logo} 
                    alt={platform}
                    className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-white text-sm font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-gray-900">
                {widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link'}
              </div>
            </div>
          )
        }
        
        if (widget.size === 'medium-square') {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-3">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden bg-gradient-to-br ${socialInfo.gradient} mb-2 shadow-lg relative p-3`}>
                {widget.data.profileImage ? (
                  <>
                    <img 
                      src={widget.data.profileImage} 
                      alt={widget.data.username || platform}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = widget.data.appLogo || socialInfo.logo || '';
                        target.className = 'w-10 h-10 object-cover';
                        target.onerror = () => {
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-white text-lg font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                        };
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white shadow-md flex items-center justify-center p-0.5">
                      <img 
                        src={socialInfo.logo} 
                        alt={platform}
                        className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                      />
                    </div>
                  </>
                ) : widget.data.appLogo || socialInfo.logo ? (
                  <img 
                    src={widget.data.appLogo || socialInfo.logo} 
                    alt={platform}
                    className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-white text-lg font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white text-lg font-bold">
                    {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link'}
              </div>
              {widget.data.username && platform && (
                <div className="text-xs text-gray-500 mt-1">
                  {platform}
                </div>
              )}
            </div>
          )
        }
        
        if (widget.size === 'large-square') {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden bg-gradient-to-br ${socialInfo.gradient} mb-3 shadow-xl relative p-4`}>
                {widget.data.profileImage ? (
                  <>
                    <img 
                      src={widget.data.profileImage} 
                      alt={widget.data.username || platform}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = widget.data.appLogo || socialInfo.logo || '';
                        target.className = 'w-16 h-16 object-cover';
                        target.onerror = () => {
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-white text-2xl font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                        };
                      }}
                    />
                    {/* Platform icon overlay */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white shadow-lg flex items-center justify-center p-1">
                      <img 
                        src={socialInfo.logo} 
                        alt={platform}
                        className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                      />
                    </div>
                  </>
                ) : widget.data.appLogo || socialInfo.logo ? (
                  <img 
                    src={widget.data.appLogo || socialInfo.logo} 
                    alt={platform}
                    className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-white text-2xl font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-base font-semibold text-gray-900">
                {widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link'}
              </div>
              {widget.data.username && platform && (
                <div className="text-sm text-gray-500 mt-1">
                  {platform}
                </div>
              )}
            </div>
          )
        }
        
        // Default wide layout
        return (
          <div className="flex items-center space-x-3 h-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br ${socialInfo.gradient} shadow-lg relative p-2.5`}>
              {widget.data.profileImage ? (
                <>
                  <img 
                    src={widget.data.profileImage} 
                    alt={widget.data.username || platform}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = widget.data.appLogo || socialInfo.logo || '';
                      target.className = 'w-8 h-8 object-cover';
                      target.onerror = () => {
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-white text-lg font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                      };
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md bg-white shadow-md flex items-center justify-center p-0.5">
                    <img 
                      src={socialInfo.logo} 
                      alt={platform}
                      className={`w-2 h-2 object-contain ${socialInfo.logoStyle || ''}`}
                    />
                  </div>
                </>
              ) : widget.data.appLogo || socialInfo.logo ? (
                <img 
                  src={widget.data.appLogo || socialInfo.logo} 
                  alt={platform}
                  className={`w-full h-full object-contain ${socialInfo.logoStyle || ''}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-white text-lg font-bold">${(platform || widget.data.title || 'L').charAt(0).toUpperCase()}</span>`;
                  }}
                />
              ) : (
                <span className="text-white text-lg font-bold">
                  {(platform || widget.data.title || 'L').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {widget.data.username ? `@${widget.data.username}` : widget.data.title || platform || 'Link'}
              </div>
              {widget.data.username && platform && (
                <div className="text-sm text-gray-500">{platform}</div>
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
          
          {isHovered && (
            <div className="absolute -top-2 -right-2 bg-white border-2 border-black rounded-lg p-1 shadow-xl flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="w-7 h-7 p-0 text-black border-2 border-black bg-white hover:bg-gray-100 hover:text-black"
                onClick={() => setShowResizeMenu(showResizeMenu === widget.id ? null : widget.id)}
                title="Resize"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
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
                    <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="text-3xl">
                      {displayName.charAt(0).toUpperCase()}
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
                {widgets.map(renderWidget)}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Widget Grid (Web View Only) */}
        {activeView === 'web' && (
          <div className="w-1/2 p-8">
            <div className="flex flex-wrap gap-4 justify-start">
              {widgets.map(widget => renderWidget(widget, true))}
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
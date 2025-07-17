'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Monitor, 
  Smartphone, 
  Copy, 
  Link, 
  Image as ImageIcon, 
  Type, 
  Grid3x3, 
  Settings,
  X
} from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { AppearanceForm } from './appearance-form'
import { toast } from 'sonner'
import { WidgetModal } from './widget-modal'

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
  type: 'social' | 'link' | 'image' | 'text'
  size: 'thin' | 'tall' | 'wide' | 'small-square' | 'large-square'
  data: {
    platform?: string
    username?: string
    url?: string
    title?: string
    type?: string
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
  const [showAppearanceForm, setShowAppearanceForm] = useState(false)
  const [showWidgetModal, setShowWidgetModal] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

  const handleAddWidget = (widget: Widget) => {
    setWidgets(prev => [...prev, widget])
    setShowWidgetModal(false)
  }

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
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

  const getWidgetSizeClass = (size: Widget['size']) => {
    switch (size) {
      case 'thin': return 'w-full h-12'
      case 'tall': return 'w-full h-24'
      case 'wide': return 'w-full h-16'
      case 'small-square': return 'w-24 h-24'
      case 'large-square': return 'w-48 h-48'
      default: return 'w-full h-12'
    }
  }

  const renderWidget = (widget: Widget) => {
    const sizeClass = getWidgetSizeClass(widget.size)
    const isHovered = hoveredWidget === widget.id
    const isDragged = draggedWidget === widget.id
    const currentPosition = activeView === 'web' ? widget.webPosition : widget.mobilePosition

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
        <Card className="h-full relative cursor-move">
          <CardContent className="p-4 h-full flex items-center justify-center">
            {widget.type === 'social' && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {widget.data.platform.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium capitalize">{widget.data.platform}</div>
                  {widget.size !== 'thin' && (
                    <div className="text-sm text-gray-500">@{widget.data.username}</div>
                  )}
                </div>
              </div>
            )}
            
            {widget.type === 'link' && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{widget.data.title}</div>
                  {widget.size !== 'thin' && (
                    <div className="text-sm text-gray-500">{widget.data.url}</div>
                  )}
                </div>
              </div>
            )}
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
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - Profile & Theme Settings */}
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Appearance</h1>
              <p className="text-sm text-gray-600">Customize your profile</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAppearanceForm(!showAppearanceForm)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {showAppearanceForm ? (
            <AppearanceForm profile={profile} socialLinks={socialLinks} />
          ) : (
            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="text-center space-y-4">
                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || profile.username} />
                  <AvatarFallback className="text-xl">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {profile.display_name || profile.username}
                  </h3>
                  {profile.bio && (
                    <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAppearanceForm(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile & Theme
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Widget Customization</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeView === 'web' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('web')}
                className={activeView === 'web' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Web
              </Button>
              <Button
                variant={activeView === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange('mobile')}
                className={activeView === 'mobile' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
          <div
            ref={gridRef}
            className={`relative bg-white rounded-lg shadow-sm ${
              activeView === 'web' ? 'w-full max-w-2xl h-[calc(100vh-140px)]' : 'w-[320px] h-[calc(100vh-140px)]'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {widgets.map(renderWidget)}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
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
                className="rounded-full text-gray-700 hover:bg-gray-100"
              >
                <Link className="w-4 h-4 mr-1" />
                Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-gray-700 hover:bg-gray-100"
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
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
                Widget
              </Button>
            </div>
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
    </div>
  )
}
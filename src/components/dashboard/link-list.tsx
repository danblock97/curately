'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Edit2, Trash2, ExternalLink, Save, X, GripVertical, QrCode, Download, Eye } from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Link = Database['public']['Tables']['links']['Row'] & {
  qr_codes?: {
    qr_code_data: string
    format: string
    size: number
    foreground_color: string
    background_color: string
  } | null
}

interface LinkListProps {
  links: (Link & { type?: 'link' | 'qr_code' })[]
  onLinkUpdated: (link: Link) => void
  onLinkDeleted: (linkId: string) => void
  onQrCodeDeleted?: (qrCodeId: string) => void
  onLinksReordered: (links: Link[]) => void
}

function SortableLink({ link, onEdit, onSave, onCancel, onToggleActive, onDelete, editingId, editTitle, editUrl, setEditTitle, setEditUrl, isLoading }: {
  link: Link
  onEdit: (link: Link) => void
  onSave: (linkId: string) => void
  onCancel: () => void
  onToggleActive: (link: Link) => void
  onDelete: (linkId: string) => void
  editingId: string | null
  editTitle: string
  editUrl: string
  setEditTitle: (title: string) => void
  setEditUrl: (url: string) => void
  isLoading: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 shadow-sm ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className="cursor-move" {...attributes} {...listeners}>
          <GripVertical className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </div>
        
        <div className="flex-1 min-w-0">
          {editingId === link.id ? (
            <div className="space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Link title"
                maxLength={100}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
              />
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900/20"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {link.title}
                </h3>
                <Badge variant={link.is_active ? "default" : "secondary"} className={link.is_active ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"}>
                  {link.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {link.link_type === 'qr_code' && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    <QrCode className="w-3 h-3 mr-1" />
                    QR Code
                  </Badge>
                )}
              </div>
              
              {link.link_type === 'qr_code' && link.qr_codes && link.qr_codes[0] ? (
                <div className="mt-2">
                  <div className="flex items-start space-x-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="bg-white border border-gray-300 rounded-lg p-3 flex-shrink-0 shadow-sm cursor-pointer hover:border-gray-400 transition-colors group relative">
                          {link.qr_codes[0].format === 'SVG' ? (
                            <div 
                              className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full"
                              dangerouslySetInnerHTML={{ __html: link.qr_codes[0].qr_code_data }}
                            />
                          ) : (
                            <img 
                              src={link.qr_codes[0].qr_code_data}
                              alt={`QR Code for ${link.title}`}
                              className="w-16 h-16 object-contain"
                              onError={(e) => {
                                console.error('QR Code image failed to load:', {
                                  format: link.qr_codes[0].format,
                                  dataStart: link.qr_codes[0].qr_code_data.substring(0, 50),
                                  linkType: link.link_type,
                                  title: link.title
                                })
                                // Show fallback
                                const fallback = document.createElement('div')
                                fallback.className = 'w-16 h-16 bg-gray-100 border border-gray-300 rounded flex items-center justify-center'
                                fallback.innerHTML = '<span class="text-xs text-gray-500">QR Error</span>'
                                e.currentTarget.parentNode.replaceChild(fallback, e.currentTarget)
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900">QR Code - {link.title}</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Scan this QR code or download it for later use
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            {link.qr_codes[0].format === 'SVG' ? (
                              <div 
                                className="w-48 h-48 [&>svg]:w-full [&>svg]:h-full"
                                dangerouslySetInnerHTML={{ __html: link.qr_codes[0].qr_code_data }}
                              />
                            ) : (
                              <img 
                                src={link.qr_codes[0].qr_code_data}
                                alt={`QR Code for ${link.title}`}
                                className="w-48 h-48 object-contain"
                              />
                            )}
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                              Target URL: <span className="font-mono text-gray-900">{link.url}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Format: {link.qr_codes[0].format} | Size: {link.qr_codes[0].size}x{link.qr_codes[0].size}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              const element = document.createElement('a')
                              element.href = link.qr_codes[0].qr_code_data
                              element.download = `qr-code-${link.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${link.qr_codes[0].format.toLowerCase()}`
                              document.body.appendChild(element)
                              element.click()
                              document.body.removeChild(element)
                              toast.success('QR code downloaded!')
                            }}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download QR Code
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">
                        Scan this QR code to access: {link.url}
                      </p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        Click QR code to view and download
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 truncate"
                >
                  <span className="truncate">{link.url}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              )}
              
              <div className="text-xs text-gray-600 mt-1">
                {link.clicks || 0} clicks
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={link.is_active}
            onCheckedChange={() => onToggleActive(link)}
            disabled={editingId === link.id}
          />

          {editingId === link.id ? (
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                onClick={() => onSave(link.id)}
                disabled={isLoading || !editTitle.trim() || !editUrl.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(link)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(link.id)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function LinkList({ links, onLinkUpdated, onLinkDeleted, onQrCodeDeleted, onLinksReordered }: LinkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over?.id) {
      const oldIndex = links.findIndex(link => link && link.id === active.id)
      const newIndex = links.findIndex(link => link && link.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const newLinks = arrayMove(links, oldIndex, newIndex)
      
      // Update the order in the local state immediately
      onLinksReordered(newLinks)

      // Update the database
      try {
        const updates = newLinks.map((link, index) => ({
          id: link.id,
          order: index
        }))

        for (const update of updates) {
          await supabase
            .from('links')
            .update({ order: update.order })
            .eq('id', update.id)
        }

        toast.success('Links reordered successfully!')
      } catch (error) {
        toast.error('Failed to reorder links. Please try again.')
        // Revert the order on error
        onLinksReordered(links)
      }
    }
  }

  const handleEdit = (link: Link) => {
    setEditingId(link.id)
    setEditTitle(link.title)
    setEditUrl(link.url)
  }

  const handleSave = async (linkId: string) => {
    setIsLoading(true)

    try {
      // Validate URL format
      let validUrl = editUrl.trim()
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = `https://${validUrl}`
      }

      // Basic URL validation
      try {
        new URL(validUrl)
      } catch {
        toast.error('Please enter a valid URL')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('links')
        .update({
          title: editTitle.trim(),
          url: validUrl
        })
        .eq('id', linkId)
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
        .single()

      if (error) {
        toast.error('Error updating link. Please try again.')
        return
      }

      onLinkUpdated(data)
      setEditingId(null)
      toast.success('Link updated successfully!')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditTitle('')
    setEditUrl('')
  }

  const handleToggleActive = async (link: Link) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id)
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
        .single()

      if (error) {
        toast.error('Error updating link status.')
        return
      }

      onLinkUpdated(data)
      toast.success(data.is_active ? 'Link activated' : 'Link deactivated')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    }
  }

  const handleDelete = async (linkId: string) => {
    try {
      // Find the item to determine its type
      const item = links.find(link => link.id === linkId)
      if (!item) {
        toast.error('Item not found.')
        return
      }

      const isQrCode = item.type === 'qr_code'
      const tableName = isQrCode ? 'qr_codes' : 'links'
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', linkId)

      if (error) {
        toast.error(`Error deleting ${isQrCode ? 'QR code' : 'link'}. Please try again.`)
        return
      }

      // Call the appropriate callback
      if (isQrCode && onQrCodeDeleted) {
        onQrCodeDeleted(linkId)
      } else {
        onLinkDeleted(linkId)
      }
      
      toast.success(`${isQrCode ? 'QR code' : 'Link'} deleted successfully!`)
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    }
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No links yet. Add your first link to get started!</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={links.filter(link => link && link.id).map(link => link.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {links.filter(link => link && link.id).map((link) => (
            <SortableLink
              key={link.id}
              link={link}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              editingId={editingId}
              editTitle={editTitle}
              editUrl={editUrl}
              setEditTitle={setEditTitle}
              setEditUrl={setEditUrl}
              isLoading={isLoading}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
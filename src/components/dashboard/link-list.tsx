'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Edit2, Trash2, ExternalLink, Save, X, GripVertical } from 'lucide-react'
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

type Link = Database['public']['Tables']['links']['Row']

interface LinkListProps {
  links: Link[]
  onLinkUpdated: (link: Link) => void
  onLinkDeleted: (linkId: string) => void
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
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 truncate"
              >
                <span className="truncate">{link.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
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

export function LinkList({ links, onLinkUpdated, onLinkDeleted, onLinksReordered }: LinkListProps) {
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
        .select()
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
        .select()
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
    if (!confirm('Are you sure you want to delete this link?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)

      if (error) {
        toast.error('Error deleting link. Please try again.')
        return
      }

      onLinkDeleted(linkId)
      toast.success('Link deleted successfully!')
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
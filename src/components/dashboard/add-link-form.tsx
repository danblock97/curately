'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'

type Link = Database['public']['Tables']['links']['Row']

interface AddLinkFormProps {
  userId: string
  onLinkAdded: (link: Link) => void
  onCancel: () => void
  nextOrder: number
}

export function AddLinkForm({ userId, onLinkAdded, onCancel, nextOrder }: AddLinkFormProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate URL format
      let validUrl = url.trim()
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
        .insert({
          user_id: userId,
          title: title.trim(),
          url: validUrl,
          order: nextOrder,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        toast.error('Error adding link. Please try again.')
        return
      }

      onLinkAdded(data)
      toast.success('Link added successfully!')
      setTitle('')
      setUrl('')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="My Portfolio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !url.trim()}
            >
              {isLoading ? 'Adding...' : 'Add Link'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
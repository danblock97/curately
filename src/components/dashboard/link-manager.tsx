'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddLinkForm } from './add-link-form'
import { LinkList } from './link-list'
import { Plus } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Link = Database['public']['Tables']['links']['Row']

interface LinkManagerProps {
  links: Link[]
  userId: string
}

export function LinkManager({ links: initialLinks, userId }: LinkManagerProps) {
  const [links, setLinks] = useState(initialLinks)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleLinkAdded = (newLink: Link) => {
    setLinks(prev => [...prev, newLink])
    setShowAddForm(false)
  }

  const handleLinkUpdated = (updatedLink: Link) => {
    setLinks(prev => prev.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    ))
  }

  const handleLinkDeleted = (linkId: string) => {
    setLinks(prev => prev.filter(link => link.id !== linkId))
  }

  const handleLinksReordered = (reorderedLinks: Link[]) => {
    setLinks(reorderedLinks)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Links</CardTitle>
              <CardDescription>
                Add and manage your links. Drag to reorder them.
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6">
              <AddLinkForm
                userId={userId}
                onLinkAdded={handleLinkAdded}
                onCancel={() => setShowAddForm(false)}
                nextOrder={links.length}
              />
            </div>
          )}
          
          <LinkList
            links={links}
            onLinkUpdated={handleLinkUpdated}
            onLinkDeleted={handleLinkDeleted}
            onLinksReordered={handleLinksReordered}
          />
        </CardContent>
      </Card>
    </div>
  )
}
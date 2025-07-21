'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase/types'
import { Trash2, RotateCcw, Clock, AlertTriangle } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Link = Database['public']['Tables']['links']['Row']

interface InactiveContentManagerProps {
  profile: Profile
}

interface InactiveItem {
  id: string
  title: string
  type: 'link' | 'qr_code'
  updated_at: string
  page_name?: string
}

export function InactiveContentManager({ profile }: InactiveContentManagerProps) {
  const [inactiveItems, setInactiveItems] = useState<InactiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [reactivating, setReactivating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadInactiveContent()
  }, [profile.id])

  const loadInactiveContent = async () => {
    try {
      setLoading(true)

      // Get inactive links with page names
      const { data: inactiveLinks } = await supabase
        .from('links')
        .select(`
          id,
          title,
          updated_at,
          pages!inner(page_title)
        `)
        .eq('user_id', profile.id)
        .eq('is_active', false)
        .order('updated_at', { ascending: false })

      // Get inactive QR codes with page names
      const { data: inactiveQrCodes } = await supabase
        .from('qr_codes')
        .select(`
          id,
          title,
          updated_at,
          pages!inner(page_title)
        `)
        .eq('user_id', profile.id)
        .eq('is_active', false)
        .order('updated_at', { ascending: false })

      const combinedItems: InactiveItem[] = [
        ...(inactiveLinks || []).map(link => ({
          id: link.id,
          title: link.title,
          type: 'link' as const,
          updated_at: link.updated_at,
          page_name: (link.pages as any)?.page_title
        })),
        ...(inactiveQrCodes || []).map(qr => ({
          id: qr.id,
          title: qr.title,
          type: 'qr_code' as const,
          updated_at: qr.updated_at,
          page_name: (qr.pages as any)?.page_title
        }))
      ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

      setInactiveItems(combinedItems)
    } catch (error) {
      console.error('Error loading inactive content:', error)
      toast.error('Failed to load inactive content')
    } finally {
      setLoading(false)
    }
  }

  const reactivateItem = async (item: InactiveItem) => {
    // Check if reactivating would exceed plan limits
    const { data: activeLinks } = await supabase
      .from('links')
      .select('id')
      .eq('user_id', profile.id)
      .eq('is_active', true)

    const { data: activeQrCodes } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('user_id', profile.id)
      .eq('is_active', true)

    const limits = profile.tier === 'pro' ? { links: 50, qrCodes: 50 } : { links: 5, qrCodes: 5 }
    const currentCounts = {
      links: activeLinks?.length || 0,
      qrCodes: activeQrCodes?.length || 0
    }

    if (item.type === 'link' && currentCounts.links >= limits.links) {
      toast.error(`Cannot reactivate: You've reached your ${profile.tier} plan limit of ${limits.links} active links`)
      return
    }

    if (item.type === 'qr_code' && currentCounts.qrCodes >= limits.qrCodes) {
      toast.error(`Cannot reactivate: You've reached your ${profile.tier} plan limit of ${limits.qrCodes} active QR codes`)
      return
    }

    setReactivating(item.id)
    try {
      const { error } = await supabase
        .from(item.type === 'link' ? 'links' : 'qr_codes')
        .update({ is_active: true })
        .eq('id', item.id)

      if (error) throw error

      toast.success(`${item.type === 'link' ? 'Link' : 'QR Code'} reactivated successfully`)
      await loadInactiveContent()
    } catch (error) {
      console.error('Error reactivating item:', error)
      toast.error('Failed to reactivate item')
    } finally {
      setReactivating(null)
    }
  }

  const deleteItem = async (item: InactiveItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(item.id)
    try {
      const { error } = await supabase
        .from(item.type === 'link' ? 'links' : 'qr_codes')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      toast.success(`${item.type === 'link' ? 'Link' : 'QR Code'} deleted permanently`)
      await loadInactiveContent()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    } finally {
      setDeleting(null)
    }
  }

  const getDaysUntilDeletion = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt)
    const deletionDate = new Date(updatedDate)
    deletionDate.setDate(deletionDate.getDate() + 7)
    const now = new Date()
    const daysLeft = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading inactive content...</div>
        </CardContent>
      </Card>
    )
  }

  if (inactiveItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Inactive Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-6">
            No inactive content. Items deactivated during plan downgrades appear here.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Inactive Content ({inactiveItems.length})
        </CardTitle>
        <p className="text-sm text-gray-600">
          Content deactivated during plan downgrades. Items are automatically deleted after 7 days.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {inactiveItems.map((item) => {
          const daysLeft = getDaysUntilDeletion(item.updated_at)
          const isExpiringSoon = daysLeft <= 2

          return (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">{item.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.type === 'link' ? 'Link' : 'QR Code'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Page: {item.page_name}</span>
                  <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-red-600 font-medium' : ''}`}>
                    {isExpiringSoon && <AlertTriangle className="w-3 h-3" />}
                    {daysLeft > 0 ? `${daysLeft} days until deletion` : 'Will be deleted soon'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reactivateItem(item)}
                  disabled={reactivating === item.id}
                  className="text-green-600 hover:text-green-700"
                >
                  {reactivating === item.id ? (
                    <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteItem(item)}
                  disabled={deleting === item.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deleting === item.id ? (
                    <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
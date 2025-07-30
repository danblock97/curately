'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LinkList } from './link-list'
import { Plus, Link2, ExternalLink, QrCode, TrendingUp, Users, Eye, BarChart3, Globe, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Zap, Target, Award, Star } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database } from '@/lib/supabase/types'
import { usePlanLimits } from '@/hooks/use-plan-limits'
import { toast } from 'sonner'
import { WidgetModal } from './widget-modal'
import { Widget } from './appearance-customizer'
import Link from 'next/link'

type Link = Database['public']['Tables']['links']['Row'] & {
  qr_codes?: {
    qr_code_data: string
    format: string
    size: number
    foreground_color: string
    background_color: string
  } | null
  order_index?: number
}
type QRCode = Database['public']['Tables']['qr_codes']['Row'] & {
  page_id?: string
  order?: number
  order_index?: number
  is_active?: boolean
  clicks?: number
}

interface DashboardOverviewProps {
  links: Link[]
  qrCodes: QRCode[]
  userId: string
  profile: Database['public']['Tables']['profiles']['Row']
  pages: Database['public']['Tables']['pages']['Row'][]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function DashboardOverview({ links: initialLinks, qrCodes: initialQrCodes, userId, profile, pages }: DashboardOverviewProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [currentPageNum, setCurrentPageNum] = useState(1)
  const [itemsPerPage] = useState(6)
  const [showWidgetModal, setShowWidgetModal] = useState(false)
  const [widgetModalDefaultType, setWidgetModalDefaultType] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Get the current page (default to primary page, only consider active pages)
  const activePages = pages.filter(page => page.is_active !== false)
  const currentPage = selectedPageId 
    ? activePages.find(p => p.id === selectedPageId) 
    : activePages.find(p => p.is_primary) || activePages[0]
  
  // Filter and combine links and QR codes for the current page
  const pageLinks = links.filter(link => {
    if (!link) return false
    
    if (!currentPage) return true
    
    if (!link.page_id) {
      return currentPage?.is_primary || !currentPage
    }
    
    return link.page_id === currentPage?.id
  })
  
  const pageQrCodes = qrCodes.filter(qr => {
    if (!qr) return false
    
    if (!currentPage) return true
    
    if (!qr.page_id) {
      return currentPage?.is_primary || !currentPage
    }
    
    return qr.page_id === currentPage?.id
  })
  
  // Combine links and QR codes into a unified list for display
  const linkItems = pageLinks.filter(link => link).map(link => ({ 
    ...link, 
    type: 'link' as const,
    display_order: link.order_index || 0
  }))
  
  const qrItems = pageQrCodes.filter(qr => qr).map(qr => ({ 
    ...qr, 
    type: 'qr_code' as const,
    display_order: qr.order_index || 0,
    title: qr.title || 'QR Code',
    url: qr.url || '#',
    is_active: qr.is_active !== false,
    qr_code_data: qr.qr_code_data,
    format: qr.format,
    clicks: qr.clicks || 0
  }))
  
  const pageItems = [...linkItems, ...qrItems].sort((a, b) => a.display_order - b.display_order)
  
  const totalItems = pageItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPageNum - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = pageItems.slice(startIndex, endIndex)
  
  const planUsage = usePlanLimits(links, profile.tier, pages.filter(page => page.is_active !== false).length, qrCodes.map(qr => ({ is_active: qr.is_active })))

  // Handle hydration and initialize with server data
  useEffect(() => {
    setIsHydrated(true)
    setLinks(initialLinks)
    setQrCodes(initialQrCodes)
  }, [initialLinks, initialQrCodes])
  
  // Reset pagination when page or items change
  useEffect(() => {
    setCurrentPageNum(1)
  }, [selectedPageId, pageItems.length, links.length, qrCodes.length])

  const handleLinkUpdated = (updatedLink: Link) => {
    setLinks(prev => prev.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    ))
  }

  const handleLinkDeleted = (linkId: string) => {
    setLinks(prev => prev.filter(link => link.id !== linkId))
  }

  const handleQrCodeDeleted = (qrCodeId: string) => {
    setQrCodes(prev => prev.filter(qrCode => qrCode.id !== qrCodeId))
  }

  const handleLinksReordered = (reorderedLinks: Link[]) => {
    setLinks(reorderedLinks)
  }

  const handleAddWidget = (widget: Widget) => {
    setShowWidgetModal(false)
    setWidgetModalDefaultType(null)
    toast.success('Widget added successfully! Please refresh to see changes.')
  }

  const handleCustomLinkClick = () => {
    if (!planUsage.links.canCreate) {
      toast.error(`You've reached the maximum number of links (${planUsage.links.limit}) for your ${profile.tier} plan.`)
      return
    }
    setWidgetModalDefaultType('link')
    setShowWidgetModal(true)
  }

  const handleDeeplinkClick = () => {
    if (!planUsage.links.canCreate) {
      toast.error(`You've reached the maximum number of links (${planUsage.links.limit}) for your ${profile.tier} plan.`)
      return
    }
    setWidgetModalDefaultType('deeplink')
    setShowWidgetModal(true)
  }

  const handleQRCodeClick = () => {
    if (!planUsage.qrCodes.canCreate) {
      toast.error(`You've reached the maximum number of QR codes (${planUsage.qrCodes.limit}) for your ${profile.tier} plan.`)
      return
    }
    setWidgetModalDefaultType('qr_code')
    setShowWidgetModal(true)
  }

  const totalClicks = useMemo(() => {
    if (!isHydrated) return 0
    
    const linkClicks = pageLinks.reduce((sum, link) => {
      if (!link || typeof link !== 'object') return sum
      const clicks = typeof link.clicks === 'number' && !isNaN(link.clicks) ? link.clicks : 0
      return sum + clicks
    }, 0)
    
    return linkClicks
  }, [pageLinks, isHydrated])

  // Show loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 p-6"
      >
        {/* Header Section with Upgrade Banner */}
        <motion.div variants={item} className="space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
              <p className="text-gray-600">Here's what's happening with your links today.</p>
            </div>
            
            {currentPage && (
              <div className="flex items-center space-x-3 bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Your Page</p>
                  <Link 
                    href={`/${currentPage.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-mono"
                  >
                    curately.co.uk/{currentPage.username}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Upgrade Banner for Free Users */}
          {profile.tier === 'free' && (
            <motion.div 
              variants={item}
              className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to unlock more features?</h3>
                    <p className="text-gray-600">
                      Upgrade to Pro for 50 links, 50 QR codes, 2 pages, and advanced analytics
                    </p>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Link2 className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm font-medium">Total Links</p>
                  <p className="text-3xl font-bold">{planUsage.links.current}</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                <motion.div 
                  className="bg-white h-2.5 rounded-full shadow-sm" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(planUsage.links.current / planUsage.links.limit) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-blue-100 text-xs font-medium">{planUsage.links.current}/{planUsage.links.limit} used</p>
                <p className="text-blue-200 text-xs">{Math.round((planUsage.links.current / planUsage.links.limit) * 100)}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-purple-100 text-sm font-medium">QR Codes</p>
                  <p className="text-3xl font-bold">{planUsage.qrCodes.current}</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                <motion.div 
                  className="bg-white h-2.5 rounded-full shadow-sm" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(planUsage.qrCodes.current / planUsage.qrCodes.limit) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-purple-100 text-xs font-medium">{planUsage.qrCodes.current}/{planUsage.qrCodes.limit} used</p>
                <p className="text-purple-200 text-xs">{Math.round((planUsage.qrCodes.current / planUsage.qrCodes.limit) * 100)}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm font-medium">Total Clicks</p>
                  <motion.p 
                    className="text-3xl font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                  >
                    {totalClicks}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-200" />
                  <p className="text-green-100 text-xs font-medium">This period</p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <p className="text-green-200 text-xs">Live</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-orange-100 text-sm font-medium">Pages</p>
                  <p className="text-3xl font-bold">{planUsage.pages.current}</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                <motion.div 
                  className="bg-white h-2.5 rounded-full shadow-sm" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(planUsage.pages.current / planUsage.pages.limit) * 100}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-orange-100 text-xs font-medium">{planUsage.pages.current}/{planUsage.pages.limit} used</p>
                <p className="text-orange-200 text-xs">{Math.round((planUsage.pages.current / planUsage.pages.limit) * 100)}%</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600">Create new content for your page</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={handleCustomLinkClick}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Link</h3>
                  <p className="text-gray-600 text-sm">Share all your content</p>
                </div>
              </div>
              <Button 
                disabled={!planUsage.links.canCreate}
                className={`w-full h-10 ${
                  planUsage.links.canCreate 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={handleDeeplinkClick}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Deeplink</h3>
                  <p className="text-gray-600 text-sm">Redirect to apps</p>
                </div>
              </div>
              <Button 
                disabled={!planUsage.links.canCreate}
                className={`w-full h-10 ${
                  planUsage.links.canCreate 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Deeplink
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={handleQRCodeClick}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                  <p className="text-gray-600 text-sm">Scan to redirect</p>
                </div>
              </div>
              <Button 
                disabled={!planUsage.qrCodes.canCreate}
                className={`w-full h-10 ${
                  planUsage.qrCodes.canCreate
                    ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Target className="w-4 h-4 mr-2" />
                Create QR Code
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Page Switcher */}
        {pages.filter(page => page.is_active !== false).length > 1 && (
          <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Page Management</h3>
                    <p className="text-sm text-gray-600">Switch between your active pages</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Current page:</span>
                    <Select value={currentPage?.id || ''} onValueChange={(value) => setSelectedPageId(value || null)}>
                      <SelectTrigger className="w-64 bg-white border-gray-300 shadow-sm">
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.filter(page => page.is_active !== false).map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.page_title || page.username} {page.is_primary ? '(Primary)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">{pageItems.length}</span>
                    <span className="text-sm text-gray-600">items</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Overview */}
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Analytics Overview</h3>
                  <p className="text-sm text-gray-600">Track your performance metrics</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Link>
              </motion.div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <motion.div 
                  className="text-3xl font-bold text-green-700 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {totalClicks}
                </motion.div>
                <div className="text-sm font-medium text-green-600">Total Clicks</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <motion.div 
                  className="text-3xl font-bold text-blue-700 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {pageItems.length}
                </motion.div>
                <div className="text-sm font-medium text-blue-600">Active Items</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  {profile.tier === 'pro' ? <Award className="w-6 h-6 text-white" /> : <BarChart3 className="w-6 h-6 text-white" />}
                </div>
                <motion.div 
                  className="text-2xl font-bold text-purple-700 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {profile.tier === 'pro' ? 'Advanced' : 'Basic'}
                </motion.div>
                <div className="text-sm font-medium text-purple-600">Analytics Plan</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Links & QR Codes List */}
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">My Content</h3>
                  <p className="text-sm text-gray-600">Manage your links and QR codes</p>
                </div>
                <div className="hidden sm:flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{linkItems.length} Links</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{qrItems.length} QR Codes</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {pages.filter(page => page.is_active !== false).length > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Filter by page:</span>
                    <Select value={selectedPageId || currentPage?.id || ''} onValueChange={(value) => setSelectedPageId(value)}>
                      <SelectTrigger className="w-48 bg-white border-gray-300 shadow-sm">
                        <SelectValue placeholder="All pages" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.filter(page => page.is_active !== false).map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.page_title || page.username}
                            {page.is_primary && ' (Primary)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-900">{totalClicks} clicks</span>
                </div>
              </div>
            </div>
            
            {/* Mobile stats */}
            <div className="flex sm:hidden items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium text-sm">{linkItems.length} Links</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium text-sm">{qrItems.length} QR Codes</span>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-6">
          
          <AnimatePresence mode="wait">
            {Array.isArray(paginatedItems) && paginatedItems.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LinkList
                  links={paginatedItems}
                  onLinkUpdated={handleLinkUpdated}
                  onLinkDeleted={handleLinkDeleted}
                  onQrCodeDeleted={handleQrCodeDeleted}
                  onLinksReordered={handleLinksReordered}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Link2 className="w-10 h-10 text-blue-500" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  No content yet
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-600 mb-8 max-w-md mx-auto"
                >
                  Start building your digital presence by creating your first link or QR code. It only takes a few seconds!
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleCustomLinkClick}
                      disabled={!planUsage.links.canCreate}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Link
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleQRCodeClick}
                      disabled={!planUsage.qrCodes.canCreate}
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Create QR Code
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold text-gray-900">{totalItems}</span> items
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                  disabled={currentPageNum === 1}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold text-gray-900 px-3 py-1 bg-gray-100 rounded-lg">
                    {currentPageNum}
                  </span>
                  <span className="text-sm text-gray-500">of</span>
                  <span className="text-sm text-gray-900 font-medium">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPageNum === totalPages}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </motion.div>

      {/* Widget Modal */}
      {showWidgetModal && (
        <WidgetModal
          isOpen={showWidgetModal}
          onClose={() => {
            setShowWidgetModal(false)
            setWidgetModalDefaultType(null)
          }}
          onAddWidget={handleAddWidget}
          socialLinks={[]}
          links={links}
          userTier={profile.tier}
          defaultType={widgetModalDefaultType}
          profile={profile}
        />
      )}
    </>
  )
}
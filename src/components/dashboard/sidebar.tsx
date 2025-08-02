'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Link as LinkIcon, Palette, Settings, BarChart3, Globe, MessageCircle, Crown, Star, Menu, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Database } from '@/lib/supabase/types'
import { useState, useEffect } from 'react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Page = Database['public']['Tables']['pages']['Row']

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LinkIcon, color: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Pages', href: '/dashboard/pages', icon: Globe, color: 'text-indigo-600', gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'Appearance', href: '/dashboard/appearance', icon: Palette, color: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-green-600', gradient: 'from-green-500 to-green-600' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, color: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' },
]

interface DashboardSidebarProps {
  profile: Profile | null
  primaryPage?: Page | null
}

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
}

export function DashboardSidebar({ profile, primaryPage }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl shadow-lg hover:bg-white transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div 
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "bg-white/80 backdrop-blur-lg border-r border-gray-200/50 h-full flex flex-col transition-transform duration-300 ease-in-out",
          // Desktop styles
          "lg:w-72 lg:relative lg:translate-x-0",
          // Mobile styles
          "fixed top-0 left-0 w-80 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      {/* User Profile Section */}
      {profile && (
        <motion.div variants={itemVariants} className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                <AvatarImage 
                  src={profile.avatar_url || ''} 
                  alt={profile.display_name || 'User'} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {profile.display_name 
                    ? getInitials(profile.display_name)
                    : 'U'
                  }
                </AvatarFallback>
              </Avatar>
              {profile.tier === 'pro' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate">
                {profile.display_name || 'User'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  profile.tier === 'pro' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profile.tier === 'pro' ? (
                    <>
                      <Star className="w-3 h-3 mr-1" />
                      Pro
                    </>
                  ) : (
                    'Free'
                  )}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <nav className="mt-6 flex-1 flex flex-col">
        <div className="px-6 flex-1">
          <motion.ul variants={itemVariants} className="space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <motion.li 
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200/50 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {isActive ? (
                      <div className={`w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <item.icon className={cn("w-4 h-4", item.color)} />
                      </div>
                    )}
                    <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                      />
                    )}
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>
        
        {/* Support Section at bottom */}
        <motion.div variants={itemVariants} className="px-6 pb-6 border-t border-gray-200/50 pt-6 mt-6">
          <Link
            href="/contact"
            className="flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span>Contact Support</span>
            {profile?.tier === 'pro' && (
              <span className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                Priority
              </span>
            )}
          </Link>
        </motion.div>
      </nav>
    </motion.div>
    </>
  )
}
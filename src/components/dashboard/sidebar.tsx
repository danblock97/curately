'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Link as LinkIcon, Palette, Settings, BarChart3, Globe } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Page = Database['public']['Tables']['pages']['Row']

const navigation = [
  { name: 'Links', href: '/dashboard', icon: LinkIcon, color: 'text-blue-600' },
  { name: 'Pages', href: '/dashboard/pages', icon: Globe, color: 'text-indigo-600' },
  { name: 'Appearance', href: '/dashboard/appearance', icon: Palette, color: 'text-purple-600' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-green-600' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, color: 'text-gray-600' },
]

interface DashboardSidebarProps {
  profile: Profile | null
  primaryPage?: Page | null
}

export function DashboardSidebar({ profile, primaryPage }: DashboardSidebarProps) {
  const pathname = usePathname()
  
  console.log('DashboardSidebar rendering with:', { profile: profile?.id, primaryPage: primaryPage?.id })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-full">
      {/* User Profile Section */}
      {profile && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={profile.avatar_url || ''} 
                alt={profile.display_name || 'User'} 
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                {profile.display_name 
                  ? getInitials(profile.display_name)
                  : 'U'
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.display_name || 'User'}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  profile.tier === 'pro' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profile.tier === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <nav className="mt-4">
        <div className="px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : item.color)} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </div>
  )
}
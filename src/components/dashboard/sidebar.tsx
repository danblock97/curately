'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Link as LinkIcon, Palette, Settings, BarChart3 } from 'lucide-react'

const navigation = [
  { name: 'Links', href: '/dashboard', icon: LinkIcon, color: 'text-blue-600' },
  { name: 'Appearance', href: '/dashboard/appearance', icon: Palette, color: 'text-purple-600' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-green-600' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, color: 'text-gray-600' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-full">
      <nav className="mt-8">
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
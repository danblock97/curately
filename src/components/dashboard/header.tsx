'use client'

import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, ExternalLink } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Curately</h1>
          {profile && profile.username && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Your page:</span>
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>curately.co.uk/{profile.username}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            {user.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-colors px-3 py-2 h-9"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
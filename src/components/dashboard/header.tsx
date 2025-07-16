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
    <header className="bg-black border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Curately</h1>
          {profile?.username && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Your page:</span>
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>curately.co.uk/{profile.username}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            {user.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
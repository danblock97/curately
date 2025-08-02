'use client'

import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, ExternalLink, Sparkles } from 'lucide-react'
import { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Page = Database['public']['Tables']['pages']['Row']

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
  primaryPage?: Page | null
}

export function DashboardHeader({ user, profile, primaryPage }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 sm:px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 lg:ml-0 ml-16"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Curately
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 sm:space-x-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-1 sm:space-x-2 bg-white/80 border border-gray-300 text-gray-700 hover:bg-white hover:text-gray-900 hover:border-gray-400 transition-all duration-200 px-2 sm:px-4 py-2 h-9 sm:h-10 rounded-xl shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Sign out</span>
          </Button>
        </motion.div>
      </div>
    </motion.header>
  )
}
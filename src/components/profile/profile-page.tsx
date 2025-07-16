'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Database } from '@/lib/supabase/types'
import { SocialIcons } from './social-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExternalLink } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Link = Database['public']['Tables']['links']['Row']
type SocialLink = Database['public']['Tables']['social_media_links']['Row']

interface ProfilePageProps {
  profile: Profile
  links: Link[]
  socialLinks: SocialLink[]
}

export function ProfilePage({ profile, links, socialLinks }: ProfilePageProps) {
  const supabase = createClient()

  const handleLinkClick = async (linkId: string, url: string) => {
    // Track click
    await supabase
      .from('links')
      .update({ clicks: (links.find(l => l.id === linkId)?.clicks || 0) + 1 })
      .eq('id', linkId)

    // Open link
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white'
      case 'gradient1':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      case 'gradient2':
        return 'bg-gradient-to-br from-blue-500 to-teal-500 text-white'
      default:
        return 'bg-gray-50 text-gray-900'
    }
  }

  const getButtonClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'bg-white text-gray-900 hover:bg-gray-100'
      case 'gradient1':
      case 'gradient2':
        return 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
      default:
        return 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
    }
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${getThemeClasses(profile.theme)}`}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || profile.username} />
              <AvatarFallback className="text-xl">
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {profile.display_name || profile.username}
          </h1>
          
          {profile.bio && (
            <p className="text-sm opacity-80 mb-4">
              {profile.bio}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {links.map((link) => (
            <Button
              key={link.id}
              onClick={() => handleLinkClick(link.id, link.url)}
              className={`w-full py-6 text-left justify-between ${getButtonClasses(profile.theme)}`}
              variant="outline"
            >
              <span className="font-medium">{link.title}</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {socialLinks.length > 0 && (
          <div className="text-center">
            <SocialIcons socialLinks={socialLinks} theme={profile.theme} />
          </div>
        )}

        <div className="text-center mt-8 pt-8 border-t border-current/20">
          <p className="text-xs opacity-60">
            Created with{' '}
            <a
              href="https://curately.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Curately
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
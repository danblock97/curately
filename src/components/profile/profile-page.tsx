'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Database } from '@/lib/supabase/types'
import { SocialIcons } from './social-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExternalLink, QrCode } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Link = Database['public']['Tables']['links']['Row'] & {
  qr_codes?: {
    qr_code_data: string
    format: string
    size: number
    foreground_color: string
    background_color: string
  }[]
}
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
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
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
          {links.map((link) => {
            // Special handling for QR codes
            if (link.link_type === 'qr_code' && link.qr_codes && link.qr_codes[0]) {
              return (
                <div key={link.id} className={`w-full p-6 rounded-lg border ${getButtonClasses(profile.theme)} backdrop-blur-sm`}>
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <QrCode className="w-5 h-5" />
                      <span className="font-medium">{link.title}</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg mx-auto w-fit border border-gray-300 shadow-lg">
                      {link.qr_codes[0].format === 'SVG' ? (
                        <div 
                          className="w-32 h-32 mx-auto [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                          dangerouslySetInnerHTML={{ __html: link.qr_codes[0].qr_code_data }}
                        />
                      ) : (
                        <img 
                          src={link.qr_codes[0].qr_code_data}
                          alt={`QR Code for ${link.title}`}
                          className="w-32 h-32 mx-auto object-contain block"
                          onError={(e) => {
                            console.error('QR Code image failed to load:', link.qr_codes[0].qr_code_data.substring(0, 50))
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                    
                    <p className="text-sm opacity-80">
                      Scan to access: {link.url}
                    </p>
                    
                    <Button
                      onClick={() => handleLinkClick(link.id, link.url)}
                      className={`${getButtonClasses(profile.theme)} mt-2`}
                      variant="outline"
                      size="sm"
                    >
                      Open Link
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )
            }
            
            // Regular link display
            return (
              <Button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className={`w-full py-6 text-left justify-between ${getButtonClasses(profile.theme)}`}
                variant="outline"
              >
                <span className="font-medium">{link.title}</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            )
          })}
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
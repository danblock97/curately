import { Database } from '@/lib/supabase/types'
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Github, 
  Facebook,
  Globe
} from 'lucide-react'

type SocialLink = Database['public']['Tables']['social_media_links']['Row']

interface SocialIconsProps {
  socialLinks: SocialLink[]
  theme: string
}

export function SocialIcons({ socialLinks, theme }: SocialIconsProps) {
  const getIconClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'text-white hover:text-gray-300'
      case 'gradient1':
      case 'gradient2':
        return 'text-white hover:text-white/80'
      default:
        return 'text-gray-600 hover:text-gray-900'
    }
  }

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-6 h-6" />
      case 'instagram':
        return <Instagram className="w-6 h-6" />
      case 'linkedin':
        return <Linkedin className="w-6 h-6" />
      case 'youtube':
        return <Youtube className="w-6 h-6" />
      case 'github':
        return <Github className="w-6 h-6" />
      case 'facebook':
        return <Facebook className="w-6 h-6" />
      case 'tiktok':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.995-1.334-2.338-1.334-3.711V.627h-3.213v14.36c0 1.301-.952 2.377-2.141 2.377-1.199 0-2.174-1.096-2.174-2.446 0-1.351.975-2.447 2.174-2.447.119 0 .236.01.35.029V9.328a5.402 5.402 0 0 0-.35-.014c-2.952 0-5.344 2.535-5.344 5.664 0 3.13 2.392 5.664 5.344 5.664 2.951 0 5.344-2.535 5.344-5.664V8.944a8.312 8.312 0 0 0 4.807 1.548V7.35a5.306 5.306 0 0 1-1.283-.217z"/>
          </svg>
        )
      case 'discord':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3c-.197.354-.42.83-.574 1.205a18.27 18.27 0 0 0-4.0 0A8.258 8.258 0 0 0 11.41 3c-1.478.252-2.89.69-4.243 1.31C3.82 6.676 3 9.49 3 12.26c0 .08 0 .16.002.24 1.67 1.226 3.292 1.976 4.86 2.49.39-.53.74-1.096 1.05-1.695-.6-.23-1.17-.52-1.71-.86.14-.1.28-.2.41-.31.02-.02.04-.03.06-.05.02-.01.03-.02.05-.03.49.36 1.02.66 1.58.88.34.14.7.26 1.06.35.23.06.46.1.7.13.15.02.31.03.46.04.12.01.24.01.36.01s.24 0 .36-.01c.15-.01.31-.02.46-.04.24-.03.47-.07.7-.13.36-.09.72-.21 1.06-.35.56-.22 1.09-.52 1.58-.88.02.01.03.02.05.03.02.02.04.03.06.05.13.11.27.21.41.31-.54.34-1.11.63-1.71.86.31.6.66 1.16 1.05 1.69 1.57-.51 3.19-1.26 4.86-2.49.01-.08.01-.16.01-.24 0-2.83-.83-5.64-2.7-7.89zM9.68 12.77c-.66 0-1.2-.62-1.2-1.38s.54-1.38 1.2-1.38 1.2.62 1.2 1.38-.54 1.38-1.2 1.38zm4.64 0c-.66 0-1.2-.62-1.2-1.38s.54-1.38 1.2-1.38 1.2.62 1.2 1.38-.54 1.38-1.2 1.38z" />
          </svg>
        )
      case 'website':
        return <Globe className="w-6 h-6" />
      default:
        return <Globe className="w-6 h-6" />
    }
  }

  if (socialLinks.length === 0) return null

  return (
    <div className="flex justify-center space-x-6">
      {socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-colors ${getIconClasses(theme)}`}
        >
          {getIcon(link.platform)}
        </a>
      ))}
    </div>
  )
}
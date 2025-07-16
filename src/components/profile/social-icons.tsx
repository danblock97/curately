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
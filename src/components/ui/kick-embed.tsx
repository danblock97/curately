'use client'

import { useState, useEffect } from 'react'
import { Users, ExternalLink } from 'lucide-react'

// Kick Logo SVG Component
const KickLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.5 0C3.364 0 0 3.364 0 7.5v9C0 20.636 3.364 24 7.5 24h9c4.136 0 7.5-3.364 7.5-7.5v-9C24 3.364 20.636 0 16.5 0h-9ZM12 4.8c3.979 0 7.2 3.221 7.2 7.2s-3.221 7.2-7.2 7.2S4.8 15.979 4.8 12 8.021 4.8 12 4.8Z"/>
  </svg>
)

interface KickEmbedProps {
  channel: string
  width?: number
  height?: number
  className?: string
  size?: 'small' | 'medium' | 'large'
  showTitle?: boolean
  showViewers?: boolean
  profileImage?: string
}

export function KickEmbed({ 
  channel, 
  width, 
  height, 
  className = '', 
  size = 'large',
  showTitle = true,
  showViewers = true,
  profileImage
}: KickEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Size configurations - Kick embeds work best with these dimensions
  const sizeConfig = {
    small: { width: 400, height: 300 },
    medium: { width: 480, height: 360 },
    large: { width: 640, height: 480 }
  }

  // Always ensure minimum embed dimensions for good viewing experience
  const embedWidth = Math.max(width || sizeConfig[size].width, 400)
  const embedHeight = Math.max(height || sizeConfig[size].height, 300)

  // Clean channel name (remove @ if present)
  const cleanChannel = channel.replace(/^@/, '').toLowerCase()

  const handleLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleError = () => {
    setIsLoading(false)
    setError('Stream unavailable')
  }

  // Set a timeout to handle cases where the iframe never loads
  useEffect(() => {
    if (isLoading && cleanChannel) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        // Don't set error here - let it try to load
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }
  }, [isLoading, cleanChannel])

  const kickUrl = `https://kick.com/${cleanChannel}`
  
  // Get current domain for iframe embedding
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  
  // For localhost development, use localhost. For production, use the actual domain
  const parentDomain = currentDomain === 'localhost' ? 'localhost' : currentDomain
  
  // Kick doesn't have a reliable direct embed URL like Twitch
  // Similar to YouTube Live, we'll use a click-to-visit approach
  // This provides a better user experience than broken iframe embeds
  const embedUrl = '' // Disabled - use click-to-visit pattern like YouTube Live
  

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden w-full h-full ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={cleanChannel}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to Kick logo if profile image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-6 h-6 bg-green-600 rounded flex items-center justify-center ${profileImage ? 'hidden' : 'flex'}`}>
                <KickLogo className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{cleanChannel}</span>
            </div>
            <a 
              href={kickUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {showViewers && (
            <div className="flex items-center space-x-1 mt-1">
              <Users className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Live on Kick</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && embedUrl && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/80 text-sm">Loading {cleanChannel}...</p>
          </div>
        </div>
      )}

      {/* Click-to-Visit State (matches YouTube Live pattern) */}
      {(error || !embedUrl) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
        >
          <div className="text-center">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={cleanChannel}
                className="w-12 h-12 rounded-full object-cover mx-auto mb-3"
                onError={(e) => {
                  // Fallback to Kick logo if profile image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 ${profileImage ? 'hidden' : 'flex'}`}>
              <KickLogo className="w-6 h-6 text-white" />
            </div>
            {cleanChannel ? (
              <>
                <p className="text-white text-sm font-medium mb-1">{cleanChannel}</p>
                <p className="text-white/60 text-xs mb-3">Visit channel to watch live streams</p>
                <a 
                  href={kickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>Watch Live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            ) : (
              <>
                <p className="text-white text-sm font-medium mb-1">Kick Stream</p>
                <p className="text-white/60 text-xs">Channel not configured</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Kick Embed Iframe */}
      {!error && embedUrl && (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allowFullScreen
          className={`border-0 w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          allow="autoplay; fullscreen"
          title={`${cleanChannel} Kick Stream`}
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

    </div>
  )
}
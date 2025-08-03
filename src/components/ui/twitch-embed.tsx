'use client'

import { useState, useEffect } from 'react'
import { Users, ExternalLink } from 'lucide-react'

// Twitch Logo SVG Component
const TwitchLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.149 0L.537 4.119v15.024h5.731V24h3.224l4.867-4.857h7.81l10.69-10.69V0H2.149Zm29.751 7.533l-4.736 4.736h-9.267l-4.736 4.736V12.27H8.425V2.149h23.475v5.384ZM18.637 7.533V15.024h2.149V7.533h-2.149Zm-5.731 0V15.024h2.149V7.533h-2.149Z"/>
  </svg>
)

interface TwitchEmbedProps {
  channel: string
  width?: number
  height?: number
  className?: string
  size?: 'small' | 'medium' | 'large'
  showTitle?: boolean
  showViewers?: boolean
}

export function TwitchEmbed({ 
  channel, 
  width, 
  height, 
  className = '', 
  size = 'large',
  showTitle = true,
  showViewers = true 
}: TwitchEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Size configurations - Twitch requires minimum 400x300 for proper functionality
  // We always use at least these minimum dimensions regardless of container size
  const sizeConfig = {
    small: { width: 400, height: 300 },
    medium: { width: 480, height: 360 },
    large: { width: 640, height: 480 }
  }

  // Always ensure minimum Twitch embed dimensions, even if container is smaller
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

  const twitchUrl = `https://www.twitch.tv/${cleanChannel}`
  
  // Get current domain for parent parameter
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  
  // For localhost development, use localhost. For production, use the actual domain
  const parentDomain = currentDomain === 'localhost' ? 'localhost' : currentDomain
  
  // Twitch embed URL - simpler parameters that work more reliably
  // Using Twitch's embed player with proper parameters
  const embedUrl = `https://player.twitch.tv/?channel=${cleanChannel}&parent=${parentDomain}&muted=false&autoplay=true`
  

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden w-full h-full ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <TwitchLogo className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{cleanChannel}</span>
            </div>
            <a 
              href={twitchUrl}
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
              <span className="text-white/80 text-xs">Live on Twitch</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && cleanChannel && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/80 text-sm">Loading {cleanChannel}...</p>
          </div>
        </div>
      )}

      {/* Error/Offline State */}
      {(error || !cleanChannel) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TwitchLogo className="w-6 h-6 text-white" />
            </div>
            {cleanChannel ? (
              <>
                <p className="text-white text-sm font-medium mb-1">{cleanChannel}</p>
                <p className="text-white/60 text-xs mb-3">Stream currently offline</p>
                <a 
                  href={twitchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>Visit Channel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            ) : (
              <>
                <p className="text-white text-sm font-medium mb-1">Twitch Stream</p>
                <p className="text-white/60 text-xs">Channel not configured</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Twitch Embed Iframe */}
      {!error && cleanChannel && (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allowFullScreen
          className={`border-0 w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          allow="autoplay; fullscreen"
          title={`${cleanChannel} Twitch Stream`}
          style={{ border: 0 }}
        />
      )}

    </div>
  )
}
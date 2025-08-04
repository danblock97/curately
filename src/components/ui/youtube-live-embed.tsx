'use client'

import { useState, useEffect } from 'react'
import { Users, ExternalLink } from 'lucide-react'

// YouTube Logo SVG Component
const YouTubeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

interface YouTubeLiveEmbedProps {
  channelId?: string
  channelHandle?: string
  width?: number
  height?: number
  className?: string
  size?: 'small' | 'medium' | 'large'
  showTitle?: boolean
  showViewers?: boolean
}

export function YouTubeLiveEmbed({ 
  channelId,
  channelHandle,
  width, 
  height, 
  className = '', 
  size = 'large',
  showTitle = true,
  showViewers = true 
}: YouTubeLiveEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Size configurations - YouTube embeds work well with these dimensions
  const sizeConfig = {
    small: { width: 400, height: 225 }, // 16:9 aspect ratio
    medium: { width: 560, height: 315 },
    large: { width: 640, height: 360 }
  }

  // Always ensure minimum dimensions for good viewing experience
  const embedWidth = Math.max(width || sizeConfig[size].width, 320)
  const embedHeight = Math.max(height || sizeConfig[size].height, 180)

  // Clean channel identifier
  const cleanChannelId = channelId?.trim()
  const cleanChannelHandle = channelHandle?.replace(/^@/, '').trim()
  
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
    if (isLoading && (cleanChannelId || cleanChannelHandle)) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        // Don't set error here - let it try to load
      }, 10000) // 10 second timeout

      return () => clearTimeout(timeout)
    }
  }, [isLoading, cleanChannelId, cleanChannelHandle])

  // YouTube URLs
  const youtubeUrl = cleanChannelHandle 
    ? `https://www.youtube.com/@${cleanChannelHandle}` 
    : cleanChannelId 
    ? `https://www.youtube.com/channel/${cleanChannelId}`
    : ''
  
  // YouTube doesn't have a reliable "always live" embed URL like Twitch
  // The /embed/live_stream endpoint is unreliable and often shows "video unavailable"
  // Instead, we'll show a placeholder that links to the channel
  // In the future, this could be enhanced with YouTube API to get actual live video IDs
  const embedUrl = '' // Disabled for now due to YouTube API limitations

  const displayName = cleanChannelHandle || cleanChannelId || 'Channel'

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden w-full h-full ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                <YouTubeLogo className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{displayName}</span>
            </div>
            {youtubeUrl && (
              <a 
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {showViewers && (
            <div className="flex items-center space-x-1 mt-1">
              <Users className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Live on YouTube</span>
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
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/80 text-sm">Loading {displayName}...</p>
          </div>
        </div>
      )}

      {/* Error/Offline State */}
      {(error || !embedUrl) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <YouTubeLogo className="w-6 h-6 text-white" />
            </div>
            {(cleanChannelHandle || cleanChannelId) ? (
              <>
                <p className="text-white text-sm font-medium mb-1">{displayName}</p>
                <p className="text-white/60 text-xs mb-3">Visit channel to watch live streams</p>
                {youtubeUrl && (
                  <a 
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                  >
                    <span>Watch Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </>
            ) : (
              <>
                <p className="text-white text-sm font-medium mb-1">YouTube Live</p>
                <p className="text-white/60 text-xs">Channel not configured</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* YouTube Live Embed Iframe */}
      {!error && embedUrl && (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allowFullScreen
          className={`border-0 w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          title={`${displayName} YouTube Live Stream`}
          style={{ border: 0 }}
        />
      )}

    </div>
  )
}
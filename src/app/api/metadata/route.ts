import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Handle special cases for platforms that might block requests
    const urlObj = new URL(url)
    const domain = urlObj.hostname.toLowerCase()
    
    // Special handling for Kick.com - they might block scraping
    if (domain.includes('kick.com')) {
      // For Kick, we'll provide fallback metadata without scraping
      const channelName = urlObj.pathname.replace('/', '')
      return NextResponse.json({
        title: `${channelName} on Kick`,
        description: `Watch ${channelName} live on Kick`,
        image: '',
        favicon: 'https://logo.clearbit.com/kick.com',
        url,
        isPopularApp: true,
        appName: 'Kick',
        appLogo: 'https://logo.clearbit.com/kick.com',
        displayName: channelName,
        profileImage: '' // Will be empty since we can't scrape Kick
      })
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      // If fetch fails, check if it's a known platform and provide fallback
      const popularApps = {
        'twitter.com': { name: 'X (Twitter)', logo: 'https://logo.clearbit.com/x.com' },
        'x.com': { name: 'X (Twitter)', logo: 'https://logo.clearbit.com/x.com' },
        'instagram.com': { name: 'Instagram', logo: 'https://logo.clearbit.com/instagram.com' },
        'kick.com': { name: 'Kick', logo: 'https://logo.clearbit.com/kick.com' },
        'twitch.tv': { name: 'Twitch', logo: 'https://logo.clearbit.com/twitch.tv' }
      }
      
      const fallbackApp = popularApps[domain as keyof typeof popularApps] || popularApps[domain.replace('www.', '') as keyof typeof popularApps]
      
      if (fallbackApp) {
        const pathName = urlObj.pathname.replace('/', '') || 'Profile'
        return NextResponse.json({
          title: `${pathName} on ${fallbackApp.name}`,
          description: `Visit ${pathName} on ${fallbackApp.name}`,
          image: '',
          favicon: fallbackApp.logo,
          url,
          isPopularApp: true,
          appName: fallbackApp.name,
          appLogo: fallbackApp.logo,
          displayName: pathName,
          profileImage: ''
        })
      }
      
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 })
    }

    const html = await response.text()
    
    // Extract metadata using regex (basic implementation)
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i) ||
                           html.match(/<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\'][^>]*>/i)
    
    // Try to get Open Graph data
    const ogTitleMatch = html.match(/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i)
    const ogDescriptionMatch = html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i)
    const ogImageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i)
    
    // Try to get favicon with multiple approaches
    const faviconMatch = html.match(/<link[^>]*rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]*href=["\']([^"\']*)["\'][^>]*>/i) ||
                        html.match(/<link[^>]*href=["\']([^"\']*)["\'][^>]*rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]*>/i)
    
    const title = ogTitleMatch?.[1] || titleMatch?.[1] || url
    const description = ogDescriptionMatch?.[1] || descriptionMatch?.[1] || ''
    let image = ogImageMatch?.[1] || ''
    let displayName = ''
    
    // For Spotify, try alternative methods to find profile images and display names
    if (url.includes('spotify.com')) {
      // Try to find profile image in various Spotify-specific patterns
      const spotifyImagePatterns = [
        // Look for profile image URLs in JavaScript/JSON data
        /"image"[^"]*"([^"]*https:\/\/[^"]*\.scdn\.co[^"]*)/i,
        /"avatar"[^"]*"([^"]*)/i,
        /profileImageUrl[^"]*"([^"]*)/i,
        // Look for any Spotify CDN image URLs
        /https:\/\/[^"\s]*\.scdn\.co[^"\s]*\.(jpg|jpeg|png|webp)/i,
        // Look for Spotify image URLs in data attributes
        /data-image=['"]*([^'"]*scdn\.co[^'"]*)/i
      ]
      
      // Try to find display name in various patterns
      const spotifyNamePatterns = [
        // Look for display name in various Spotify patterns
        /"display_name"[^"]*"([^"]*)/i,
        /"name"[^"]*"([^"]*)/i,
        /displayName[^"]*"([^"]*)/i,
        // Look for artist or user name
        /"artist"[^"]*"name"[^"]*"([^"]*)/i,
        /"user"[^"]*"display_name"[^"]*"([^"]*)/i
      ]
      
      // Try image patterns
      for (let i = 0; i < spotifyImagePatterns.length; i++) {
        const pattern = spotifyImagePatterns[i]
        const match = html.match(pattern)
        if (match && match[1] && match[1].includes('scdn.co')) {
          image = match[1]
          break
        }
      }
      
      // Try name patterns
      for (let i = 0; i < spotifyNamePatterns.length; i++) {
        const pattern = spotifyNamePatterns[i]
        const match = html.match(pattern)
        if (match && match[1] && match[1].length > 0 && match[1].length < 100) {
          displayName = match[1]
          break
        }
      }
      
      // If no display name found through patterns, try extracting from description
      if (!displayName && description) {
        // Try to extract name from descriptions like "User · Dan Block"
        const parts = description.split(" · ");
        if (parts.length > 1) {
          displayName = parts[1].trim();
        }
      }
      
      // If still no display name found, try using the og:title as display name
      if (!displayName && ogTitleMatch && ogTitleMatch[1]) {
        displayName = ogTitleMatch[1]
      }
      
    }

    // Discord: try to extract server name and icon from invite pages
    if (url.includes('discord.gg') || url.includes('discord.com')) {
      try {
        // Many Discord invite pages expose og:title like "Join the <Server Name> Discord Server!"
        // and og:image as the server icon.
        let serverName = ''
        if (ogTitleMatch && ogTitleMatch[1]) {
          const rawTitle = ogTitleMatch[1]
          const titlePatterns = [
            /Join\s+(?:the\s+)?(.+?)\s+(?:Discord Server|on Discord)/i,
            /Join\s+(.+?)\s+on Discord/i,
            /^(.+?)\s+\|\s+Discord$/i
          ]
          for (const pattern of titlePatterns) {
            const m = rawTitle.match(pattern)
            if (m && m[1]) { serverName = m[1].trim(); break }
          }
          if (!serverName) {
            // Fallback: remove common Discord title suffixes/prefixes
            serverName = rawTitle
              .replace(/Join\s+the\s+/i, '')
              .replace(/\s+Discord Server!?/i, '')
              .replace(/\s+\|\s+Discord/i, '')
              .trim()
          }
        }

        // Use og:image as profile image when present
        if (ogImageMatch && ogImageMatch[1]) {
          image = ogImageMatch[1]
        }

        // Expose for consumers
        if (serverName) {
          displayName = serverName
        }

        // Helpful log to inspect Discord metadata shape during development
        console.log('[metadata] Discord parsed', { title: ogTitleMatch?.[1], serverName: displayName, image })
      } catch (e) {
        console.warn('Failed to parse Discord metadata', e)
      }
    }
    
    let favicon = faviconMatch?.[1] || ''
    
    // Convert relative favicon URLs to absolute
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url)
      if (favicon.startsWith('/')) {
        favicon = `${urlObj.origin}${favicon}`
      } else {
        favicon = `${urlObj.origin}/${favicon}`
      }
    }
    
    // Fallback to default favicon if not found
    if (!favicon) {
      const urlObj = new URL(url)
      favicon = `${urlObj.origin}/favicon.ico`
    }
    
    // Ensure absolute image URL for og:image
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url)
      if (image.startsWith('/')) {
        image = `${urlObj.origin}${image}`
      } else {
        image = `${urlObj.origin}/${image}`
      }
    }

    // Detect popular apps and get their official logos
    const domain2 = urlObj.hostname.toLowerCase()
    const popularApps = {
      'twitter.com': { name: 'X (Twitter)', logo: '/platform-logos/x.png' },
      'x.com': { name: 'X (Twitter)', logo: '/platform-logos/x.png' },
      'instagram.com': { name: 'Instagram', logo: '/platform-logos/instagram.png' },
      'facebook.com': { name: 'Facebook', logo: '/platform-logos/facebook.png' },
      'linkedin.com': { name: 'LinkedIn', logo: '/platform-logos/linkedin.webp' },
      'youtube.com': { name: 'YouTube', logo: '/platform-logos/youtube.png' },
      'tiktok.com': { name: 'TikTok', logo: '/platform-logos/tiktok.png' },
      'github.com': { name: 'GitHub', logo: '/platform-logos/github.png' },
      'threads.net': { name: 'Threads', logo: '/platform-logos/threads.jpg' },
      'snapchat.com': { name: 'Snapchat', logo: '/platform-logos/snapchat.png' },
      'twitch.tv': { name: 'Twitch', logo: '/platform-logos/twitch.webp' },
      'spotify.com': { name: 'Spotify', logo: '/platform-logos/spotify.png' },
      'kick.com': { name: 'Kick', logo: '/platform-logos/kick.jpg' },
      'discord.com': { name: 'Discord', logo: '/platform-logos/discord.webp' },
      'medium.com': { name: 'Medium', logo: 'https://logo.clearbit.com/medium.com' },
      'reddit.com': { name: 'Reddit', logo: 'https://logo.clearbit.com/reddit.com' },
      'discord.com': { name: 'Discord', logo: 'https://logo.clearbit.com/discord.com' },
      'soundcloud.com': { name: 'SoundCloud', logo: 'https://logo.clearbit.com/soundcloud.com' }
    }

    const popularApp = popularApps[domain2 as keyof typeof popularApps] || popularApps[domain2.replace('www.', '') as keyof typeof popularApps]
    
    // Use popular app info if available
    if (popularApp) {
      favicon = popularApp.logo
      // For Discord and other known platforms, also provide a stable appLogo
      if (!image && (domain2.includes('discord.gg') || domain2.includes('discord.com'))) {
        image = '/platform-logos/discord.webp'
      }
    }

    // Decode HTML entities
    const decodeHtmlEntities = (str: string) => {
      return str.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
    };

    const result = {
      title: title.trim(),
      description: description.trim(),
      image: decodeHtmlEntities(image.trim()),
      favicon: favicon.trim(),
      url,
      isPopularApp: !!popularApp,
      appName: popularApp?.name || '',
      appLogo: popularApp?.logo || favicon,
      displayName: displayName.trim(),
      profileImage: decodeHtmlEntities(image.trim()) // Add profileImage alias for consistency
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
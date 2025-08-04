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

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
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

    // Detect popular apps and get their official logos
    const urlObj = new URL(url)
    const domain = urlObj.hostname.toLowerCase()
    const popularApps = {
      'twitter.com': { name: 'X (Twitter)', logo: 'https://logo.clearbit.com/x.com' },
      'x.com': { name: 'X (Twitter)', logo: 'https://logo.clearbit.com/x.com' },
      'instagram.com': { name: 'Instagram', logo: 'https://logo.clearbit.com/instagram.com' },
      'facebook.com': { name: 'Facebook', logo: 'https://logo.clearbit.com/facebook.com' },
      'linkedin.com': { name: 'LinkedIn', logo: 'https://logo.clearbit.com/linkedin.com' },
      'youtube.com': { name: 'YouTube', logo: 'https://logo.clearbit.com/youtube.com' },
      'tiktok.com': { name: 'TikTok', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg' },
      'github.com': { name: 'GitHub', logo: 'https://logo.clearbit.com/github.com' },
      'medium.com': { name: 'Medium', logo: 'https://logo.clearbit.com/medium.com' },
      'reddit.com': { name: 'Reddit', logo: 'https://logo.clearbit.com/reddit.com' },
      'discord.com': { name: 'Discord', logo: 'https://logo.clearbit.com/discord.com' },
      'twitch.tv': { name: 'Twitch', logo: 'https://logo.clearbit.com/twitch.tv' },
      'spotify.com': { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com' },
      'soundcloud.com': { name: 'SoundCloud', logo: 'https://logo.clearbit.com/soundcloud.com' }
    }

    const popularApp = popularApps[domain as keyof typeof popularApps] || popularApps[domain.replace('www.', '') as keyof typeof popularApps]
    
    // Use popular app info if available
    if (popularApp) {
      favicon = popularApp.logo
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
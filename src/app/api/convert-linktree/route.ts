import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate that it's a Linktree URL
    if (!url.includes('linktr.ee')) {
      return NextResponse.json({ error: 'Please provide a valid Linktree URL' }, { status: 400 })
    }

    // Fetch the Linktree page with retry logic
    let response
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount <= maxRetries) {
      try {
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        })

        if (response.ok) {
          break
        } else if (response.status === 429) {
          // Rate limited, wait and retry
          const waitTime = Math.pow(2, retryCount) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, waitTime))
          retryCount++
        } else {
          return NextResponse.json({ error: `Failed to fetch Linktree page: ${response.status} ${response.statusText}` }, { status: 400 })
        }
      } catch (fetchError) {
        if (retryCount === maxRetries) {
          return NextResponse.json({ error: 'Failed to fetch Linktree page after retries' }, { status: 400 })
        }
        const waitTime = Math.pow(2, retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, waitTime))
        retryCount++
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Linktree page after retries' }, { status: 400 })
    }

    const html = await response.text()
    
    // Parse the HTML to extract links
    const links = parseLinktreeHTML(html)
    
    return NextResponse.json({ links })
  } catch (error) {
    console.error('Error converting Linktree:', error)
    return NextResponse.json({ error: 'Failed to convert Linktree' }, { status: 500 })
  }
}

function parseLinktreeHTML(html: string) {
  const links: Array<{
    title: string
    url: string
    platform?: string
    username?: string
  }> = []

  // Extract JSON-LD data which contains the links
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (jsonLdMatch) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1])
      if (jsonData.mainEntity && jsonData.mainEntity.url) {
        // This is for the main profile, let's look for other patterns
      }
    } catch (e) {
      // JSON parsing failed, continue with HTML parsing
    }
  }

  // Look for link patterns in the HTML
  // Linktree uses different patterns, let's try multiple approaches
  
  // Method 1: Look for link data in script tags
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g)
  if (scriptMatches) {
    for (const script of scriptMatches) {
      // Look for link objects in the script content
      const linkMatches = script.match(/(?:"title":|title:)\s*"([^"]+)"[^}]*(?:"url":|url:)\s*"([^"]+)"/g)
      if (linkMatches) {
        for (const match of linkMatches) {
          const titleMatch = match.match(/(?:"title":|title:)\s*"([^"]+)"/)
          const urlMatch = match.match(/(?:"url":|url:)\s*"([^"]+)"/)
          
          if (titleMatch && urlMatch) {
            const title = titleMatch[1]
            const url = urlMatch[1]
            
            if (url.startsWith('http')) {
              const platform = detectPlatform(url)
              const username = extractUsername(url, platform)
              
              links.push({
                title,
                url,
                platform,
                username
              })
            }
          }
        }
      }
    }
  }

  // Method 2: Look for Next.js page props
  const pagePropsMatch = html.match(/"pageProps":\s*({[\s\S]*?})\s*,\s*"__N_SSG"/)
  if (pagePropsMatch) {
    try {
      const pageProps = JSON.parse(pagePropsMatch[1])
      if (pageProps.account) {
        // Process main links
        if (pageProps.account.links) {
          for (const link of pageProps.account.links) {
            if (link.title && link.url && link.url.startsWith('http')) {
              const platform = detectPlatform(link.url)
              const username = extractUsername(link.url, platform)
              
              links.push({
                title: link.title,
                url: link.url,
                platform,
                username
              })
            }
          }
        }
        
        // Process social links
        if (pageProps.account.socialLinks) {
          for (const link of pageProps.account.socialLinks) {
            if (link.url && link.url.startsWith('http')) {
              const platform = detectPlatform(link.url)
              const username = extractUsername(link.url, platform)
              const title = link.title || link.platform || (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Social Link')
              
              links.push({
                title,
                url: link.url,
                platform,
                username
              })
            }
          }
        }
      }
    } catch (e) {
      // Failed to parse pageProps
    }
  }

  // Method 3: Look for __NEXT_DATA__ script
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1])
      if (nextData.props && nextData.props.pageProps && nextData.props.pageProps.account) {
        const account = nextData.props.pageProps.account
        
        // Process main links
        if (account.links) {
          for (const link of account.links) {
            if (link.title && link.url && link.url.startsWith('http')) {
              const platform = detectPlatform(link.url)
              const username = extractUsername(link.url, platform)
              
              links.push({
                title: link.title,
                url: link.url,
                platform,
                username
              })
            }
          }
        }
        
        // Process social links
        if (account.socialLinks) {
          for (const link of account.socialLinks) {
            if (link.url && link.url.startsWith('http')) {
              const platform = detectPlatform(link.url)
              const username = extractUsername(link.url, platform)
              const title = link.title || link.platform || (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Social Link')
              
              links.push({
                title,
                url: link.url,
                platform,
                username
              })
            }
          }
        }
      }
    } catch (e) {
      // Failed to parse __NEXT_DATA__
    }
  }

  // Remove duplicates
  const uniqueLinks = links.filter((link, index, self) => 
    index === self.findIndex(l => l.url === link.url)
  )

  // Filter out ads and promotional links
  const filteredLinks = uniqueLinks.filter(link => {
    if (!link.url || !link.title) return false
    
    const url = link.url.toLowerCase()
    const title = link.title.toLowerCase()
    
    // Whitelist known social media and legitimate platforms
    const legitimatePlatforms = [
      'instagram.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'tiktok.com',
      'youtube.com',
      'linkedin.com',
      'github.com',
      'spotify.com',
      'music.apple.com',
      'soundcloud.com',
      'twitch.tv',
      'pinterest.com',
      'snapchat.com',
      'discord.gg',
      'reddit.com',
      'tumblr.com',
      'vimeo.com',
      'medium.com',
      'substack.com',
      'patreon.com',
      'ko-fi.com',
      'buymeacoffee.com',
      'gofundme.com',
      'kickstarter.com',
      'etsy.com',
      'amazon.com/dp',
      'amazon.com/gp/product',
      'goodreads.com',
      'dribbble.com',
      'behance.net',
      'deviantart.com',
      'flickr.com',
      'unsplash.com',
      '500px.com',
      'vsco.co',
      'artstation.com',
      'bandcamp.com',
      'mixcloud.com',
      'last.fm',
      'deezer.com',
      'pandora.com',
      'audiomack.com',
      'reverbnation.com',
      'onlyfans.com',
      'cameo.com',
      'fiverr.com',
      'upwork.com',
      'freelancer.com',
      '99designs.com',
      'coursera.org',
      'udemy.com',
      'skillshare.com',
      'masterclass.com',
      'teachable.com',
      'thinkific.com',
      'gumroad.com',
      'teespring.com',
      'redbubble.com',
      'society6.com',
      'zazzle.com',
      'threadless.com',
      'designbyhumans.com',
      'teepublic.com',
      'printful.com',
      'printify.com',
      'gooten.com',
      'printaura.com',
      'teelaunch.com',
      'subliminator.com',
      'dreamship.com',
      'gearbubble.com',
      'sunfrog.com',
      'viralstyle.com',
      'teespring.com',
      'spreadshirt.com',
      'cafepress.com',
      'customink.com',
      'bonfire.com',
      'represent.com',
      'spring.com',
      'merch.amazon.com',
      'society6.com',
      'redbubble.com',
      'etsy.com',
      'shopify.com',
      'wix.com',
      'squarespace.com',
      'wordpress.com',
      'blogger.com',
      'tumblr.com',
      'ghost.org',
      'substack.com',
      'medium.com',
      'dev.to',
      'hashnode.com',
      'notion.so',
      'obsidian.md',
      'roamresearch.com',
      'logseq.com',
      'remnote.com',
      'evernote.com',
      'onenote.com',
      'simplenote.com',
      'bear.app',
      'ulysses.app',
      'ia.net',
      'typora.io',
      'marktext.app',
      'zettlr.com',
      'vnote.fun',
      'notable.app',
      'boostnote.io',
      'trilium.cc',
      'joplin.cozic.net',
      'standardnotes.org',
      'turtlapp.com',
      'laverna.cc',
      'qownnotes.org',
      'vnote.fun',
      'zim-wiki.org',
      'tiddlywiki.com',
      'dokuwiki.org',
      'mediawiki.org',
      'confluence.atlassian.com',
      'slack.com',
      'discord.com',
      'telegram.org',
      'whatsapp.com',
      'signal.org',
      'element.io',
      'matrix.org',
      'rocket.chat',
      'mattermost.com',
      'zulip.com',
      'twist.com',
      'flock.com',
      'chanty.com',
      'ryver.com',
      'flowdock.com',
      'hipchat.com',
      'campfire.com',
      'gitter.im',
      'spectrum.chat',
      'zulipchat.com',
      'framateam.org',
      'wire.com',
      'viber.com',
      'line.me',
      'wechat.com',
      'kik.com',
      'snapchat.com',
      'skype.com',
      'zoom.us',
      'meet.google.com',
      'teams.microsoft.com',
      'webex.com',
      'gotomeeting.com',
      'join.me',
      'bluejeans.com',
      'whereby.com',
      'appear.in',
      'jitsi.org',
      'bigbluebutton.org',
      'openmeetings.apache.org',
      'jami.net',
      'tox.chat',
      'briar.app',
      'session.org',
      'wickr.com',
      'dust.com',
      'confide.com',
      'cyber-dust.com',
      'coverme.com',
      'telegram.org',
      'threema.ch',
      'silence.im',
      'ricochet.im',
      'pond.imperialviolet.org',
      'bitmessage.org',
      'retroshare.cc',
      'tox.chat',
      'jami.net',
      'briar.app',
      'session.org',
      'wickr.com',
      'dust.com',
      'confide.com',
      'cyber-dust.com',
      'coverme.com',
      'telegram.org',
      'threema.ch',
      'silence.im',
      'ricochet.im',
      'pond.imperialviolet.org',
      'bitmessage.org',
      'retroshare.cc'
    ]
    
    // If it's a legitimate platform, keep it
    const isLegitimate = legitimatePlatforms.some(platform => url.includes(platform))
    if (isLegitimate) {
      return true
    }
    
    // Filter out common ad domains and promotional content
    const adDomains = [
      'thanks.is',
      'kqzyfj.com',
      'click.linksynergy.com',
      'linksynergy.com',
      'sjv.io',
      'pxf.io',
      'wk5q.net',
      'commission-junction.com',
      'cj.com',
      'avantlink.com',
      'clickbank.com',
      'shareasale.com',
      'impact.com',
      'partnerize.com',
      'awin.com',
      'affiliatewindow.com',
      'tradedoubler.com',
      'linkshare.com',
      'rakuten.com',
      'linktr.ee',
      'bit.ly',
      'tinyurl.com',
      'shorturl.at',
      'rebrand.ly',
      'app.link',
      'link.us',
      'smarturl.it',
      'fanlink.to',
      'hyperfollow.com',
      'distrokid.com',
      'ampl.ink',
      'songwhip.com',
      'lnk.to',
      'orcd.co',
      'ffm.to',
      'smarturl.com',
      'unitedmasters.com',
      'ditto.fm',
      'push.fm',
      'songlink.io',
      'odesli.co',
      'linkfire.com',
      'show.co',
      'hypeddit.com',
      'toneden.io',
      'feature.fm',
      'fanlink.tv',
      'linktr.ee/lite',
      'linktr.ee/s/',
      'promo.com',
      'ads.google.com',
      'facebook.com/tr',
      'google-analytics.com',
      'googletagmanager.com',
      'doubleclick.net',
      'amazon-adsystem.com',
      'googleadservices.com',
      'googlesyndication.com',
      'adsystem.amazon.com',
      'amazon.com/adprefs',
      'amazon.com/dp/product-ads',
      'amazon.co.uk/adprefs',
      'amazon.ca/adprefs',
      'amazon.de/adprefs',
      'amazon.fr/adprefs',
      'amazon.it/adprefs',
      'amazon.es/adprefs',
      'amazon.com.au/adprefs',
      'amazon.in/adprefs',
      'amazon.co.jp/adprefs',
      'amazon.com.mx/adprefs',
      'amazon.com.br/adprefs',
      'amazon.nl/adprefs',
      'amazon.pl/adprefs',
      'amazon.se/adprefs',
      'amazon.com.tr/adprefs',
      'amazon.ae/adprefs',
      'amazon.sa/adprefs',
      'amazon.sg/adprefs',
      'amazon.eg/adprefs',
      'linktree.com',
      'beacons.ai',
      'carrd.co',
      'bio.link',
      'allmylinks.com',
      'taplink.cc',
      'campsite.bio',
      'linkpop.com',
      'koji.to',
      'contact.bio',
      'milkshake.app',
      'shor.by',
      'later.com/bio',
      'linkfly.to',
      'solo.to',
      'linkstack.org',
      'linkkle.com',
      'linkr.bio',
      'lnk.bio',
      'hoo.be',
      'linkbio.co',
      'by.bio',
      'flowcode.com',
      'qr.io',
      'qrcode.com',
      'scan.me',
      'linkin.bio',
      'komi.io',
      'urltree.com',
      'linkfly.to',
      'manylink.co',
      'linkr.bio',
      'switchy.io',
      'linkbio.co',
      'by.bio',
      'flowcode.com',
      'qr.io',
      'qrcode.com',
      'scan.me',
      'linkin.bio',
      'komi.io',
      'urltree.com',
      'linkfly.to',
      'manylink.co'
    ]
    
    // Check if URL contains any ad domains
    const hasAdDomain = adDomains.some(domain => url.includes(domain))
    if (hasAdDomain) {
      return false
    }
    
    // Filter out common promotional titles
    const promotionalTitles = [
      'enjoy',
      'free',
      'claim',
      'get',
      'score',
      'scored',
      'you\'ve scored',
      'sip your way',
      'power up',
      'start speaking',
      'help with or without',
      'days of',
      'meals',
      'hellofresh',
      'hulu',
      'factor',
      'curology',
      'armra',
      'first box',
      'membership',
      'half the price',
      'cash back',
      'gas',
      'cleaner skin',
      'clearstem',
      'equipfoods',
      'equip foods',
      'fabletics',
      'signing up',
      'be a vip',
      'agency',
      'purple carrot',
      'daily harvest',
      'high-protein',
      'zero proof',
      'non-alcoholic',
      'spirits',
      'jlab',
      'audio gear',
      'talkspace',
      'insurance',
      'babbel',
      'new language',
      'get paid to',
      'earn money',
      'make money',
      'free money',
      'click here',
      'sign up',
      'join now',
      'limited time',
      'exclusive offer',
      'special deal',
      'download now',
      'try free',
      'get started',
      'learn more',
      'find out more',
      'discover',
      'unlock',
      'access',
      'instant access',
      'free trial',
      'no cost',
      'risk free',
      'guarantee',
      'bonus',
      'reward',
      'prize',
      'giveaway',
      'contest',
      'sweepstakes',
      'promotion',
      'promo',
      'coupon',
      'discount',
      'save',
      'deal',
      'offer',
      'sale',
      'buy now',
      'shop now',
      'order now',
      'purchase',
      'affiliate',
      'referral',
      'commission',
      'sponsored',
      'ad',
      'advertisement',
      'marketing',
      'campaign',
      'track',
      'analytics',
      'pixel',
      'tag',
      'utm_',
      'ref=',
      'affiliate=',
      'promo=',
      'campaign=',
      'source=',
      'medium=',
      'content=',
      'term=',
      'gclid=',
      'fbclid=',
      'msclkid=',
      'dclid=',
      'wbraid=',
      'gbraid=',
      'gad_source=',
      'gad=',
      'click_id=',
      'clickid=',
      'transaction_id=',
      'irclickid=',
      'subid=',
      'aff_sub=',
      'aff_id=',
      'partner='
    ]
    
    // Check if title contains promotional content
    const hasPromotionalTitle = promotionalTitles.some(promo => title.includes(promo))
    if (hasPromotionalTitle) {
      return false
    }
    
    // Filter out URLs with tracking parameters
    const hasTrackingParams = url.includes('utm_') || url.includes('ref=') || url.includes('affiliate=') || 
                             url.includes('gclid=') || url.includes('fbclid=') || url.includes('msclkid=') ||
                             url.includes('irclickid=') || url.includes('subid=') || url.includes('aff_')
    if (hasTrackingParams) {
      return false
    }
    
    return true
  })

  return filteredLinks
}

function detectPlatform(url: string): string | undefined {
  const hostname = new URL(url).hostname.toLowerCase()
  
  if (hostname.includes('instagram.com')) return 'instagram'
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter'
  if (hostname.includes('tiktok.com')) return 'tiktok'
  if (hostname.includes('youtube.com')) return 'youtube'
  if (hostname.includes('facebook.com')) return 'facebook'
  if (hostname.includes('linkedin.com')) return 'linkedin'
  if (hostname.includes('github.com')) return 'github'
  if (hostname.includes('spotify.com')) return 'spotify'
  if (hostname.includes('music.apple.com')) return 'apple_music'
  if (hostname.includes('soundcloud.com')) return 'soundcloud'
  
  return undefined
}

function extractUsername(url: string, platform?: string): string | undefined {
  if (!platform) return undefined
  
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/').filter(Boolean)
    
    switch (platform) {
      case 'instagram':
      case 'tiktok':
      case 'github':
      case 'soundcloud':
        return segments[0]?.replace('@', '')
      case 'twitter':
        return segments[0]?.replace('@', '')
      case 'youtube':
        if (segments[0] === 'c' || segments[0] === 'channel') {
          return segments[1]
        }
        return segments[0]?.replace('@', '')
      case 'linkedin':
        if (segments[0] === 'in') {
          return segments[1]
        }
        return segments[0]
      case 'facebook':
        return segments[0]
      case 'spotify':
        if (segments[0] === 'user') {
          return segments[1]
        }
        return segments[0]
      case 'apple_music':
        if (segments[0] === 'profile') {
          return segments[1]
        }
        return segments[0]
      default:
        return segments[0]
    }
  } catch (e) {
    return undefined
  }
}
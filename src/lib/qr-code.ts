import QRCode from 'qrcode'

export interface QRCodeOptions {
  size?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  foregroundColor?: string
  backgroundColor?: string
  margin?: number
}

export interface QRCodeSVGOptions extends QRCodeOptions {
  width?: number
}

export interface BrandedQRCodeOptions extends QRCodeOptions {
  logoUrl?: string
  logoSize?: number
  logoBackgroundColor?: string
  logoBorderColor?: string
}

/**
 * Generate QR code as PNG data URL
 */
export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 4
  } = options

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: size,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      margin
    })
    
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  text: string,
  options: QRCodeSVGOptions = {}
): Promise<string> {
  const {
    width = 200,
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 4
  } = options

  try {
    const qrCodeSVG = await QRCode.toString(text, {
      type: 'svg',
      width,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      margin
    })
    
    return qrCodeSVG
  } catch (error) {
    console.error('Error generating QR code SVG:', error)
    throw new Error('Failed to generate QR code SVG')
  }
}

/**
 * Generate QR code as base64 PNG
 */
export async function generateQRCodeBase64(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 4
  } = options

  try {
    const qrCodeBuffer = await QRCode.toBuffer(text, {
      width: size,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      margin
    })
    
    return qrCodeBuffer.toString('base64')
  } catch (error) {
    console.error('Error generating QR code base64:', error)
    throw new Error('Failed to generate QR code base64')
  }
}

/**
 * Get QR code URL for short code
 */
export function getQRCodeUrl(shortCode: string): string {
  // Use production URL when in production, fallback to env var or localhost for development
  const isProduction = process.env.NODE_ENV === 'production'
  const baseUrl = isProduction 
    ? 'https://curately.co.uk'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  return `${baseUrl}/l/${shortCode}`
}

/**
 * Validate QR code options
 */
export function validateQRCodeOptions(options: QRCodeOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (options.size && (options.size < 50 || options.size > 1000)) {
    errors.push('Size must be between 50 and 1000 pixels')
  }
  
  if (options.errorCorrectionLevel && !['L', 'M', 'Q', 'H'].includes(options.errorCorrectionLevel)) {
    errors.push('Error correction level must be L, M, Q, or H')
  }
  
  if (options.foregroundColor && !isValidColor(options.foregroundColor)) {
    errors.push('Foreground color must be a valid hex color')
  }
  
  if (options.backgroundColor && !isValidColor(options.backgroundColor)) {
    errors.push('Background color must be a valid hex color')
  }
  
  if (options.margin && (options.margin < 0 || options.margin > 20)) {
    errors.push('Margin must be between 0 and 20')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate hex color
 */
function isValidColor(color: string): boolean {
  const hexColorRegex = /^#[0-9A-F]{6}$/i
  return hexColorRegex.test(color)
}

/**
 * Get QR code error correction level description
 */
export function getErrorCorrectionDescription(level: string): string {
  switch (level) {
    case 'L':
      return 'Low (~7% correction)'
    case 'M':
      return 'Medium (~15% correction)'
    case 'Q':
      return 'Quartile (~25% correction)'
    case 'H':
      return 'High (~30% correction)'
    default:
      return 'Unknown'
  }
}

/**
 * Calculate optimal QR code size based on content length
 */
export function getOptimalQRCodeSize(content: string): number {
  const length = content.length
  
  if (length <= 50) return 200
  if (length <= 100) return 250
  if (length <= 200) return 300
  if (length <= 500) return 400
  return 500
}

/**
 * Calculate optimal logo size based on QR code size for maximum scannability
 * Conservative sizing to ensure QR codes remain scannable
 */
export function getOptimalLogoSize(qrSize: number): number {
  if (qrSize <= 150) {
    // Small QR codes: 25% of size max, min 24px for visibility
    return Math.max(qrSize * 0.25, 24)
  } else if (qrSize <= 300) {
    // Medium QR codes: 20% of size max, min 40px, max 80px
    const calculatedSize = qrSize * 0.20
    return Math.max(Math.min(calculatedSize, 80), 40)
  } else {
    // Large QR codes: 18% of size max, min 60px, max 100px
    const calculatedSize = qrSize * 0.18
    return Math.max(Math.min(calculatedSize, 100), 60)
  }
}

/**
 * Generate QR code with custom branding (logo in center)
 */
export async function generateBrandedQRCode(
  text: string,
  options: BrandedQRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'H', // Use high error correction for logo overlay
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 2, // Smaller margin for logo overlay
    logoUrl,
    logoSize = getOptimalLogoSize(size), // Dynamic sizing based on QR code size
    logoBackgroundColor = '#FFFFFF',
    logoBorderColor = '#E5E7EB'
  } = options

  try {
    // Generate base QR code with high error correction
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: size,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      margin
    })

    // If no logo, return the base QR code
    if (!logoUrl) {
      return qrCodeDataUrl
    }

    // Create canvas for logo overlay
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Set canvas size
    canvas.width = size
    canvas.height = size

    // Load QR code image
    const qrImage = new Image()
    qrImage.crossOrigin = 'anonymous'
    
    await new Promise<void>((resolve, reject) => {
      qrImage.onload = () => {
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0, size, size)
        
        // Load and draw logo
        const logoImage = new Image()
        logoImage.crossOrigin = 'anonymous'
        
        logoImage.onload = () => {
          // Calculate logo position (center)
          const logoX = (size - logoSize) / 2
          const logoY = (size - logoSize) / 2
          const backdropSize = logoSize + 12 // 6px padding on each side

          // Draw white backdrop circle
          ctx.fillStyle = logoBackgroundColor
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.fill()

          // Draw border around backdrop
          ctx.strokeStyle = logoBorderColor
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.stroke()

          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
          
          resolve()
        }
        
        logoImage.onerror = () => {
          // If logo fails to load, just return the QR code without logo
          resolve()
        }
        
        logoImage.src = logoUrl
      }
      
      qrImage.onerror = () => {
        reject(new Error('Failed to load QR code image'))
      }
      
      qrImage.src = qrCodeDataUrl
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating branded QR code:', error)
    // Fallback to regular QR code if branding fails
    return generateQRCode(text, { size, errorCorrectionLevel, foregroundColor, backgroundColor, margin })
  }
}

/**
 * Generate branded QR code as PNG with logo overlay (server-side)
 */
export async function generateBrandedQRCodeServer(
  text: string,
  options: BrandedQRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'H', // Use high error correction for logo overlay
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 2, // Smaller margin for logo overlay
    logoUrl,
    logoSize = getOptimalLogoSize(size), // Dynamic sizing based on QR code size
    logoBackgroundColor = '#FFFFFF',
    logoBorderColor = '#E5E7EB'
  } = options

  try {
    // Generate base QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(text, {
      width: size,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      margin
    })

    // If no logo, return the base QR code as data URL
    if (!logoUrl) {
      return `data:image/png;base64,${qrCodeBuffer.toString('base64')}`
    }

    // For server-side, we'll use a simpler approach
    // Since we can't easily overlay images on the server without additional libraries,
    // we'll return the base QR code and let the client handle logo overlay
    // In a production environment, you might want to use a library like Sharp or Jimp
    
    return `data:image/png;base64,${qrCodeBuffer.toString('base64')}`
  } catch (error) {
    console.error('Error generating branded QR code (server):', error)
    // Fallback to regular QR code if branding fails
    return generateQRCode(text, { size, errorCorrectionLevel, foregroundColor, backgroundColor, margin })
  }
}

/**
 * Generate branded QR code as SVG (for server-side use)
 */
export async function generateBrandedQRCodeSVG(
  text: string,
  options: BrandedQRCodeOptions & { width?: number } = {}
): Promise<string> {
  const {
    width = 200,
    errorCorrectionLevel = 'H',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 2,
    logoUrl,
    logoSize = getOptimalLogoSize(width),
    logoBackgroundColor = '#FFFFFF',
    logoBorderColor = '#E5E7EB'
  } = options

  try {
    // Generate base SVG QR code
    const qrCodeSVG = await QRCode.toString(text, {
      type: 'svg',
      width,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      margin
    })

    // If no logo, return the base SVG
    if (!logoUrl) {
      return qrCodeSVG
    }

    // For SVG, we'll return the base QR code with a comment about logo overlay
    // In a real implementation, you'd need to parse the SVG and add logo elements
    // For now, we'll return the base SVG and handle logo overlay on the client side
    return qrCodeSVG
  } catch (error) {
    console.error('Error generating branded QR code SVG:', error)
    throw new Error('Failed to generate branded QR code SVG')
  }
}

/**
 * Get platform logo URL for social media QR codes
 */
export function getPlatformLogoUrl(platform: string): string | null {
  const platformLogos: Record<string, string> = {
    'instagram': '/platform-logos/instagram.png',
    'tiktok': '/platform-logos/tiktok.png',
    'twitter': '/platform-logos/x.png',
    'x': '/platform-logos/x.png',
    'facebook': '/platform-logos/facebook.png',
    'linkedin': '/platform-logos/linkedin.png',
    'youtube': '/platform-logos/youtube.png',
    'spotify': '/platform-logos/spotify.png',
    'apple_music': '/platform-logos/apple-music.png',
    'soundcloud': '/platform-logos/soundcloud.png',
    'github': '/platform-logos/github.png',
    'twitch': '/platform-logos/twitch.png',
    'kick': '/platform-logos/kick.png',
    'website': '/platform-logos/website.png'
  }

  return platformLogos[platform.toLowerCase()] || null
}

/**
 * Get QR code download filename
 */
export function getQRCodeFilename(title: string, format: 'PNG' | 'SVG' = 'PNG'): string {
  const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const timestamp = new Date().toISOString().split('T')[0]
  const extension = format.toLowerCase()
  
  return `qr_${sanitizedTitle}_${timestamp}.${extension}`
}

/**
 * Get QR code MIME type
 */
export function getQRCodeMimeType(format: 'PNG' | 'SVG'): string {
  switch (format) {
    case 'PNG':
      return 'image/png'
    case 'SVG':
      return 'image/svg+xml'
    default:
      return 'image/png'
  }
}
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
 * Generate QR code with custom branding (logo in center)
 */
export async function generateBrandedQRCode(
  text: string,
  options: QRCodeOptions & { logoUrl?: string } = {}
): Promise<string> {
  // For now, just generate a regular QR code
  // This could be enhanced to overlay a logo in the center
  const qrCode = await generateQRCode(text, options)
  
  // Future enhancement: Add logo overlay functionality
  // This would require canvas manipulation or image processing
  
  return qrCode
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
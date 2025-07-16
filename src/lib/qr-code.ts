import QRCode from 'qrcode'

export interface QRCodeOptions {
  size?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  foregroundColor?: string
  backgroundColor?: string
  margin?: number
}

export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 1,
  } = options

  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: size,
      height: size,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      margin,
    })

    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export async function generateQRCodeSVG(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    errorCorrectionLevel = 'M',
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    margin = 1,
  } = options

  try {
    const qrCodeSVG = await QRCode.toString(data, {
      type: 'svg',
      width: size,
      height: size,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      margin,
    })

    return qrCodeSVG
  } catch (error) {
    console.error('Error generating QR code SVG:', error)
    throw new Error('Failed to generate QR code SVG')
  }
}

export function getQRCodeUrl(shortCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/l/${shortCode}`
}
'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'

interface BrandedQRCodeProps {
  url: string
  size?: number
  logoUrl?: string
  logoSize?: number
  className?: string
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  foregroundColor?: string
  backgroundColor?: string
}

export function BrandedQRCode({ 
  url, 
  size = 200, 
  logoUrl,
  logoSize = 40,
  className = '',
  errorCorrection = 'H',
  foregroundColor = '#000000',
  backgroundColor = '#FFFFFF'
}: BrandedQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = size
        canvas.height = size

        // Generate QR code with higher error correction to account for logo overlay
        await QRCode.toCanvas(canvas, url, {
          width: size,
          margin: 2,
          errorCorrectionLevel: errorCorrection,
          color: {
            dark: foregroundColor,
            light: backgroundColor
          }
        })

        // If no logo provided, just use the QR code as is
        if (!logoUrl) {
          setQrDataUrl(canvas.toDataURL())
          return
        }

        // Load and draw logo - optimized sizing for better visual appearance
        const logo = document.createElement('img')
        logo.crossOrigin = 'anonymous'
        logo.onload = () => {
          // Check if this is a custom logo (not a well-known platform URL)
          const isCustomLogo = logoUrl && !logoUrl.includes('platform-logos') && !logoUrl.includes('cdn.jsdelivr.net')
          
          // Dynamic logo sizing based on QR code size for maximum visual impact
          // Reduce size for custom logos to improve scannability
          const sizeMultiplier = isCustomLogo ? 0.8 : 1.0 // 20% smaller for custom logos
          
          let maxLogoSize: number
          if (size <= 150) {
            // Small QR codes: 40% of size, min 32px
            maxLogoSize = Math.max(Math.min(logoSize, size * 0.40 * sizeMultiplier), 32)
          } else if (size <= 300) {
            // Medium QR codes: 35% of size, min 60px, max 140px
            maxLogoSize = Math.max(Math.min(logoSize, size * 0.35 * sizeMultiplier), 60)
            maxLogoSize = Math.min(maxLogoSize, 140 * sizeMultiplier)
          } else {
            // Large QR codes: 30% of size, min 90px, max 200px
            maxLogoSize = Math.max(Math.min(logoSize, size * 0.30 * sizeMultiplier), 90)
            maxLogoSize = Math.min(maxLogoSize, 200 * sizeMultiplier)
          }
          
          // Calculate actual logo dimensions maintaining aspect ratio
          const logoAspectRatio = logo.naturalWidth / logo.naturalHeight
          let logoWidth: number
          let logoHeight: number
          
          if (logoAspectRatio > 1) {
            // Wider than tall - constrain by width
            logoWidth = maxLogoSize
            logoHeight = maxLogoSize / logoAspectRatio
          } else {
            // Taller than wide or square - constrain by height
            logoHeight = maxLogoSize
            logoWidth = maxLogoSize * logoAspectRatio
          }
          
          const logoX = (size - logoWidth) / 2
          const logoY = (size - logoHeight) / 2
          const backdropSize = Math.max(logoWidth, logoHeight) + 12 // 6px padding on each side

          // Draw backdrop circle - use light gray for better contrast with custom logos
          ctx.fillStyle = isCustomLogo ? '#F3F4F6' : backgroundColor // Light gray for custom logos, white for platform logos
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.fill()

          // Draw border around backdrop
          ctx.strokeStyle = '#E5E7EB'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.stroke()

          // Draw logo maintaining aspect ratio
          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)

          // Convert to data URL for display
          setQrDataUrl(canvas.toDataURL())
        }
        logo.onerror = () => {
          console.error('Failed to load logo')
          // Just use the QR code without logo if logo fails to load
          setQrDataUrl(canvas.toDataURL())
        }
        logo.src = logoUrl

      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQRCode()
  }, [url, size, logoUrl, logoSize, errorCorrection, foregroundColor, backgroundColor])

  return (
    <div className={`inline-block ${className}`}>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
      {qrDataUrl && (
        <Image
          src={qrDataUrl}
          alt={`QR Code for ${url}`}
          width={size}
          height={size}
          className="w-full h-full object-contain touch-auto"
          style={{ pointerEvents: 'auto', userSelect: 'none' }}
          unoptimized
        />
      )}
    </div>
  )
}
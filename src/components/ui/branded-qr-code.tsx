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
          // Dynamic logo sizing based on QR code size for maximum visual impact
          let adjustedLogoSize: number
          if (size <= 150) {
            // Small QR codes: 40% of size, min 32px
            adjustedLogoSize = Math.max(Math.min(logoSize, size * 0.40), 32)
          } else if (size <= 300) {
            // Medium QR codes: 35% of size, min 60px, max 140px
            adjustedLogoSize = Math.max(Math.min(logoSize, size * 0.35), 60)
            adjustedLogoSize = Math.min(adjustedLogoSize, 140)
          } else {
            // Large QR codes: 30% of size, min 90px, max 200px
            adjustedLogoSize = Math.max(Math.min(logoSize, size * 0.30), 90)
            adjustedLogoSize = Math.min(adjustedLogoSize, 200)
          }
          
          const logoX = (size - adjustedLogoSize) / 2
          const logoY = (size - adjustedLogoSize) / 2
          const backdropSize = adjustedLogoSize + 12 // 6px padding on each side

          // Draw white backdrop circle
          ctx.fillStyle = backgroundColor
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.fill()

          // Draw border around backdrop
          ctx.strokeStyle = '#E5E7EB'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.stroke()

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, adjustedLogoSize, adjustedLogoSize)

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
          className="w-full h-full object-contain"
          unoptimized
        />
      )}
    </div>
  )
}
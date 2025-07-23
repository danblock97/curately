'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'

interface BrandedQRCodeProps {
  url: string
  size?: number
  logoSize?: number
  className?: string
}

export function BrandedQRCode({ 
  url, 
  size = 200, 
  logoSize = 40,
  className = '' 
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
          errorCorrectionLevel: 'H', // High error correction
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        // Load and draw logo - make it smaller to not interfere with QR scanning
        const logo = document.createElement('img')
        logo.crossOrigin = 'anonymous'
        logo.onload = () => {
          // Make logo smaller relative to QR code size for better scanning
          const adjustedLogoSize = Math.min(logoSize, size * 0.2) // Max 20% of QR code size
          const logoX = (size - adjustedLogoSize) / 2
          const logoY = (size - adjustedLogoSize) / 2
          const backdropSize = adjustedLogoSize + 6 // 3px padding on each side

          // Draw white backdrop circle
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, backdropSize / 2, 0, 2 * Math.PI)
          ctx.fill()

          // Draw gray border around backdrop
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
        logo.src = '/logo.png'

      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQRCode()
  }, [url, size, logoSize])

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
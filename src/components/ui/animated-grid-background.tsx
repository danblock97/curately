'use client'

import { useEffect, useRef } from 'react'

interface AnimatedGridBackgroundProps {
  className?: string
  children?: React.ReactNode
}

export function AnimatedGridBackground({ className = '', children }: AnimatedGridBackgroundProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const translateX = (scrollY * 0.1) % 40
      const translateY = (scrollY * 0.1) % 40
      
      grid.style.transform = `translate(${translateX}px, ${translateY}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* Animated Grid */}
      <div
        ref={gridRef}
        className="absolute inset-0 -top-40 -left-40 -right-40 -bottom-40"
        style={{
          backgroundColor: 'black',
          backgroundImage: `
            linear-gradient(rgba(128, 128, 128, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128, 128, 128, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 0',
          willChange: 'transform',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
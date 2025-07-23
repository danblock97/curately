declare global {
  interface Window {
    // Google Analytics
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    
    // Marketing pixels (currently unused, ready for future ads)
    // fbq: (...args: unknown[]) => void  // Facebook/Meta Pixel
    // twq: (...args: unknown[]) => void  // Twitter/X Pixel
  }
}

export {}
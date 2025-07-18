import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.supabase.co'
    const supabaseHost = new URL(supabaseUrl).host
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src 'self' ${supabaseUrl} wss://${supabaseHost}`,
              "frame-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;

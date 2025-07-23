import { Metadata } from 'next'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
}

export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = 'https://curately.co.uk'
  const defaultDescription = 'Create stunning, personalized link-in-bio pages with Curately. Boost your online presence with custom QR codes, deep links, and professional analytics.'
  
  return {
    title: config.title ? `${config.title} | Curately` : 'Curately - Your Professional Link-in-Bio Tool',
    description: config.description || defaultDescription,
    keywords: config.keywords || ['link in bio', 'bio link', 'link tree', 'social media links', 'QR codes'],
    robots: {
      index: !config.noindex,
      follow: !config.nofollow,
    },
    openGraph: {
      title: config.title || 'Curately - Your Professional Link-in-Bio Tool',
      description: config.description || defaultDescription,
      url: config.canonical || baseUrl,
      siteName: 'Curately',
      type: config.ogType || 'website',
      locale: 'en_GB',
      images: [
        {
          url: config.ogImage || '/logo-512x512.png',
          width: 512,
          height: 512,
          alt: 'Curately Logo',
        },
      ],
    },
    twitter: {
      card: config.twitterCard || 'summary_large_image',
      title: config.title || 'Curately - Your Professional Link-in-Bio Tool',
      description: config.description || defaultDescription,
      images: [config.ogImage || '/logo-512x512.png'],
      creator: '@curately',
      site: '@curately',
    },
    alternates: {
      canonical: config.canonical || baseUrl,
    },
  }
}

// Common SEO configurations for different page types
export const pageMetadata = {
  home: generateMetadata({
    title: 'Home',
    description: 'Create stunning, personalized link-in-bio pages with Curately. Perfect for creators, businesses, and influencers looking to boost their online presence.',
    keywords: ['link in bio', 'bio link', 'link tree', 'creator tools', 'influencer tools', 'business links'],
  }),
  
  pricing: generateMetadata({
    title: 'Pricing',
    description: 'Choose the perfect Curately plan for your needs. Free and Pro plans available with powerful features for creators and businesses.',
    keywords: ['pricing', 'plans', 'free', 'pro', 'subscription', 'link in bio pricing'],
    canonical: 'https://curately.co.uk/pricing',
  }),
  
  features: generateMetadata({
    title: 'Features',
    description: 'Discover all the powerful features Curately offers: custom QR codes, deep links, analytics, social media integration, and more.',
    keywords: ['features', 'QR codes', 'deep links', 'analytics', 'social media', 'customization'],
    canonical: 'https://curately.co.uk/features',
  }),
  
  contact: generateMetadata({
    title: 'Contact Us',
    description: 'Get in touch with the Curately team. We\'re here to help with support, questions, and feedback about our link-in-bio platform.',
    keywords: ['contact', 'support', 'help', 'customer service', 'feedback'],
    canonical: 'https://curately.co.uk/contact',
  }),
  
  privacy: generateMetadata({
    title: 'Privacy Policy',
    description: 'Learn how Curately protects your privacy and handles your data. Our comprehensive privacy policy explains our practices.',
    keywords: ['privacy', 'privacy policy', 'data protection', 'GDPR'],
    canonical: 'https://curately.co.uk/privacy',
    noindex: true,
  }),
  
  terms: generateMetadata({
    title: 'Terms of Service',
    description: 'Read Curately\'s terms of service and user agreement. Understand your rights and responsibilities when using our platform.',
    keywords: ['terms', 'terms of service', 'user agreement', 'legal'],
    canonical: 'https://curately.co.uk/terms',
    noindex: true,
  }),
  
  login: generateMetadata({
    title: 'Login',
    description: 'Login to your Curately account to manage your link-in-bio pages, view analytics, and customize your profile.',
    keywords: ['login', 'sign in', 'account', 'dashboard'],
    canonical: 'https://curately.co.uk/auth/login',
    noindex: true,
  }),
  
  signup: generateMetadata({
    title: 'Sign Up',
    description: 'Create your free Curately account and start building your professional link-in-bio page in minutes.',
    keywords: ['sign up', 'register', 'create account', 'get started'],
    canonical: 'https://curately.co.uk/auth/signup',
  }),
}

export function generatePageMetadata(pageType: keyof typeof pageMetadata): Metadata {
  return pageMetadata[pageType]
}

// Utility function to generate dynamic user page metadata
export function generateUserPageMetadata(username: string, displayName?: string, bio?: string): Metadata {
  const title = displayName || username
  const description = bio || `Check out ${title}'s link-in-bio page on Curately. Discover their latest content, social media links, and more.`
  
  return generateMetadata({
    title: `${title}'s Links`,
    description,
    canonical: `https://curately.co.uk/${username}`,
    keywords: ['profile', 'links', 'bio', username, title],
    ogType: 'profile',
  })
}
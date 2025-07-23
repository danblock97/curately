import Script from 'next/script'

interface BreadcrumbItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

interface BreadcrumbListData {
  '@context': string
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbItem[]
}

interface StructuredDataProps {
  type?: 'WebApplication' | 'Organization' | 'WebSite' | 'BreadcrumbList'
  data?: BreadcrumbListData
}

export function StructuredData({ type = 'WebApplication', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = 'https://curately.co.uk'
    
    switch (type) {
      case 'WebApplication':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Curately',
          url: baseUrl,
          description: 'Create stunning, personalized link-in-bio pages with Curately. Boost your online presence with custom QR codes, deep links, and professional analytics.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            validFrom: '2024-01-01'
          },
          featureList: [
            'Custom Link-in-Bio Pages',
            'QR Code Generation',
            'Deep Link Management',
            'Analytics & Insights',
            'Social Media Integration',
            'Custom Branding'
          ],
          screenshot: `${baseUrl}/hero-qr.png`,
          author: {
            '@type': 'Organization',
            name: 'Curately Team'
          },
          creator: {
            '@type': 'Organization',
            name: 'Curately'
          }
        }
      
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Curately',
          url: baseUrl,
          logo: `${baseUrl}/logo-512x512.png`,
          description: 'Professional link-in-bio tool for creators, businesses, and influencers.',
          foundingDate: '2024',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'hello@curately.co.uk',
            url: `${baseUrl}/contact`
          },
          sameAs: [
            'https://twitter.com/curately',
            'https://www.linkedin.com/company/curately'
          ],
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'GB'
          }
        }
      
      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Curately',
          url: baseUrl,
          description: 'Professional link-in-bio tool for creators, businesses, and influencers.',
          publisher: {
            '@type': 'Organization',
            name: 'Curately'
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }
      
      case 'BreadcrumbList':
        return data || {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: baseUrl
            }
          ]
        }
      
      default:
        return {}
    }
  }

  const structuredData = getStructuredData()

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}

// Convenience components for common structured data types
export function WebApplicationStructuredData() {
  return <StructuredData type="WebApplication" />
}

export function OrganizationStructuredData() {
  return <StructuredData type="Organization" />
}

export function WebSiteStructuredData() {
  return <StructuredData type="WebSite" />
}

export function BreadcrumbStructuredData({ breadcrumbs }: { breadcrumbs?: BreadcrumbListData }) {
  return <StructuredData type="BreadcrumbList" data={breadcrumbs} />
}
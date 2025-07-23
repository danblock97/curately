export async function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://curately.co.uk/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/settings/
Disallow: /auth/

# Allow public pages
Allow: /
Allow: /pricing
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /features

# Crawl delay
Crawl-delay: 1
`.trim()

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
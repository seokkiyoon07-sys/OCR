import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/backend/', '/admin/', '/_next/'],
    },
    sitemap: 'https://snar-ocr.com/sitemap.xml',
  }
}

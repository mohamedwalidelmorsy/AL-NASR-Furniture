import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/en/inquiry', '/ar/inquiry'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}

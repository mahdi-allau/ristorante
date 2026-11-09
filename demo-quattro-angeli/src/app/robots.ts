import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  // NOINDEX=1: copia di presentazione, nessun motore di ricerca deve indicizzarla
  if (process.env.NOINDEX === '1') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/gift-card/view', '/en/gift-card/view', '/booking/', '/en/booking/', '/unsubscribe/', '/en/unsubscribe/'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

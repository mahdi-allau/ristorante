import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';
import { href, locales } from '@/i18n/config';

const PAGES = ['/', '/gift-card', '/gift-card/condizioni', '/privacy', '/cookie', '/allergeni'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((p) =>
    locales.map((l) => ({
      url: SITE.url + href(l, p),
      lastModified: new Date(),
      changeFrequency: p === '/' ? ('weekly' as const) : ('yearly' as const),
      priority: p === '/' ? 1 : 0.3,
      alternates: {
        languages: { it: SITE.url + href('it', p), en: SITE.url + href('en', p) },
      },
    })),
  );
}

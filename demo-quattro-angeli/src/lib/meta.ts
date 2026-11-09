import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import { href, locales, type Locale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';

/** Metadati per pagina: canonical, hreflang (tutte le lingue + x-default), Open Graph. */
export function pageMeta(locale: Locale, path: string, title?: string): Metadata {
  const t = getDict(locale);
  const url = SITE.url + href(locale, path);
  return {
    title: title ? `${title} — ${SITE.name}` : t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, SITE.url + href(l, path)])),
        'x-default': SITE.url + href('it', path),
      },
    },
    openGraph: {
      images: [{ url: `${SITE.url}/api/og`, width: 1200, height: 630, alt: SITE.name }],
      type: 'website',
      url,
      siteName: SITE.name,
      title: title ? `${title} — ${SITE.name}` : t.meta.title,
      description: t.meta.description,
      locale: t.meta.ogLocale,
    },
    twitter: { card: 'summary_large_image', images: [`${SITE.url}/api/og`] },
  };
}

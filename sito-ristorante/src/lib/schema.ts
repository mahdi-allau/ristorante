import { SITE } from '@/content/site';
import type { Content } from '@/content/types';
import { COURSES } from '@/content/types';
import { href, type Locale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function restaurantSchema(locale: Locale, content: Content) {
  const t = getDict(locale);
  const base = SITE.url + href(locale, '/');
  const opening = content.hours.week.flatMap((ranges, d) =>
    ranges.map((r) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_NAMES[d],
      opens: r.from,
      closes: r.to,
    })),
  );
  const sections = COURSES.map((c) => ({
    '@type': 'MenuSection',
    name: t.menu.courses[c],
    hasMenuItem: content.menu.dishes
      .filter((d) => d.available && d.course === c)
      .map((d) => ({
        '@type': 'MenuItem',
        name: d.name[locale] || d.name.it,
        description: d.desc[locale] || d.desc.it,
        offers: { '@type': 'Offer', price: d.price, priceCurrency: 'EUR' },
        ...(d.vegetarian ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
      })),
  })).filter((s) => s.hasMenuItem.length);

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE.url}/#restaurant`,
    name: SITE.name,
    description: t.meta.description,
    url: base,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: SITE.priceRange,
    servesCuisine: SITE.cuisines,
    acceptsReservations: 'True',
    image: [`${SITE.url}/api/og`],
    address: {
      '@type': 'PostalAddress', streetAddress: SITE.street, addressLocality: SITE.city,
      postalCode: SITE.zip, addressRegion: SITE.region, addressCountry: 'IT',
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: opening,
    hasMenu: { '@type': 'Menu', name: content.menu.title[locale] || content.menu.title.it, inLanguage: locale, hasMenuSection: sections },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

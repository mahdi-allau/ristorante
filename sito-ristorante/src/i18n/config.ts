export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'it';

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

/** Italiano senza prefisso (/), inglese con /en. */
export function href(locale: Locale, path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  return p === '/' ? '/en' : `/en${p}`;
}

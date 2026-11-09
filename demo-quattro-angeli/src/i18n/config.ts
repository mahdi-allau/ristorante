// Ordine di presentazione nel selettore: italiano, francese, arabo, inglese, tedesco, spagnolo.
export const locales = ['it', 'fr', 'ar', 'en', 'de', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'it';

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

/** Lingue scritte da destra a sinistra. */
export const rtlLocales: readonly Locale[] = ['ar'];
export const dirOf = (locale: Locale): 'rtl' | 'ltr' => (rtlLocales.includes(locale) ? 'rtl' : 'ltr');

/** Nome della lingua scritto nella lingua stessa, e codice breve. */
export const localeNames: Record<Locale, { native: string; short: string }> = {
  it: { native: 'Italiano', short: 'IT' },
  fr: { native: 'Français', short: 'FR' },
  ar: { native: 'العربية', short: 'AR' },
  en: { native: 'English', short: 'EN' },
  de: { native: 'Deutsch', short: 'DE' },
  es: { native: 'Español', short: 'ES' },
};

/** Codice per Intl (date e numeri). Per l'arabo cifre occidentali, per leggere orari e prezzi senza ambiguità. */
export const intlLocale: Record<Locale, string> = {
  it: 'it-IT', fr: 'fr-FR', ar: 'ar-u-nu-latn', en: 'en-GB', de: 'de-DE', es: 'es-ES',
};

/** Italiano senza prefisso (/), le altre lingue con il proprio prefisso (/en, /fr, /ar, /de, /es). */
export function href(locale: Locale, path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return p;
  return p === '/' ? `/${locale}` : `/${locale}${p}`;
}

/** Toglie dal percorso l'eventuale prefisso di lingua (/en, /fr, ...). */
export function stripLocale(pathname: string): string {
  const re = new RegExp(`^/(${locales.join('|')})(?=/|$)`);
  return pathname.replace(re, '') || '/';
}

/** Lingua indicata dal prefisso del percorso, italiano se manca. */
export function localeFromPath(pathname: string): Locale {
  const m = pathname.match(new RegExp(`^/(${locales.join('|')})(?=/|$)`));
  return m && isLocale(m[1]) ? m[1] : defaultLocale;
}

/** Prezzo in euro nel formato della lingua: 12 € (it, fr, de, es) o €12 (en, ar). */
export function fmtPrice(n: number, locale: Locale): string {
  const digits = Number.isInteger(n) ? 0 : 2;
  const v = n.toLocaleString(intlLocale[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return locale === 'en' || locale === 'ar' ? `€${v}` : `${v} €`;
}

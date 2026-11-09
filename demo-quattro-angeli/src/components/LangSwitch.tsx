'use client';

import { usePathname } from 'next/navigation';
import { href, localeNames, locales, stripLocale, type Locale } from '@/i18n/config';
import Flag from './Flags';

/**
 * Selettore di lingua con bandiere: resta sulla stessa pagina. Italiano senza prefisso, le altre lingue sotto /en, /fr, /ar, /de, /es.
 * Nelle pagine prerenderizzate il percorso interno è /it/... mentre nel browser è /...: si toglie ogni prefisso e si ricostruisce,
 * così HTML del server e client coincidono e i link sono sempre corretti.
 */
export default function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const rest = stripLocale(pathname);
  return (
    <details className="langsel">
      <summary aria-label={`${localeNames[locale].native}`}>
        <Flag locale={locale} />
        <span className="langsel-code">{localeNames[locale].short}</span>
        <span className="langsel-caret" aria-hidden="true" />
      </summary>
      <ul className="langsel-list">
        {locales.map((l) => (
          <li key={l}>
            <a href={href(l, rest)} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined}>
              <Flag locale={l} size={22} />
              <span>{localeNames[l].native}</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

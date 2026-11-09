'use client';

import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/config';

/**
 * Cambia lingua restando sulla stessa pagina (IT senza prefisso, EN sotto /en).
 * Nelle pagine prerenderizzate il percorso interno è /it/... mentre nel browser è /...: si normalizzano
 * entrambi i casi, così HTML del server e client coincidono e i link sono sempre corretti.
 */
export default function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const rest = pathname.replace(/^\/(en|it)(?=\/|$)/, '') || '/';
  const it = rest;
  const en = rest === '/' ? '/en' : `/en${rest}`;
  return (
    <span className="lang">
      <a href={it} hrefLang="it" lang="it" aria-current={locale === 'it' ? 'true' : undefined}>IT</a>
      {' · '}
      <a href={en} hrefLang="en" lang="en" aria-current={locale === 'en' ? 'true' : undefined}>EN</a>
    </span>
  );
}

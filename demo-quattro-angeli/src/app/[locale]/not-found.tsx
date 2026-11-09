import { dictionaries } from '@/i18n/dictionaries';
import NotFoundView from '@/components/NotFoundView';
import { locales, type Locale } from '@/i18n/config';

// Nessun uso di headers()/cookies(): leggere la richiesta qui renderebbe dinamico l'intero albero [locale].
// La lingua si sceglie nel browser (e in SSR) dal percorso, con un componente client.
export default function NotFound() {
  return <NotFoundView strings={Object.fromEntries(locales.map((l) => [l, dictionaries[l].notFound])) as Record<Locale, (typeof dictionaries)['it']['notFound']>} />;
}

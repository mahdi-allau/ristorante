import { dictionaries } from '@/i18n/dictionaries';
import NotFoundView from '@/components/NotFoundView';

// Nessun uso di headers()/cookies(): leggere la richiesta qui renderebbe dinamico l'intero albero [locale].
// La lingua si sceglie nel browser (e in SSR) dal percorso, con un componente client.
export default function NotFound() {
  return <NotFoundView strings={{ it: dictionaries.it.notFound, en: dictionaries.en.notFound }} />;
}

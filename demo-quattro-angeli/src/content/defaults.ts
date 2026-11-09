import { DEFAULT_DISHES } from './menu';
import type { Content, Range } from './types';

// Orari come riportati nella home di iquattroangeli.it: martedì–domenica 12:00–15:00 e 19:00–23:00, lunedì chiuso.
// TODO-CLIENTE: la pagina Contatti del sito attuale riporta orari diversi (probabile testo-modello): confermare.
const service: Range[] = [
  { from: '12:00', to: '15:00' },
  { from: '19:00', to: '23:00' },
];

/** Contenuto iniziale: usato finché il ristoratore non salva dal pannello. */
export const DEFAULT_CONTENT: Content = {
  menu: { title: { it: 'Il nostro menu', en: 'Our menu' }, dishes: DEFAULT_DISHES },
  hours: {
    // dom, lun, mar, mer, gio, ven, sab
    week: [service, [], service, service, service, service, service],
    closures: [],
  },
  notice: { active: false, text: { it: '', en: '' } },
};

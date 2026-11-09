import { DEFAULT_DISHES } from './menu';
import type { Content, Range } from './types';

const service: Range[] = [
  { from: '12:30', to: '14:30' },
  { from: '19:30', to: '23:00' },
];

/** Contenuto iniziale: usato finché il ristoratore non salva dal pannello. */
export const DEFAULT_CONTENT: Content = {
  menu: { title: { it: 'Autunno / Inverno', en: 'Autumn / Winter' }, dishes: DEFAULT_DISHES },
  hours: {
    // dom, lun, mar, mer, gio, ven, sab
    week: [service, [], service, service, service, service, service],
    closures: [],
  },
  notice: { active: false, text: { it: '', en: '' } },
};

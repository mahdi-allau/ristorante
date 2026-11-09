// Dati del locale (NAP). Fonte: pagine pubbliche di iquattroangeli.it e scheda pubblica del locale (Bing/TripAdvisor).
// Tutto ciò che è marcato TODO-CLIENTE va confermato con il titolare prima della pubblicazione.
// Menu, orari, chiusure e avviso NON sono qui: si modificano dal pannello /admin (vedi content-store).

export const SITE = {
  name: 'Osteria I Quattro Angeli',
  legalName: '[ragione sociale — TODO-CLIENTE]',
  vat: '[P.IVA — TODO-CLIENTE]',
  rea: '[REA — TODO-CLIENTE]',
  // TODO-CLIENTE: il sito attuale riporta "Piazza Castello, 22" nella pagina contatti, la scheda pubblica (Bing/TripAdvisor)
  // "Largo Castello 10": va confermato quale sia l'indirizzo corretto e uniformato ovunque (Google, TripAdvisor, social).
  street: 'Largo Castello 10',
  zip: '44121',
  city: 'Ferrara',
  region: 'FE',
  phone: '0532 211 869',
  phoneHref: '+390532211869',
  email: 'osteriai4angeli@libero.it',
  // Coordinate indicative (zona del Castello Estense): TODO-CLIENTE verificare sul punto esatto
  geo: { lat: 44.8376, lng: 11.6191 },
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/$/, ''),
  sameAs: [] as string[], // TODO-CLIENTE: Instagram, Facebook, TripAdvisor, Google Maps
  priceRange: '€€',
  cuisines: ['Italiana', 'Ferrarese', 'Emiliana'],
} as const;

export const TZ = 'Europe/Rome';
export const MAX_GUESTS = 8;
export const BOOKING_HORIZON_DAYS = 90;

/** Promemoria: inviato quando mancano al massimo 24 ore, ma non se ne mancano meno di 2. */
export const REMINDER_LEAD_HOURS = 24;
export const REMINDER_MIN_HOURS = 2;
/** Oltre questo limite (ore prima) il cliente non può più annullare online e deve telefonare. */
export const CANCEL_CUTOFF_HOURS = 2;

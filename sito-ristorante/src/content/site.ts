// Dati fissi del locale (NAP). Valori di fantasia: sostituire con quelli del cliente (TODO-CLIENTE).
// Menu, orari, chiusure e avviso NON sono qui: si modificano dal pannello /admin (vedi content-store).

export const SITE = {
  name: 'Osteria Lumina',
  legalName: 'Lumina S.r.l.',
  vat: '00000000000',
  rea: 'MI-0000000',
  street: 'Via Esempio 12',
  zip: '20144',
  city: 'Milano',
  region: 'MI',
  phone: '+39 02 0000 0000',
  phoneHref: '+390200000000',
  email: 'prenotazioni@esempio.it',
  geo: { lat: 45.4515, lng: 9.1736 },
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  sameAs: [] as string[], // Instagram, Facebook, TripAdvisor, Google Maps…
  priceRange: '€€€',
  cuisines: ['Italiana', 'Pesce', 'Stagionale'],
} as const;

export const TZ = 'Europe/Rome';
export const MAX_GUESTS = 8;
export const BOOKING_HORIZON_DAYS = 90;

/** Promemoria: inviato quando mancano al massimo 24 ore, ma non se ne mancano meno di 2. */
export const REMINDER_LEAD_HOURS = 24;
export const REMINDER_MIN_HOURS = 2;
/** Oltre questo limite (ore prima) il cliente non può più annullare online e deve telefonare. */
export const CANCEL_CUTOFF_HOURS = 2;

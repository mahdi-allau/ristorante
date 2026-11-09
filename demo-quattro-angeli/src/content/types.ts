// Modello dei contenuti gestibili dal ristoratore (menu, orari, chiusure, avviso).
import type { Locale } from '@/i18n/config';

export const ALLERGEN_KEYS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'sesame', 'milk', 'nuts', 'celery', 'mustard', 'sulphites',
] as const;
export type AllergenKey = (typeof ALLERGEN_KEYS)[number];

export const COURSES = ['antipasti', 'primi', 'secondi', 'contorni', 'dolci'] as const;
export type Course = (typeof COURSES)[number];

/** Testo in italiano e inglese (modificabili dal pannello) più le altre lingue, tradotte a parte. */
export interface Bilingual { it: string; en: string; fr?: string; ar?: string; de?: string; es?: string }

/** Nome di un piatto: nella lingua scelta se c'è, altrimenti in italiano (sono i nomi dei piatti). */
export function dishName(t: Bilingual, locale: Locale): string {
  return (locale === 'en' ? t.en : t[locale]) || t.it;
}
/** Descrizione o altro testo: nella lingua scelta, altrimenti in inglese (per le lingue straniere) o italiano. */
export function localized(t: Bilingual, locale: Locale): string {
  return t[locale] || (locale === 'it' ? t.it : t.en || t.it);
}

export interface Dish {
  id: string;
  course: Course;
  price: number;
  allergens: AllergenKey[];
  vegetarian: boolean;
  /** piatto della sezione "senza glutine" (serviti sigillati, linea AIM) */
  glutenFree: boolean;
  /** sottotitolo di sezione per i primi: "della tradizione" o "la tradizione… e oltre" */
  group?: 'tradizione' | 'oltre';
  /** false = nascosto dal menu (piatto finito o fuori stagione) senza cancellarlo */
  available: boolean;
  name: Bilingual;
  desc: Bilingual;
}

/** Fascia di apertura, formato "HH:MM" (ora di Roma). */
export interface Range { from: string; to: string }

/** Chiusura straordinaria (ferie, evento privato): date YYYY-MM-DD incluse. */
export interface Closure { from: string; to: string; note: string }

export interface Content {
  menu: { title: Bilingual; dishes: Dish[] };
  hours: {
    /** indice 0 = domenica … 6 = sabato; array vuoto = giorno di chiusura */
    week: Range[][];
    closures: Closure[];
  };
  notice: { active: boolean; text: Bilingual };
}

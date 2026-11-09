// Modello dei contenuti gestibili dal ristoratore (menu, orari, chiusure, avviso).

export const ALLERGEN_KEYS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'sesame', 'milk', 'nuts', 'celery', 'mustard', 'sulphites',
] as const;
export type AllergenKey = (typeof ALLERGEN_KEYS)[number];

export const COURSES = ['antipasti', 'primi', 'secondi', 'dolci'] as const;
export type Course = (typeof COURSES)[number];

export interface Bilingual { it: string; en: string }

export interface Dish {
  id: string;
  course: Course;
  price: number;
  allergens: AllergenKey[];
  vegetarian: boolean;
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

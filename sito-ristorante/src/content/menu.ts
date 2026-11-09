// Menu iniziale (valori predefiniti): una volta in uso, il menu si modifica dal pannello /admin.
// Piatti e prezzi di fantasia.
import type { Dish } from './types';

export type { AllergenKey, Course, Dish } from './types';

const RAW_DISHES: Array<Omit<Dish, 'available' | 'vegetarian'> & { vegetarian?: boolean }> = [
  { id: 'gambero', course: 'antipasti', price: 24, allergens: ['crustaceans'],
    name: { it: 'Crudo di gambero rosso', en: 'Raw red prawn' },
    desc: { it: 'Agrumi, finocchietto selvatico, olio al limone.', en: 'Citrus, wild fennel, lemon oil.' } },
  { id: 'burrata', course: 'antipasti', price: 18, allergens: ['milk', 'gluten'], vegetarian: true,
    name: { it: 'Burrata e pomodoro confit', en: 'Burrata and confit tomato' },
    desc: { it: 'Basilico, pane al lievito madre tostato.', en: 'Basil, toasted sourdough bread.' } },
  { id: 'tartare', course: 'antipasti', price: 22, allergens: ['eggs', 'mustard'],
    name: { it: 'Tartare di manzo piemontese', en: 'Piedmontese beef tartare' },
    desc: { it: 'Tuorlo marinato, capperi, senape antica.', en: 'Marinated yolk, capers, old-style mustard.' } },
  { id: 'tagliolini', course: 'primi', price: 22, allergens: ['gluten', 'eggs', 'fish'],
    name: { it: 'Tagliolini al limone e bottarga', en: 'Lemon and bottarga tagliolini' },
    desc: { it: "Pasta all'uovo tirata a mano, scorza di limone.", en: 'Hand-rolled egg pasta, lemon zest.' } },
  { id: 'risotto', course: 'primi', price: 24, allergens: ['milk', 'celery'],
    name: { it: 'Risotto allo zafferano e midollo', en: 'Saffron and bone marrow risotto' },
    desc: { it: 'Carnaroli invecchiato, mantecato al burro nocciola.', en: 'Aged Carnaroli, finished with brown butter.' } },
  { id: 'ravioli', course: 'primi', price: 20, allergens: ['gluten', 'eggs', 'milk', 'nuts'], vegetarian: true,
    name: { it: 'Ravioli di ricotta e menta', en: 'Ricotta and mint ravioli' },
    desc: { it: 'Burro nocciola, nocciole del Piemonte tostate.', en: 'Brown butter, toasted Piedmont hazelnuts.' } },
  { id: 'gnocchi', course: 'primi', price: 21, allergens: ['gluten', 'eggs', 'celery', 'milk'],
    name: { it: 'Gnocchi con ragù bianco di coniglio', en: 'Gnocchi with white rabbit ragù' },
    desc: { it: 'Patate di montagna, rosmarino, Parmigiano 30 mesi.', en: 'Mountain potatoes, rosemary, 30-month Parmigiano.' } },
  { id: 'rombo', course: 'secondi', price: 34, allergens: ['fish', 'milk', 'sulphites'],
    name: { it: 'Rombo arrosto', en: 'Roasted turbot' },
    desc: { it: 'Beurre blanc, asparagi, erba cipollina.', en: 'Beurre blanc, asparagus, chives.' } },
  { id: 'guancia', course: 'secondi', price: 30, allergens: ['milk', 'celery', 'sulphites'],
    name: { it: 'Guancia di vitello brasata', en: 'Braised veal cheek' },
    desc: { it: 'Purè di patate al burro, jus di cottura al Barolo.', en: 'Buttery mashed potatoes, Barolo cooking jus.' } },
  { id: 'cavolfiore', course: 'secondi', price: 22, allergens: ['sesame', 'nuts'], vegetarian: true,
    name: { it: 'Cavolfiore arrosto', en: 'Roasted cauliflower' },
    desc: { it: 'Salsa tahini, nocciole, uvetta, limone.', en: 'Tahini sauce, hazelnuts, raisins, lemon.' } },
  { id: 'tiramisu', course: 'dolci', price: 11, allergens: ['gluten', 'eggs', 'milk'], vegetarian: true,
    name: { it: 'Tiramisù scomposto', en: 'Deconstructed tiramisù' },
    desc: { it: 'Savoiardo, crema al mascarpone, caffè di specialità.', en: 'Ladyfinger, mascarpone cream, specialty coffee.' } },
  { id: 'pannacotta', course: 'dolci', price: 10, allergens: ['milk'], vegetarian: true,
    name: { it: 'Panna cotta ai frutti rossi', en: 'Panna cotta with red berries' },
    desc: { it: 'Vaniglia del Madagascar, coulis di lampone.', en: 'Madagascar vanilla, raspberry coulis.' } },
  { id: 'cioccolato', course: 'dolci', price: 12, allergens: ['milk', 'nuts'], vegetarian: true,
    name: { it: 'Cioccolato fondente, sale e olio', en: 'Dark chocolate, salt and olive oil' },
    desc: { it: 'Cremoso 70%, olio extravergine, sale in fiocchi.', en: '70% cremoso, extra virgin olive oil, flaky salt.' } },
];

export const DEFAULT_DISHES: Dish[] = RAW_DISHES.map((d) => ({ ...d, vegetarian: !!d.vegetarian, available: true }));

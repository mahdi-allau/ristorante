import { z } from 'zod';
import { ALLERGEN_KEYS, COURSES, type Content } from './types';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Orario non valido (HH:MM)');
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida');
const text = (max: number) => z.string().trim().max(max);
const bilingual = (max: number) => z.object({ it: text(max), en: text(max) });

const range = z
  .object({ from: time, to: time })
  .refine((r) => r.from < r.to, { message: "L'orario di chiusura deve essere dopo l'apertura" });

const dish = z.object({
  id: z.string().min(1).max(40),
  course: z.enum(COURSES),
  price: z.number().min(0).max(999),
  allergens: z.array(z.enum(ALLERGEN_KEYS)).max(ALLERGEN_KEYS.length),
  vegetarian: z.boolean(),
  available: z.boolean(),
  name: z.object({ it: text(90).min(1, 'Nome italiano obbligatorio'), en: text(90) }),
  desc: bilingual(240),
});

export const contentSchema = z
  .object({
    menu: z.object({
      title: z.object({ it: text(60).min(1), en: text(60) }),
      dishes: z.array(dish).max(150),
    }),
    hours: z.object({
      week: z.array(z.array(range).max(4)).length(7),
      closures: z
        .array(z.object({ from: ymd, to: ymd, note: text(120) }).refine((c) => c.from <= c.to, { message: 'La data di fine è prima di quella di inizio' }))
        .max(60),
    }),
    notice: z.object({ active: z.boolean(), text: bilingual(200) }),
  })
  .superRefine((c, ctx) => {
    // Le fasce dello stesso giorno non devono sovrapporsi
    c.hours.week.forEach((day, i) => {
      const sorted = [...day].sort((a, b) => a.from.localeCompare(b.from));
      for (let k = 1; k < sorted.length; k++) {
        if (sorted[k].from < sorted[k - 1].to) {
          ctx.addIssue({ code: 'custom', path: ['hours', 'week', i], message: 'Fasce orarie sovrapposte' });
        }
      }
    });
    const ids = new Set<string>();
    c.menu.dishes.forEach((d, i) => {
      if (ids.has(d.id)) ctx.addIssue({ code: 'custom', path: ['menu', 'dishes', i, 'id'], message: 'ID duplicato' });
      ids.add(d.id);
    });
  }) satisfies z.ZodType<Content>;

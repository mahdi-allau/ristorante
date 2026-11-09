'use client';

import { useState } from 'react';
import { dishName, localized, type Course, type Dish } from '@/content/types';
import { fmtPrice, type Locale } from '@/i18n/config';
import type { Dict } from '@/i18n/dictionaries';

type Filter = 'all' | 'gf' | Course;
const ORDER: Filter[] = ['all', 'antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'gf'];

export default function MenuSection({ locale, t, dishes }: { locale: Locale; t: Dict['menu']; dishes: Dish[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const regular = dishes.filter((d) => !d.glutenFree);
  const gluten = dishes.filter((d) => d.glutenFree);

  // Mostra solo i filtri che hanno almeno un piatto
  const filters = ORDER.filter((f) => (f === 'all' ? true : f === 'gf' ? gluten.length > 0 : regular.some((d) => d.course === f)));
  // Il menu senza glutine è una sezione a sé: non si mescola con quello principale (hanno piatti omonimi)
  const list = filter === 'gf' ? gluten : filter === 'all' ? regular : regular.filter((d) => d.course === filter);
  const hasAllergens = dishes.some((d) => d.allergens.length > 0);
  const label = (d: Dish) => `${t.courses[d.course]}${d.group ? ` · ${t.groups[d.group]}` : ''}`;

  return (
    <>
      <div className="filters reveal" role="group" aria-label={t.filtersLabel}>
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip${f === 'gf' ? ' chip-veg' : ''}${filter === f ? ' is-active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {t.filters[f]}
          </button>
        ))}
      </div>

      {filter === 'gf' && <p className="sub">{t.gfNote}</p>}

      <ul className="dishes">
        {list.map((d) => (
          <li key={d.id} className="dish">
            <span className="cat">{label(d)}</span>
            <h3>{dishName(d.name, locale)}</h3>
            <span className="price">{fmtPrice(d.price, locale)}</span>
            {localized(d.desc, locale) && <p>{localized(d.desc, locale)}</p>}
            {(d.allergens.length > 0 || d.glutenFree) && (
              <div className="al">
                {d.allergens.map((a) => (
                  <span key={a} title={t.allergens[a].l} aria-label={`${t.contains} ${t.allergens[a].l}`}>
                    {t.allergens[a].a}
                  </span>
                ))}
                {d.glutenFree && filter !== 'gf' && <span className="v" title={t.gfBadge}>{t.gfBadge}</span>}
              </div>
            )}
          </li>
        ))}
      </ul>

      {hasAllergens && (
        <div className="legend reveal" aria-label={t.legendLabel}>
          {Object.values(t.allergens).map((a) => (
            <div key={a.a}><span>{a.a}</span>{a.l}</div>
          ))}
        </div>
      )}
    </>
  );
}

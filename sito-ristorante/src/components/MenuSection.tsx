'use client';

import { useState } from 'react';
import type { Course, Dish } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { Dict } from '@/i18n/dictionaries';

type Filter = 'all' | 'veg' | Course;

export default function MenuSection({ locale, t, dishes }: { locale: Locale; t: Dict['menu']; dishes: Dish[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  // Mostra solo i filtri che hanno almeno un piatto
  const FILTERS: Filter[] = (['all', 'antipasti', 'primi', 'secondi', 'dolci', 'veg'] as Filter[]).filter(
    (f) => f === 'all' || dishes.some((d) => (f === 'veg' ? d.vegetarian : d.course === f)),
  );
  const list = dishes.filter((d) => filter === 'all' || (filter === 'veg' ? d.vegetarian : d.course === filter));
  const fmtPrice = (n: number) => (locale === 'it' ? `${n} €` : `€${n}`);

  return (
    <>
      <div className="filters reveal" role="group" aria-label={t.filtersLabel}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip${f === 'veg' ? ' chip-veg' : ''}${filter === f ? ' is-active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {t.filters[f]}
          </button>
        ))}
      </div>

      <ul className="dishes">
        {list.map((d) => (
          <li key={d.id} className="dish">
            <span className="cat">{t.courses[d.course]}</span>
            <h3>{d.name[locale] || d.name.it}</h3>
            <span className="price">{fmtPrice(d.price)}</span>
            <p>{d.desc[locale] || d.desc.it}</p>
            <div className="al">
              {d.allergens.map((a) => (
                <span key={a} title={t.allergens[a].l} aria-label={`${t.contains} ${t.allergens[a].l}`}>
                  {t.allergens[a].a}
                </span>
              ))}
              {d.vegetarian && <span className="v" title={t.vegLabel} aria-label={t.vegLabel}>{t.vegShort}</span>}
            </div>
          </li>
        ))}
      </ul>

      <div className="legend reveal" aria-label={t.legendLabel}>
        {Object.values(t.allergens).map((a) => (
          <div key={a.a}><span>{a.a}</span>{a.l}</div>
        ))}
        <div><span className="v">{t.vegShort}</span>{t.vegLabel}</div>
      </div>
    </>
  );
}

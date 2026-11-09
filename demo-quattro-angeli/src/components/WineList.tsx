import { WINE_LIST } from '@/content/wines';
import { fmtPrice, type Locale } from '@/i18n/config';
import type { Dict } from '@/i18n/dictionaries';

const fmt = fmtPrice;

export default function WineList({ locale, t }: { locale: Locale; t: Dict['wines'] }) {
  return (
    <div className="wines">
      {WINE_LIST.map((sec) => (
        <section key={sec.id} className="wine-sec reveal">
          <h3>{sec.title[locale] || sec.title.en}</h3>
          <ul>
            {sec.wines.map((w) => (
              <li key={w.name}>
                <div>
                  <strong>{w.name}</strong>
                  <span className="muted">{w.detail}</span>
                </div>
                <div className="wine-price">
                  {w.glass !== null && <span>{t.glass} {fmt(w.glass, locale)}</span>}
                  <span>{t.bottle} {fmt(w.bottle, locale)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

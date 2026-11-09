import type { Locale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { giftLegal } from '@/i18n/gift';
import { getContent } from '@/lib/content-store';
import { Footer } from './SiteChrome';

export type LegalKey = 'privacy' | 'cookie' | 'allergens' | 'giftcard';

export default async function LegalPage({ locale, doc }: { locale: Locale; doc: LegalKey }) {
  const t = getDict(locale);
  const dishes = doc === 'allergens' ? (await getContent()).menu.dishes.filter((d) => d.available) : [];
  const d = doc === 'giftcard' ? giftLegal[locale] : t.legal[doc];
  return (
    <>
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <h1>{d.title}</h1>
          <p>{d.intro}</p>
          <p className="warn">{t.legalNote}</p>
          {d.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p) => <p key={p}>{p}</p>)}
            </section>
          ))}

          {doc === 'allergens' && (
            <table className="allergen-table">
              <thead><tr><th scope="col">{t.menu.eyebrow}</th><th scope="col">{t.menu.contains}</th></tr></thead>
              <tbody>
                {dishes.map((x) => (
                  <tr key={x.id}>
                    <td>{x.name[locale] || x.name.it}</td>
                    <td>{x.allergens.map((a) => t.menu.allergens[a].l).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}

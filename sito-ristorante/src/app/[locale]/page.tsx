import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE } from '@/content/site';
import { href, isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { giftDict } from '@/i18n/gift';
import { getContent } from '@/lib/content-store';
import { pageMeta } from '@/lib/meta';
import BookingForm from '@/components/BookingForm';
import ContactMap from '@/components/ContactMap';
import HoursTable from '@/components/HoursTable';
import MenuSection from '@/components/MenuSection';
import OpenStatus from '@/components/OpenStatus';
import { Footer } from '@/components/SiteChrome';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMeta(locale, '/');
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const content = await getContent();
  const dishes = content.menu.dishes.filter((d) => d.available);
  const notice = content.notice.active ? content.notice.text[locale] || content.notice.text.it : '';
  const gallery = ['ph-a', 'ph-b', 'ph-c', 'ph-d'];

  return (
    <>
      <main id="main">
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-inner">
            {notice && <p className="notice" role="status">{notice}</p>}
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.h1a}<br /><em>{t.hero.h1b}</em></h1>
            <p className="lead">{t.hero.lead}</p>
            <div className="hero-cta">
              <a className="btn" href="#prenota" data-track="click_prenota">{t.hero.cta}</a>
              <a className="link" href="#menu">{t.hero.menuLink}</a>
            </div>
            <OpenStatus t={t.status} hours={content.hours} />
          </div>
        </section>

        {/* PILASTRI */}
        <section className="section pillars" id="locale">
          <div className="wrap">
            <p className="eyebrow reveal">{t.pillars.eyebrow}</p>
            <h2 className="reveal">{t.pillars.title}</h2>
            <div className="grid3">
              {t.pillars.items.map((p) => (
                <article className="pillar reveal" key={p.n}>
                  <span className="num">{p.n}</span>
                  <h3>{p.t}</h3>
                  <p>{p.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERIA (segnaposto: foto professionali nel progetto reale) */}
        <section className="section gallery" aria-label={t.gallery.label}>
          <div className="wrap wide">
            <div className="gallery-grid">
              {gallery.map((c, i) => (
                <figure className={`ph ${c} reveal`} key={c}><figcaption>{t.gallery.captions[i]}</figcaption></figure>
              ))}
            </div>
            <p className="note reveal">{t.gallery.note}</p>
          </div>
        </section>

        {/* MENU */}
        <section className="section menu" id="menu">
          <div className="wrap">
            <p className="eyebrow reveal">{t.menu.eyebrow}</p>
            <h2 className="reveal">{content.menu.title[locale] || content.menu.title.it}</h2>
            <p className="sub reveal">{t.menu.sub}</p>
            <MenuSection locale={locale} t={t.menu} dishes={dishes} />
            <p className="note reveal">{t.menu.note}</p>
          </div>
        </section>

        {/* RECENSIONI (esempio: nel progetto reale solo recensioni vere) */}
        <section className="section quotes" aria-label={t.quote.label}>
          <div className="wrap">
            <blockquote className="reveal">
              <p>{t.quote.text}</p>
              <footer>{t.quote.source}</footer>
            </blockquote>
            <p className="rating reveal"><span className="stars" aria-hidden="true">★★★★★</span> <b>4,8</b> / 5 · <span className="muted">{t.quote.rating}</span></p>
          </div>
        </section>

        {/* EVENTI */}
        <section className="section events" id="eventi">
          <div className="wrap">
            <p className="eyebrow reveal">{t.events.eyebrow}</p>
            <h2 className="reveal">{t.events.title}</h2>
            <div className="grid3">
              {t.events.items.map((e) => (
                <article className="card reveal" key={e.t}><h3>{e.t}</h3><p>{e.p}</p></article>
              ))}
            </div>
            <p className="center reveal">
              <a className="link" href="#contatti">{t.events.cta}</a>
              {'  ·  '}
              <Link className="link" href={href(locale, '/gift-card')}>{giftDict[locale].eventsCta}</Link>
            </p>
          </div>
        </section>

        {/* PRENOTA */}
        <section className="section booking" id="prenota">
          <div className="wrap narrow">
            <p className="eyebrow reveal">{t.booking.eyebrow}</p>
            <h2 className="reveal">{t.booking.title}</h2>
            <BookingForm locale={locale} t={t.booking} />
          </div>
        </section>

        {/* CONTATTI */}
        <section className="section contacts" id="contatti">
          <div className="wrap">
            <div className="contacts-grid">
              <div className="reveal">
                <p className="eyebrow">{t.contacts.eyebrow}</p>
                <h2>{t.contacts.title}</h2>
                <address>
                  {SITE.street}, {SITE.zip} {SITE.city}<br />
                  <span className="muted">{t.contacts.near}</span>
                </address>
                <p>
                  <a className="link" href={`tel:${SITE.phoneHref}`} data-track="click_telefono">{SITE.phone}</a><br />
                  <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </p>
                <p className="note">{t.contacts.extra}</p>
              </div>
              <div className="reveal">
                <h3>{t.contacts.hours}</h3>
                <HoursTable
                  locale={locale} hours={content.hours} days={t.contacts.days} closed={t.contacts.closed}
                  closuresTitle={t.contacts.closuresTitle} closureRange={t.contacts.closureRange}
                />
                <ContactMap t={t.contacts} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}

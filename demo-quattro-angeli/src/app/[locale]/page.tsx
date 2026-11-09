import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE } from '@/content/site';
import { localized } from '@/content/types';
import { href, isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { giftDict } from '@/i18n/gift';
import { getContent } from '@/lib/content-store';
import { pageMeta } from '@/lib/meta';
import BookingForm from '@/components/BookingForm';
import ContactMap from '@/components/ContactMap';
import HoursTable from '@/components/HoursTable';
import LazyVideo from '@/components/LazyVideo';
import MenuSection from '@/components/MenuSection';
import WineList from '@/components/WineList';
import OpenStatus from '@/components/OpenStatus';
import { Footer } from '@/components/SiteChrome';
import bancone from '@/assets/photos/bancone.webp';
import botte from '@/assets/photos/botte.webp';
import castello from '@/assets/photos/castello.webp';
import candele from '@/assets/photos/candele.webp';
import dehorsSera from '@/assets/photos/dehors-sera.webp';
import festa from '@/assets/photos/festa.webp';
import sala from '@/assets/photos/sala.webp';
import salumi from '@/assets/photos/salumi.webp';
import scala from '@/assets/photos/scala.webp';
import tavoloRose from '@/assets/photos/tavolo-rose.webp';

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
  const notice = content.notice.active ? localized(content.notice.text, locale) : '';
  const gallery = [
    // L'ordine segue le didascalie e i testi alternativi del dizionario: la sala, l'angolo con la botte
    { cls: 'ph-a', img: sala, pos: '50% 55%', sizes: '(max-width: 860px) 100vw, 64vw' },
    { cls: 'ph-b', img: botte, pos: '45% 55%', sizes: '(max-width: 860px) 100vw, 34vw' },
  ];
  // Seconda fila (specchiata): l'angolo dei salumi e il bancone
  const wide2 = [
    { cls: 'ph-w1', img: salumi, pos: '50% 40%', sizes: '(max-width: 860px) 100vw, 34vw' },
    { cls: 'ph-w2', img: bancone, pos: '40% 55%', sizes: '(max-width: 860px) 100vw, 64vw' },
  ];
  // Foto verticali: tavolo per due, candele, dehors la sera, scala, festa (stesso ordine di didascalie e testi alternativi)
  const portraits = [
    { cls: 'ph-p1', img: tavoloRose, pos: '50% 55%' },
    { cls: 'ph-p2', img: candele, pos: '50% 60%' },
    { cls: 'ph-p3', img: dehorsSera, pos: '50% 60%' },
    { cls: 'ph-p4', img: scala, pos: '50% 60%' },
    { cls: 'ph-p5', img: festa, pos: '50% 50%' },
  ];
  const portraitSizes = '(max-width: 860px) 50vw, 20vw';

  return (
    <>
      <main id="main">
        {/* HERO */}
        <section className="hero">
          <Image className="hero-photo" src={castello} alt="" fill priority quality={90} placeholder="blur" sizes="100vw" />
          <div className="hero-scrim" aria-hidden="true" />
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

        {/* IL PIATTO SIMBOLO: video 3D illustrativo */}
        <section className="section dish-feature" aria-labelledby="dish-title">
          <div className="wrap wide dish-grid">
            <div className="dish-copy">
              <p className="eyebrow reveal">{t.dish.eyebrow}</p>
              <h2 id="dish-title" className="reveal">{t.dish.title}</h2>
              <p className="sub reveal">{t.dish.text}</p>
              <a className="link reveal" href="#menu">{t.dish.cta}</a>
            </div>
            <figure className="dish-media reveal">
              <LazyVideo base="/video/dish" poster="/video/dish-poster.jpg" />
              <figcaption>{t.dish.note}</figcaption>
            </figure>
          </div>
        </section>

        {/* GALLERIA: foto degli spazi (esempio, da sostituire con lo shooting professionale) */}
        <section className="section gallery" aria-label={t.gallery.label}>
          <div className="wrap wide">
            <div className="gallery-grid">
              {gallery.map((g, i) => (
                <figure className={`ph ${g.cls} reveal`} key={g.cls}>
                  <Image
                    src={g.img} alt={t.gallery.alts[i]} fill sizes={g.sizes} placeholder="blur"
                    style={{ objectFit: 'cover', objectPosition: g.pos }}
                  />
                  <figcaption>{t.gallery.captions[i]}</figcaption>
                </figure>
              ))}
            </div>
            <div className="gallery-grid row2">
              {wide2.map((g, k) => (
                <figure className={`ph ${g.cls} reveal`} key={g.cls}>
                  <Image
                    src={g.img} alt={t.gallery.alts[gallery.length + k]} fill sizes={g.sizes} placeholder="blur"
                    style={{ objectFit: 'cover', objectPosition: g.pos }}
                  />
                  <figcaption>{t.gallery.captions[gallery.length + k]}</figcaption>
                </figure>
              ))}
            </div>
            <div className="gallery-grid portrait">
              {portraits.map((g, j) => (
                <figure className={`ph ${g.cls} reveal`} key={g.cls}>
                  <Image
                    src={g.img} alt={t.gallery.alts[gallery.length + wide2.length + j]} fill sizes={portraitSizes} placeholder="blur"
                    style={{ objectFit: 'cover', objectPosition: g.pos }}
                  />
                  <figcaption>{t.gallery.captions[gallery.length + wide2.length + j]}</figcaption>
                </figure>
              ))}
            </div>
            <p className="note reveal">{t.gallery.note}</p>
          </div>
        </section>

        {/* MENU */}
        <section className="section menu" id="menu">
          <div className="wrap">
            <p className="eyebrow reveal">{t.menu.eyebrow}</p>
            <h2 className="reveal">{content.menu.title[locale] || (locale === 'it' || locale === 'en' ? localized(content.menu.title, locale) : t.menu.title)}</h2>
            <p className="sub reveal">{t.menu.sub}</p>
            <MenuSection locale={locale} t={t.menu} dishes={dishes} />
            <p className="note reveal">{t.menu.note}</p>
          </div>
        </section>

        {/* CANTINA */}
        <section className="section wine" id="cantina">
          <div className="wrap">
            <p className="eyebrow reveal">{t.wines.eyebrow}</p>
            <h2 className="reveal">{t.wines.title}</h2>
            <p className="sub reveal">{t.wines.sub}</p>
            <WineList locale={locale} t={t.wines} />
          </div>
        </section>

        {/* RECENSIONI (esempio: nel progetto reale solo recensioni vere) */}
        <section className="section quotes" aria-label={t.quote.label}>
          <div className="wrap">
            <blockquote className="reveal">
              <p>{t.quote.text}</p>
              <footer>{t.quote.source}</footer>
            </blockquote>
            <p className="rating reveal"><span className="stars" aria-hidden="true">{t.quote.stars}</span> <b>{t.quote.rating}</b></p>
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

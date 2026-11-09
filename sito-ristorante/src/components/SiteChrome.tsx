import Link from 'next/link';
import { SITE } from '@/content/site';
import { href, type Locale } from '@/i18n/config';
import type { Dict } from '@/i18n/dictionaries';
import { giftDict } from '@/i18n/gift';
import LangSwitch from './LangSwitch';
import ManageCookies from './ManageCookies';

export function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const home = href(locale, '/');
  return (
    <header className="header">
      <Link className="logo" href={home} aria-label={`${SITE.name}`}>Osteria <em>Lumina</em></Link>
      <nav className="nav" aria-label={t.nav.label}>
        <a href={`${home}#menu`}>{t.nav.menu}</a>
        <a href={`${home}#locale`}>{t.nav.place}</a>
        <a href={`${home}#eventi`}>{t.nav.events}</a>
        <a href={`${home}#contatti`}>{t.nav.contact}</a>
      </nav>
      <div className="header-right">
        <LangSwitch locale={locale} />
        <a className="btn btn-sm" href={`${home}#prenota`} data-track="click_prenota">{t.nav.book}</a>
      </div>
    </header>
  );
}

export function MobileBar({ locale, t }: { locale: Locale; t: Dict }) {
  const home = href(locale, '/');
  return (
    <nav className="mbar" aria-label={t.footer.quick}>
      <a href={`tel:${SITE.phoneHref}`} data-track="click_telefono">{t.contacts.call}</a>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${SITE.street}, ${SITE.zip} ${SITE.city}`)}`}
         target="_blank" rel="noopener" data-track="click_mappa">{t.contacts.directions}</a>
      <a className="mbar-cta" href={`${home}#prenota`} data-track="click_prenota">{t.nav.book}</a>
    </nav>
  );
}

export function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <p className="logo">Osteria <em>Lumina</em></p>
        <p className="muted">{SITE.legalName} · P.IVA {SITE.vat} · REA {SITE.rea} · {SITE.street}, {SITE.zip} {SITE.city}</p>
        <div className="links">
          <Link href={href(locale, '/privacy')}>{t.footer.privacy}</Link>
          <Link href={href(locale, '/cookie')}>{t.footer.cookie}</Link>
          <Link href={href(locale, '/allergeni')}>{t.footer.allergens}</Link>
          <Link href={href(locale, '/gift-card')}>{giftDict[locale].footerLink}</Link>
          <ManageCookies label={t.footer.manage} />
        </div>
        <p className="muted small">{t.footer.demo}</p>
      </div>
    </footer>
  );
}

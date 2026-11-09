import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Noto_Naskh_Arabic } from 'next/font/google';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE } from '@/content/site';
import { dirOf, isLocale, locales } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { getContent } from '@/lib/content-store';
import { restaurantSchema } from '@/lib/schema';
import Analytics from '@/components/Analytics';
import CookieBanner from '@/components/CookieBanner';
import PageEffects from '@/components/PageEffects';
import { Header, MobileBar } from '@/components/SiteChrome';
import '../globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'],
  variable: '--font-serif', display: 'swap',
});
const sans = Inter({
  subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans', display: 'swap',
});

// Carattere per l'arabo: Cormorant e Inter non hanno le lettere arabe (si carica solo sulle pagine che lo usano)
const arabic = Noto_Naskh_Arabic({
  subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--font-ar', display: 'swap',
});

export const viewport: Viewport = { themeColor: '#120A0B', width: 'device-width', initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const content = await getContent();

  return (
    <html lang={locale} dir={dirOf(locale)} className={`${serif.variable} ${sans.variable} ${arabic.variable}`}>
      <body>
        <noscript><style>{'.reveal{opacity:1!important;transform:none!important}'}</style></noscript>
        <a className="skip" href="#main">{t.skip}</a>
        <div className="demo-ribbon">
          <span className="rb-long">{t.ribbon}</span>
          <span className="rb-short">{t.ribbon.split('·')[0].trim()}</span>
          {locale === 'it' && <Link className="rb-cta" href="/proposta">Per il titolare →</Link>}
        </div>
        <Header locale={locale} t={t} />
        {children}
        <MobileBar locale={locale} t={t} />
        <CookieBanner locale={locale} t={t.cookie} />
        <Analytics />
        <PageEffects />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema(locale, content)).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  );
}

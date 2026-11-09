import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { SITE } from '@/content/site';
import { isLocale, locales } from '@/i18n/config';
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

export const viewport: Viewport = { themeColor: '#0E0D0B', width: 'device-width', initialScale: 1 };

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
    <html lang={locale} className={`${serif.variable} ${sans.variable}`}>
      <body>
        <noscript><style>{'.reveal{opacity:1!important;transform:none!important}'}</style></noscript>
        <a className="skip" href="#main">{t.skip}</a>
        <div className="demo-ribbon">{t.ribbon}</div>
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

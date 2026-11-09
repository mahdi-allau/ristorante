import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { href, isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { giftDict } from '@/i18n/gift';
import { Footer } from '@/components/SiteChrome';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Thanks({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = giftDict[locale];
  return (
    <>
      <main id="main" className="nf">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.thanksTitle}</h1>
          <p>{t.thanksText}</p>
          <Link className="btn" href={href(locale, '/')}>{t.thanksCta}</Link>
        </div>
      </main>
      <Footer locale={locale} t={getDict(locale)} />
    </>
  );
}

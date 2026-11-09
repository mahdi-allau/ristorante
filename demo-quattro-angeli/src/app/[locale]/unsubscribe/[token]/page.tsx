import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { manageDict } from '@/i18n/manage';
import UnsubscribeButton from '@/components/UnsubscribeButton';
import { Footer } from '@/components/SiteChrome';

type Props = { params: Promise<{ locale: string; token: string }> };

// Aprire la pagina non cambia nulla: serve il clic sul pulsante (antivirus e anteprime aprono i link delle email)
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default async function Unsubscribe({ params }: Props) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const t = manageDict[locale].unsub;
  return (
    <>
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <h1>{t.title}</h1>
          <p>{t.text}</p>
          <UnsubscribeButton token={token} t={t} />
        </div>
      </main>
      <Footer locale={locale} t={getDict(locale)} />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/content/site';
import { isLocale } from '@/i18n/config';
import { fmt } from '@/i18n/dictionaries';
import { giftDict } from '@/i18n/gift';
import { GIFT_MAX_EUR, GIFT_MIN_EUR } from '@/lib/gift-store';
import { pageMeta } from '@/lib/meta';
import { isCheckoutAvailable, isDemoCheckout } from '@/lib/stripe';
import GiftCardForm from '@/components/GiftCardForm';
import { Footer } from '@/components/SiteChrome';
import { getDict } from '@/i18n/dictionaries';

type Props = { params: Promise<{ locale: string }> };

// Dipende da variabili d'ambiente di runtime (Stripe configurato o no): niente rendering statico
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = giftDict[locale];
  return { ...pageMeta(locale, '/gift-card', t.meta.title), description: t.meta.description };
}

export default async function GiftCardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = giftDict[locale];

  return (
    <>
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="sub">{t.lead}</p>
          {isCheckoutAvailable() ? (
            <GiftCardForm locale={locale} t={t} min={GIFT_MIN_EUR} max={GIFT_MAX_EUR} demo={isDemoCheckout()} />
          ) : (
            <p className="warn">{fmt(t.unavailable, { email: SITE.email })}</p>
          )}
        </div>
      </main>
      <Footer locale={locale} t={getDict(locale)} />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE } from '@/content/site';
import { intlLocale, isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { giftDict } from '@/i18n/gift';
import { getByCode } from '@/lib/gift-store';
import PrintButton from '@/components/PrintButton';
import { Footer } from '@/components/SiteChrome';

type Props = { params: Promise<{ locale: string; code: string }> };

// Il codice funziona da "chiave": pagina mai indicizzata e mai in cache
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default async function GiftCardView({ params }: Props) {
  const { locale, code } = await params;
  if (!isLocale(locale)) notFound();
  const t = giftDict[locale];
  const card = await getByCode(decodeURIComponent(code));
  if (!card) notFound();

  const fmtEur = (c: number) => new Intl.NumberFormat(intlLocale[locale], { style: 'currency', currency: 'EUR' }).format(c / 100);
  const fmtDate = (iso: string) => new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: 'long' }).format(new Date(iso));
  const expired = card.expiresAt ? new Date(card.expiresAt) < new Date() : false;
  const usable = card.status === 'active' && !expired;
  const notice = card.status === 'pending' ? t.view.pending : card.status === 'void' ? t.view.inactive : expired ? t.view.expired : '';

  return (
    <>
      <main id="main" className="section legal gc-page">
        <div className="wrap narrow">
          <article className={`gc-card${usable ? '' : ' off'}`} aria-label="Gift card">
            {card.demo && <span className="gc-demo">{t.view.demo}</span>}
            <p className="eyebrow">{SITE.name}</p>
            <p className="gc-amount">{fmtEur(usable ? card.balance : card.amount)}</p>
            <p className="gc-sub">{usable && card.balance !== card.amount ? `${t.view.balance} · ${t.view.amount} ${fmtEur(card.amount)}` : t.view.amount}</p>
            <p className="gc-code" aria-label={t.view.code}>{card.code}</p>
            {card.recipientName && <p className="gc-line">{t.view.for} <b>{card.recipientName}</b></p>}
            {card.message && <p className="gc-msg">«{card.message}»</p>}
            <p className="gc-line">{t.view.from} <b>{card.buyerName}</b></p>
            {card.expiresAt && <p className="gc-line muted">{t.view.validUntil} {fmtDate(card.expiresAt)}</p>}
          </article>

          {notice && <p className="warn">{notice}</p>}
          <p className="sub">{t.view.how}</p>
          <div className="gc-actions"><PrintButton label={t.view.print} /></div>
        </div>
      </main>
      <Footer locale={locale} t={getDict(locale)} />
    </>
  );
}

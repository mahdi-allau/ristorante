import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CANCEL_CUTOFF_HOURS, SITE } from '@/content/site';
import { isLocale } from '@/i18n/config';
import { fmt, getDict } from '@/i18n/dictionaries';
import { manageDict } from '@/i18n/manage';
import { getByToken } from '@/lib/booking-store';
import { formatWhen } from '@/lib/email';
import { romeToDate } from '@/lib/hours';
import ManageBooking from '@/components/ManageBooking';
import { Footer } from '@/components/SiteChrome';

type Props = { params: Promise<{ locale: string; token: string }> };

// Pagina personale raggiungibile solo dal link ricevuto via email: mai in cache né indicizzata
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default async function BookingManage({ params }: Props) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const t = manageDict[locale];
  const booking = await getByToken(token);

  if (!booking) {
    return (
      <>
        <main id="main" className="nf"><div>
          <p className="eyebrow">404</p><h1>{t.notFound.title}</h1><p>{t.notFound.text}</p>
          <a className="btn" href={`tel:${SITE.phoneHref}`}>{t.call}</a>
        </div></main>
        <Footer locale={locale} t={getDict(locale)} />
      </>
    );
  }

  const msToStart = romeToDate(booking.date, booking.time).getTime() - Date.now();
  const state =
    booking.status === 'cancelled' ? 'cancelled'
    : msToStart <= 0 || booking.status !== 'confirmed' ? 'past'
    : msToStart < CANCEL_CUTOFF_HOURS * 3_600_000 ? 'late'
    : booking.guestConfirmedAt ? 'confirmed'
    : 'active';

  return (
    <>
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <div className="manage-card">
            <p className="manage-when">{formatWhen(booking.date, booking.time, locale)}</p>
            <p>{fmt(booking.guests === 1 ? t.guests[0] : t.guests[1], { n: booking.guests })} · {booking.name}</p>
            <p className="muted">{t.address}: {SITE.name}, {SITE.street}, {SITE.zip} {SITE.city}</p>
          </div>
          <ManageBooking token={token} t={t} state={state} cutoffHours={CANCEL_CUTOFF_HOURS} />
        </div>
      </main>
      <Footer locale={locale} t={getDict(locale)} />
    </>
  );
}

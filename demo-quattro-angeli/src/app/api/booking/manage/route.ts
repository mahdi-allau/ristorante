import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CANCEL_CUTOFF_HOURS } from '@/content/site';
import { cancel, getByToken, guestConfirm } from '@/lib/booking-store';
import { sendOwnerBookingUpdate } from '@/lib/email';
import { romeToDate } from '@/lib/hours';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{20,40}$/),
  action: z.enum(['confirm', 'cancel']),
});

/** Le azioni passano da POST (mai da GET): gli antivirus/anteprime delle email aprono i link e non devono annullare nulla. */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`manage:${ip}`, 30, 10 * 60 * 1000)) return NextResponse.json({ error: 'rate' }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { token, action } = parsed.data;

  try {
    const booking = await getByToken(token);
    if (!booking) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const msToStart = romeToDate(booking.date, booking.time).getTime() - Date.now();
    if (msToStart <= 0) return NextResponse.json({ error: 'past' }, { status: 409 });

    if (action === 'confirm') {
      if (booking.status !== 'confirmed') return NextResponse.json({ error: 'cancelled' }, { status: 409 });
      const wasConfirmed = !!booking.guestConfirmedAt;
      const updated = await guestConfirm(token);
      if (!wasConfirmed && updated) await sendOwnerBookingUpdate(updated, 'confirmed');
      return NextResponse.json({ ok: true, booking: updated });
    }

    // annullamento: già annullata = ok (idempotente); oltre il limite si deve telefonare
    if (booking.status === 'cancelled') return NextResponse.json({ ok: true, booking });
    if (booking.status !== 'confirmed') return NextResponse.json({ error: 'invalid' }, { status: 409 });
    if (msToStart < CANCEL_CUTOFF_HOURS * 3_600_000) return NextResponse.json({ error: 'too_late' }, { status: 409 });
    const updated = await cancel(token);
    if (updated) await sendOwnerBookingUpdate(updated, 'cancelled');
    return NextResponse.json({ ok: true, booking: updated });
  } catch (e) {
    console.error('manage booking error', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

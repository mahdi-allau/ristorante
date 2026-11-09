import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { runReminders } from '@/lib/reminders';
import { runReviewRequests } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const given = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handle(req: Request) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'disabled' }, { status: 503 });
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    // I due compiti sono indipendenti: un errore nei promemoria non deve bloccare le richieste di recensione
    const [reminders, reviews] = await Promise.allSettled([runReminders(), runReviewRequests()]);
    if (reminders.status === 'rejected') console.error('reminders error', reminders.reason);
    if (reviews.status === 'rejected') console.error('review requests error', reviews.reason);
    if (reminders.status === 'rejected' && reviews.status === 'rejected') {
      return NextResponse.json({ error: 'server' }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      ...(reminders.status === 'fulfilled' ? reminders.value : { remindersError: true }),
      reviews: reviews.status === 'fulfilled' ? reviews.value : { error: true },
    });
  } catch (e) {
    console.error('cron error', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

// GET per i cron di Vercel (inviano Authorization: Bearer CRON_SECRET), POST per gli altri scheduler
export const GET = handle;
export const POST = handle;

import { NextResponse } from 'next/server';
import { unsubscribeReviews } from '@/lib/booking-store';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const TOKEN = /^[A-Za-z0-9_-]{20,40}$/;

/**
 * Disiscrizione dalle richieste di recensione.
 *  - Dalla pagina: POST JSON { token }.
 *  - "One-click" dei client email (header List-Unsubscribe-Post): POST con il token nell'URL (?token=…).
 * Solo POST: aprire un link non deve mai disiscrivere (antivirus e anteprime aprono i link delle email).
 */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`unsub:${ip}`, 30, 10 * 60 * 1000)) return NextResponse.json({ error: 'rate' }, { status: 429 });

  let token = new URL(req.url).searchParams.get('token') ?? '';
  if (!token && req.headers.get('content-type')?.includes('application/json')) {
    try { token = String(((await req.json()) as { token?: unknown }).token ?? ''); } catch { /* corpo non valido */ }
  }
  if (!TOKEN.test(token)) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    const found = await unsubscribeReviews(token);
    return found ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'not_found' }, { status: 404 });
  } catch (e) {
    console.error('unsubscribe error', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

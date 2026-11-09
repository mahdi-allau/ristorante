import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MAX_GUESTS } from '@/content/site';
import { createBooking, getAvailability, isBookableDate } from '@/lib/availability';
import { sendBookingEmails } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.coerce.number().int().min(1).max(MAX_GUESTS),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30).regex(/^[+\d][\d\s().-]+$/),
  email: z.string().trim().email().max(120),
  notes: z.string().trim().max(500).optional().default(''),
  privacy: z.literal(true),
  marketing: z.boolean().optional().default(false),
  reviewOptIn: z.boolean().optional().default(false),
  locale: z.enum(['it', 'en']).default('it'),
  website: z.string().max(0).optional(), // honeypot: i bot lo compilano
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`booking:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { website: _hp, privacy: _p, ...data } = parsed.data;

  if (!isBookableDate(data.date)) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    // Lo slot deve esistere ed essere ancora prenotabile (non ci si fida del client)
    const av = await getAvailability(data.date, data.guests);
    const slot = av.slots.find((s) => s.time === data.time);
    if (av.closed || !slot) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    if (!slot.available) return NextResponse.json({ error: 'full' }, { status: 409 });

    const result = await createBooking(data);
    if (result.status === 'full') return NextResponse.json({ error: 'full' }, { status: 409 });

    if (result.stored) await sendBookingEmails({ ...data, token: result.token });
    return NextResponse.json({ ok: true, demo: !result.stored });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

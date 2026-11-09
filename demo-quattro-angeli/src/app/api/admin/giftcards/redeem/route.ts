import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthedRequest } from '@/lib/admin-auth';
import { redeem } from '@/lib/gift-store';

export const dynamic = 'force-dynamic';

const schema = z.object({
  code: z.string().trim().min(8).max(20),
  amount: z.number().positive().max(10_000), // in euro, anche decimali (es. 37.5)
  note: z.string().trim().max(120).optional().default(''),
});

export async function POST(req: Request) {
  if (!isAuthedRequest(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'invalid' }, { status: 415 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const cents = Math.round(parsed.data.amount * 100);
  try {
    const res = await redeem(parsed.data.code, cents, parsed.data.note);
    if (!res.ok) return NextResponse.json({ error: res.reason }, { status: res.reason === 'not_found' ? 404 : 409 });
    return NextResponse.json({ ok: true, card: res.card });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

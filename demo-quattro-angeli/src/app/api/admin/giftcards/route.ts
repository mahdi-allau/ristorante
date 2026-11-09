import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/admin-auth';
import { getByCode, list } from '@/lib/gift-store';

export const dynamic = 'force-dynamic';

/** GET /api/admin/giftcards            → ultime carte vendute
 *  GET /api/admin/giftcards?code=XXXX  → una carta (per il riscatto in sala) */
export async function GET(req: Request) {
  if (!isAuthedRequest(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const code = new URL(req.url).searchParams.get('code');
  try {
    if (code) {
      const card = await getByCode(code);
      if (!card || card.status === 'pending') return NextResponse.json({ error: 'not_found' }, { status: 404 });
      return NextResponse.json({ card });
    }
    return NextResponse.json({ cards: await list(50) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

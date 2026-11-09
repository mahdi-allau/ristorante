import { NextResponse } from 'next/server';
import { MAX_GUESTS } from '@/content/site';
import { getAvailability, isBookableDate } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? '';
  const guests = Number(searchParams.get('guests') ?? 2);

  if (!isBookableDate(date) || !Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  try {
    const data = await getAvailability(date, guests);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

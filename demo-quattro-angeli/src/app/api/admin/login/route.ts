import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, checkPassword, createSessionToken, isAdminConfigured } from '@/lib/admin-auth';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isAdminConfigured()) return NextResponse.json({ error: 'disabled' }, { status: 503 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`admin-login:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate' }, { status: 429 });
  }

  let password = '';
  try { password = String((await req.json()).password ?? ''); } catch { /* corpo non valido */ }

  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // rallenta i tentativi
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

  const { token, maxAgeSec } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: maxAgeSec,
  });
  return res;
}

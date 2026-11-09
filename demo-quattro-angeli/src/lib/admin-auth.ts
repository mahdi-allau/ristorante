import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE = 'qa_admin';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 ore

/** Il pannello è attivo solo se password e segreto di firma sono configurati (e il segreto è abbastanza lungo). */
export function isAdminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD && (process.env.ADMIN_SECRET?.length ?? 0) >= 24;
}

const sign = (payload: string) =>
  createHmac('sha256', process.env.ADMIN_SECRET ?? '').update(payload).digest('hex');

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  // Confronto tra hash di pari lunghezza: niente fuga di informazioni sulla lunghezza
  const h = (s: string) => createHmac('sha256', 'pw').update(s).digest('hex');
  return pw.length > 0 && safeEqual(h(input), h(pw));
}

export function createSessionToken(): { token: string; maxAgeSec: number } {
  const exp = Date.now() + SESSION_MS;
  return { token: `${exp}.${sign(String(exp))}`, maxAgeSec: SESSION_MS / 1000 };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !isAdminConfigured()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

/** Legge il cookie di sessione da una Request (per le route API). */
export function isAuthedRequest(req: Request): boolean {
  const cookie = req.headers.get('cookie') ?? '';
  const m = cookie.split(/;\s*/).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  return verifySessionToken(m ? decodeURIComponent(m.slice(ADMIN_COOKIE.length + 1)) : null);
}

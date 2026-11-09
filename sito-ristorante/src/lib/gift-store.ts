import 'server-only';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { getAdmin } from './supabase';

export const GIFT_MIN_EUR = Number(process.env.GIFT_MIN_EUR ?? 20);
export const GIFT_MAX_EUR = Number(process.env.GIFT_MAX_EUR ?? 500);
export const GIFT_VALID_MONTHS = 24; // da far validare legalmente (vedi condizioni)

export type GiftStatus = 'pending' | 'active' | 'void';

export interface Redemption { at: string; amount: number; note: string }

export interface GiftCard {
  code: string;
  status: GiftStatus;
  /** importi in centesimi di euro */
  amount: number;
  balance: number;
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
  locale: 'it' | 'en';
  stripeSessionId: string | null;
  demo: boolean;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  redemptions: Redemption[];
}

export type NewGiftCard = Pick<GiftCard, 'amount' | 'buyerName' | 'buyerEmail' | 'recipientName' | 'recipientEmail' | 'message' | 'locale' | 'demo'>;

// Alfabeto senza caratteri ambigui (niente 0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCode(): string {
  const bytes = randomBytes(12);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

export const normalizeCode = (raw: string): string => {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8, 12)}` : raw.toUpperCase().trim();
};

function expiryFrom(paidAt: Date): string {
  const d = new Date(paidAt);
  d.setMonth(d.getMonth() + GIFT_VALID_MONTHS);
  return d.toISOString();
}

/* ===================== Archivio su file (sviluppo / server con disco scrivibile) ===================== */
const FILE = path.join(process.cwd(), 'data', 'gift-cards.json');
let chain: Promise<unknown> = Promise.resolve();

/** Serializza le modifiche al file: in un solo processo evita sovrascritture concorrenti. */
function withFile<T>(fn: (cards: GiftCard[]) => T | Promise<T>, write = false): Promise<T> {
  const run = chain.then(async () => {
    let cards: GiftCard[] = [];
    try { cards = (JSON.parse(await fs.readFile(FILE, 'utf8')) as { cards: GiftCard[] }).cards; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
    const out = await fn(cards);
    if (write) {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      const tmp = `${FILE}.tmp`;
      await fs.writeFile(tmp, JSON.stringify({ cards }, null, 2), 'utf8');
      await fs.rename(tmp, FILE);
    }
    return out;
  });
  chain = run.catch(() => undefined);
  return run;
}

/* ===================== Supabase: mappatura righe ⇄ GiftCard ===================== */
type Row = {
  code: string; status: GiftStatus; amount: number; balance: number; buyer_name: string; buyer_email: string;
  recipient_name: string; recipient_email: string; message: string; locale: 'it' | 'en';
  stripe_session_id: string | null; demo: boolean; created_at: string; paid_at: string | null; expires_at: string | null;
  gift_card_redemptions?: Array<{ created_at: string; amount: number; note: string }>;
};
const fromRow = (r: Row): GiftCard => ({
  code: r.code, status: r.status, amount: r.amount, balance: r.balance, buyerName: r.buyer_name, buyerEmail: r.buyer_email,
  recipientName: r.recipient_name, recipientEmail: r.recipient_email, message: r.message, locale: r.locale,
  stripeSessionId: r.stripe_session_id, demo: r.demo, createdAt: r.created_at, paidAt: r.paid_at, expiresAt: r.expires_at,
  redemptions: (r.gift_card_redemptions ?? []).map((x) => ({ at: x.created_at, amount: x.amount, note: x.note })),
});
const SELECT = '*, gift_card_redemptions(created_at, amount, note)';

/* ===================== API dell'archivio ===================== */

/** Crea una carta in attesa di pagamento (non utilizzabile finché Stripe non conferma). */
export async function createPending(input: NewGiftCard): Promise<GiftCard> {
  const card: GiftCard = {
    ...input, code: generateCode(), status: 'pending', balance: 0, stripeSessionId: null,
    createdAt: new Date().toISOString(), paidAt: null, expiresAt: null, redemptions: [],
  };
  const db = getAdmin();
  if (db) {
    const { error } = await db.from('gift_cards').insert({
      code: card.code, status: card.status, amount: card.amount, balance: 0, buyer_name: card.buyerName,
      buyer_email: card.buyerEmail, recipient_name: card.recipientName, recipient_email: card.recipientEmail,
      message: card.message, locale: card.locale, demo: card.demo,
    });
    if (error) throw new Error(`gift_cards insert: ${error.message}`);
    return card;
  }
  await withFile((cards) => { cards.push(card); }, true);
  return card;
}

export async function attachSession(code: string, sessionId: string): Promise<void> {
  const db = getAdmin();
  if (db) {
    const { error } = await db.from('gift_cards').update({ stripe_session_id: sessionId }).eq('code', code);
    if (error) throw new Error(`gift_cards update: ${error.message}`);
    return;
  }
  await withFile((cards) => { const c = cards.find((x) => x.code === code); if (c) c.stripeSessionId = sessionId; }, true);
}

export async function getByCode(code: string): Promise<GiftCard | null> {
  const norm = normalizeCode(code);
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('gift_cards').select(SELECT).eq('code', norm).maybeSingle();
    if (error) throw new Error(`gift_cards select: ${error.message}`);
    return data ? fromRow(data as Row) : null;
  }
  return withFile((cards) => cards.find((c) => c.code === norm) ?? null);
}

export async function list(limit = 50): Promise<GiftCard[]> {
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('gift_cards').select(SELECT).neq('status', 'pending')
      .order('created_at', { ascending: false }).limit(limit);
    if (error) throw new Error(`gift_cards list: ${error.message}`);
    return (data as Row[]).map(fromRow);
  }
  return withFile((cards) => cards.filter((c) => c.status !== 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit));
}

/**
 * Attiva la carta dopo il pagamento. Idempotente: Stripe può inviare lo stesso evento più volte.
 * Restituisce la carta e se è stata attivata proprio ora (per inviare le email una volta sola).
 */
export async function markPaid(code: string, sessionId: string, paidCents: number): Promise<{ card: GiftCard; activated: boolean } | null> {
  const norm = normalizeCode(code);
  const now = new Date();
  const db = getAdmin();
  if (db) {
    const existing = await getByCode(norm);
    if (!existing) return null;
    if (existing.amount !== paidCents) throw new Error(`importo pagato ${paidCents} diverso da quello della carta ${existing.amount}`);
    const { data, error } = await db.from('gift_cards')
      .update({ status: 'active', balance: existing.amount, stripe_session_id: sessionId, paid_at: now.toISOString(), expires_at: expiryFrom(now) })
      .eq('code', norm).eq('status', 'pending').select('code');
    if (error) throw new Error(`gift_cards activate: ${error.message}`);
    const activated = (data?.length ?? 0) > 0;
    return { card: (await getByCode(norm)) as GiftCard, activated };
  }
  return withFile((cards) => {
    const c = cards.find((x) => x.code === norm);
    if (!c) return null;
    if (c.amount !== paidCents) throw new Error(`importo pagato ${paidCents} diverso da quello della carta ${c.amount}`);
    if (c.status !== 'pending') return { card: structuredClone(c), activated: false };
    Object.assign(c, { status: 'active', balance: c.amount, stripeSessionId: sessionId, paidAt: now.toISOString(), expiresAt: expiryFrom(now) });
    return { card: structuredClone(c), activated: true };
  }, true);
}

export type RedeemResult =
  | { ok: true; card: GiftCard }
  | { ok: false; reason: 'not_found' | 'inactive' | 'expired' | 'insufficient' | 'invalid' };

/** Scala un importo (in centesimi) dal saldo. Atomico: due riscatti simultanei non possono superare il saldo. */
export async function redeem(code: string, cents: number, note: string): Promise<RedeemResult> {
  if (!Number.isInteger(cents) || cents <= 0) return { ok: false, reason: 'invalid' };
  const norm = normalizeCode(code);
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.rpc('redeem_gift_card', { p_code: norm, p_amount: cents, p_note: note });
    if (error) throw new Error(`redeem_gift_card: ${error.message}`);
    const reason = String(data);
    if (['not_found', 'inactive', 'expired', 'insufficient'].includes(reason)) {
      return { ok: false, reason: reason as 'not_found' | 'inactive' | 'expired' | 'insufficient' };
    }
    return { ok: true, card: (await getByCode(norm)) as GiftCard };
  }
  return withFile((cards): RedeemResult => {
    const c = cards.find((x) => x.code === norm);
    if (!c) return { ok: false, reason: 'not_found' };
    if (c.status !== 'active') return { ok: false, reason: 'inactive' };
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { ok: false, reason: 'expired' };
    if (cents > c.balance) return { ok: false, reason: 'insufficient' };
    c.balance -= cents;
    c.redemptions.push({ at: new Date().toISOString(), amount: cents, note });
    return { ok: true, card: structuredClone(c) };
  }, true);
}

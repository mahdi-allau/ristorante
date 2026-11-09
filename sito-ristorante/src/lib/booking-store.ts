import 'server-only';
import { randomBytes, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { getAdmin } from './supabase';

/**
 * Archivio prenotazioni.
 *  - 'supabase': tabella `bookings` (produzione).
 *  - 'file': data/bookings.json, solo con BOOKING_STORE=file (sviluppo / server con disco scrivibile).
 *  - 'demo': non salva nulla; le disponibilità sono simulate.
 */
export type BookingMode = 'supabase' | 'file' | 'demo';
export const bookingMode = (): BookingMode =>
  getAdmin() ? 'supabase' : process.env.BOOKING_STORE === 'file' ? 'file' : 'demo';

/** confirmed = attesa · seated = al tavolo · completed = concluso · cancelled/no_show = liberano i coperti */
export type BookingStatus = 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
export const STATUSES: BookingStatus[] = ['confirmed', 'seated', 'completed', 'cancelled', 'no_show'];
/** Stati che occupano coperti nello slot. */
const COUNTING: BookingStatus[] = ['confirmed', 'seated', 'completed'];
const counts = (s: BookingStatus) => COUNTING.includes(s);
/** Cap usato per "forzare" (overbooking consapevole dello staff). */
export const NO_CAP = 100_000;

export interface Booking {
  id: string;
  /** segreto nel link "gestisci prenotazione" (conferma / annulla) */
  token: string;
  date: string; // YYYY-MM-DD (Roma)
  time: string; // HH:MM (Roma)
  guests: number;
  name: string;
  phone: string;
  email: string; // vuota per le prenotazioni inserite a mano senza email
  notes: string; // note del cliente (allergie, occasioni)
  staffNote: string; // note interne
  source: 'web' | 'staff';
  marketing: boolean;
  /** il cliente ha scelto di ricevere, dopo la visita, una email con l'invito a lasciare una recensione */
  reviewOptIn: boolean;
  /** il cliente si è disiscritto dalle richieste di recensione (vale per tutte le prenotazioni con la stessa email) */
  reviewOptOut: boolean;
  locale: 'it' | 'en';
  status: BookingStatus;
  createdAt: string;
  reminderSentAt: string | null;
  guestConfirmedAt: string | null;
  cancelledAt: string | null;
  reviewRequestedAt: string | null;
}

export type NewBooking = Pick<Booking, 'date' | 'time' | 'guests' | 'name' | 'phone' | 'email' | 'notes' | 'marketing'> & { locale: string; reviewOptIn?: boolean };

export type BookingPatch = Partial<Pick<Booking, 'status' | 'date' | 'time' | 'guests' | 'name' | 'phone' | 'email' | 'notes' | 'staffNote' | 'reviewOptIn'>>;

export const newToken = (): string => randomBytes(18).toString('base64url'); // 24 caratteri, ~144 bit

/* ---------------- file store ---------------- */
const FILE = path.join(process.cwd(), 'data', 'bookings.json');
let chain: Promise<unknown> = Promise.resolve();

function withFile<T>(fn: (rows: Booking[]) => T | Promise<T>, write = false): Promise<T> {
  const run = chain.then(async () => {
    let rows: Booking[] = [];
    try { rows = (JSON.parse(await fs.readFile(FILE, 'utf8')) as { bookings: Booking[] }).bookings; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
    const out = await fn(rows);
    if (write) {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      const tmp = `${FILE}.tmp`;
      await fs.writeFile(tmp, JSON.stringify({ bookings: rows }, null, 2), 'utf8');
      await fs.rename(tmp, FILE);
    }
    return out;
  });
  chain = run.catch(() => undefined);
  return run;
}

/** Righe vecchie (senza i campi aggiunti dopo) → valori di default. */
const normalize = (b: Booking): Booking => ({
  ...b, staffNote: b.staffNote ?? '', source: b.source ?? 'web', reviewOptIn: b.reviewOptIn ?? false,
  reviewOptOut: b.reviewOptOut ?? false, reviewRequestedAt: b.reviewRequestedAt ?? null,
});

/* ---------------- supabase mapping ---------------- */
type Row = {
  id: string; manage_token: string | null; date: string; time: string; guests: number; name: string; phone: string;
  email: string; notes: string; staff_note: string | null; source: 'web' | 'staff' | null; marketing: boolean;
  review_opt_in: boolean | null; review_opt_out: boolean | null; review_requested_at: string | null;
  locale: 'it' | 'en'; status: BookingStatus; created_at: string;
  reminder_sent_at: string | null; guest_confirmed_at: string | null; cancelled_at: string | null;
};
const fromRow = (r: Row): Booking => ({
  id: r.id, token: r.manage_token ?? '', date: r.date, time: String(r.time).slice(0, 5), guests: r.guests, name: r.name,
  phone: r.phone, email: r.email, notes: r.notes, staffNote: r.staff_note ?? '', source: r.source ?? 'web',
  marketing: r.marketing, reviewOptIn: r.review_opt_in ?? false, reviewOptOut: r.review_opt_out ?? false,
  locale: r.locale, status: r.status, createdAt: r.created_at, reminderSentAt: r.reminder_sent_at,
  guestConfirmedAt: r.guest_confirmed_at, cancelledAt: r.cancelled_at, reviewRequestedAt: r.review_requested_at,
});

/* ---------------- API ---------------- */

/** Coperti già occupati per orario in una data (prenotazioni confermate, al tavolo o concluse). */
export async function usedSeats(date: string): Promise<Map<string, number>> {
  const used = new Map<string, number>();
  const add = (time: string, g: number) => used.set(time.slice(0, 5), (used.get(time.slice(0, 5)) ?? 0) + g);
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').select('time, guests').eq('date', date).in('status', COUNTING);
    if (error) throw new Error(`usedSeats: ${error.message}`);
    for (const r of data ?? []) add(String(r.time), Number(r.guests));
  } else if (bookingMode() === 'file') {
    await withFile((rows) => rows.filter((b) => b.date === date && counts(b.status)).forEach((b) => add(b.time, b.guests)));
  }
  return used;
}

export type CreateResult = { status: 'ok'; id: string; token: string; stored: boolean } | { status: 'full' };

/** Crea la prenotazione controllando la capienza in modo atomico. `source: 'staff'` per quelle inserite in sala/al telefono. */
export async function create(b: NewBooking, cap: number, source: 'web' | 'staff' = 'web'): Promise<CreateResult> {
  const mode = bookingMode();
  const token = newToken();
  const locale: 'it' | 'en' = b.locale === 'en' ? 'en' : 'it';

  if (mode === 'supabase') {
    const db = getAdmin()!;
    const { data, error } = await db.rpc('create_booking', {
      p_date: b.date, p_time: b.time, p_guests: b.guests, p_name: b.name, p_phone: b.phone, p_email: b.email,
      p_notes: b.notes, p_marketing: b.marketing, p_locale: locale, p_cap: cap, p_token: token,
    });
    if (error) throw new Error(`create_booking: ${error.message}`);
    if (!data) return { status: 'full' };
    const extra = { ...(source === 'staff' && { source }), ...(b.reviewOptIn && { review_opt_in: true }) };
    if (Object.keys(extra).length) await db.from('bookings').update(extra).eq('id', String(data));
    return { status: 'ok', id: String(data), token, stored: true };
  }

  if (mode === 'file') {
    return withFile<CreateResult>((rows) => {
      const used = rows.filter((x) => x.date === b.date && x.time === b.time && counts(x.status)).reduce((s, x) => s + x.guests, 0);
      if (used + b.guests > cap) return { status: 'full' };
      const row: Booking = {
        id: randomUUID(), token, date: b.date, time: b.time, guests: b.guests, name: b.name, phone: b.phone, email: b.email,
        notes: b.notes, staffNote: '', source, marketing: b.marketing, reviewOptIn: !!b.reviewOptIn, reviewOptOut: false,
        locale, status: 'confirmed', createdAt: new Date().toISOString(),
        reminderSentAt: null, guestConfirmedAt: null, cancelledAt: null, reviewRequestedAt: null,
      };
      rows.push(row);
      return { status: 'ok', id: row.id, token, stored: true };
    }, true);
  }

  return { status: 'ok', id: 'demo', token: 'demo', stored: false };
}

export async function getByToken(token: string): Promise<Booking | null> {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return null;
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').select('*').eq('manage_token', token).maybeSingle();
    if (error) throw new Error(`getByToken: ${error.message}`);
    return data ? fromRow(data as Row) : null;
  }
  if (bookingMode() !== 'file') return null;
  return withFile((rows) => { const b = rows.find((x) => x.token === token); return b ? normalize(b) : null; });
}

/** Il cliente conferma la presenza (idempotente). */
export async function guestConfirm(token: string): Promise<Booking | null> {
  const now = new Date().toISOString();
  const db = getAdmin();
  if (db) {
    const { error } = await db.from('bookings').update({ guest_confirmed_at: now })
      .eq('manage_token', token).eq('status', 'confirmed').is('guest_confirmed_at', null);
    if (error) throw new Error(`guestConfirm: ${error.message}`);
    return getByToken(token);
  }
  if (bookingMode() !== 'file') return null;
  return withFile((rows) => {
    const b = rows.find((x) => x.token === token);
    if (!b) return null;
    if (b.status === 'confirmed' && !b.guestConfirmedAt) b.guestConfirmedAt = now;
    return normalize(structuredClone(b));
  }, true);
}

/** Annulla (idempotente): libera subito i coperti. Il controllo dell'orario limite spetta al chiamante. */
export async function cancel(token: string): Promise<Booking | null> {
  const now = new Date().toISOString();
  const db = getAdmin();
  if (db) {
    const { error } = await db.from('bookings').update({ status: 'cancelled', cancelled_at: now })
      .eq('manage_token', token).eq('status', 'confirmed');
    if (error) throw new Error(`cancel: ${error.message}`);
    return getByToken(token);
  }
  if (bookingMode() !== 'file') return null;
  return withFile((rows) => {
    const b = rows.find((x) => x.token === token);
    if (!b) return null;
    if (b.status === 'confirmed') { b.status = 'cancelled'; b.cancelledAt = now; }
    return normalize(structuredClone(b));
  }, true);
}

/** Prenotazioni confermate con email, senza promemoria inviato, nell'intervallo di date (candidati). */
export async function reminderCandidates(fromYmd: string, toYmd: string): Promise<Booking[]> {
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').select('*').eq('status', 'confirmed').neq('email', '')
      .is('reminder_sent_at', null).gte('date', fromYmd).lte('date', toYmd);
    if (error) throw new Error(`reminderCandidates: ${error.message}`);
    return (data as Row[]).map(fromRow);
  }
  if (bookingMode() !== 'file') return [];
  return withFile((rows) => rows
    .filter((b) => b.status === 'confirmed' && b.email && !b.reminderSentAt && b.date >= fromYmd && b.date <= toYmd)
    .map((b) => normalize(structuredClone(b))));
}

/** Prenota l'invio del promemoria: true solo per il primo che lo richiede (evita doppi invii con cron sovrapposti). */
export async function claimReminder(id: string): Promise<boolean> {
  const now = new Date().toISOString();
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').update({ reminder_sent_at: now }).eq('id', id).is('reminder_sent_at', null).select('id');
    if (error) throw new Error(`claimReminder: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }
  return withFile((rows) => {
    const b = rows.find((x) => x.id === id);
    if (!b || b.reminderSentAt) return false;
    b.reminderSentAt = now;
    return true;
  }, true);
}

/** Se l'invio fallisce, rimette la prenotazione tra quelle da avvisare al prossimo giro. */
export async function releaseReminder(id: string): Promise<void> {
  const db = getAdmin();
  if (db) {
    await db.from('bookings').update({ reminder_sent_at: null }).eq('id', id);
    return;
  }
  await withFile((rows) => { const b = rows.find((x) => x.id === id); if (b) b.reminderSentAt = null; }, true);
}

/* ---------------- pannello sala ---------------- */

/** Prenotazioni in un intervallo di date (incluse), ordinate per data e ora. */
export async function listRange(fromYmd: string, toYmd: string): Promise<Booking[]> {
  const byTime = (a: Booking, b: Booking) => `${a.date} ${a.time} ${a.createdAt}`.localeCompare(`${b.date} ${b.time} ${b.createdAt}`);
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').select('*').gte('date', fromYmd).lte('date', toYmd)
      .order('date').order('time').order('created_at');
    if (error) throw new Error(`listRange: ${error.message}`);
    return (data as Row[]).map(fromRow);
  }
  if (bookingMode() !== 'file') return [];
  return withFile((rows) => rows.filter((b) => b.date >= fromYmd && b.date <= toYmd).map((b) => normalize(structuredClone(b))).sort(byTime));
}

export type PatchResult = { status: 'ok'; booking: Booking } | { status: 'full' } | { status: 'not_found' };

/**
 * Modifica da parte dello staff: stato, spostamento (data/ora/persone) e dati. Se la prenotazione resta o torna
 * a occupare coperti si controlla la capienza dello slot di destinazione (`cap`; NO_CAP per forzare).
 * Se cambiano data o ora il promemoria e la conferma del cliente ripartono da zero.
 */
export async function patch(id: string, p: BookingPatch, cap: number): Promise<PatchResult> {
  const db = getAdmin();
  if (db) {
    const dbPatch = {
      ...(p.status !== undefined && { status: p.status }), ...(p.date !== undefined && { date: p.date }),
      ...(p.time !== undefined && { time: p.time }), ...(p.guests !== undefined && { guests: p.guests }),
      ...(p.name !== undefined && { name: p.name }), ...(p.phone !== undefined && { phone: p.phone }),
      ...(p.email !== undefined && { email: p.email }), ...(p.notes !== undefined && { notes: p.notes }),
      ...(p.staffNote !== undefined && { staff_note: p.staffNote }),
      ...(p.reviewOptIn !== undefined && { review_opt_in: p.reviewOptIn }),
    };
    const { data, error } = await db.rpc('staff_update_booking', { p_id: id, p_patch: dbPatch, p_cap: cap });
    if (error) throw new Error(`staff_update_booking: ${error.message}`);
    if (data === 'not_found') return { status: 'not_found' };
    if (data === 'full') return { status: 'full' };
    const { data: row, error: e2 } = await db.from('bookings').select('*').eq('id', id).single();
    if (e2) throw new Error(`patch reload: ${e2.message}`);
    return { status: 'ok', booking: fromRow(row as Row) };
  }
  if (bookingMode() !== 'file') return { status: 'not_found' };

  return withFile<PatchResult>((rows) => {
    const b = rows.find((x) => x.id === id);
    if (!b) return { status: 'not_found' };
    const next = { ...b, ...Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)) } as Booking;
    const moved = next.date !== b.date || next.time !== b.time;
    // La capienza si controlla solo se la modifica può aumentare l'occupazione dello slot: così in uno slot già
    // in overbooking si possono comunque correggere nomi e note, ridurre le persone o cambiare stato.
    const mayOverfill = counts(next.status) && (moved || next.guests > b.guests || !counts(b.status));
    if (mayOverfill) {
      const used = rows.filter((x) => x.id !== id && x.date === next.date && x.time === next.time && counts(x.status)).reduce((s, x) => s + x.guests, 0);
      if (used + next.guests > cap) return { status: 'full' };
    }
    if (moved) { next.reminderSentAt = null; next.guestConfirmedAt = null; }
    if (next.status === 'cancelled' && b.status !== 'cancelled') next.cancelledAt = new Date().toISOString();
    if (next.status !== 'cancelled') next.cancelledAt = null;
    Object.assign(b, next);
    return { status: 'ok', booking: normalize(structuredClone(b)) };
  }, true);
}

/* ---------------- richieste di recensione ---------------- */

/** Prenotazioni con tavolo servito (al tavolo o concluse), con email, senza richiesta inviata né disiscrizione. */
export async function reviewCandidates(fromYmd: string, toYmd: string): Promise<Booking[]> {
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').select('*').in('status', ['seated', 'completed']).neq('email', '')
      .is('review_requested_at', null).eq('review_opt_out', false).gte('date', fromYmd).lte('date', toYmd);
    if (error) throw new Error(`reviewCandidates: ${error.message}`);
    return (data as Row[]).map(fromRow);
  }
  if (bookingMode() !== 'file') return [];
  return withFile((rows) => rows
    .filter((b) => (b.status === 'seated' || b.status === 'completed') && b.email && !b.reviewRequestedAt && !b.reviewOptOut && b.date >= fromYmd && b.date <= toYmd)
    .map((b) => normalize(structuredClone(b))));
}

/** Email (minuscole) tra quelle indicate che si sono disiscritte in una qualsiasi prenotazione. */
export async function suppressedEmails(emails: string[]): Promise<Set<string>> {
  const set = new Set<string>();
  if (!emails.length) return set;
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').select('email').eq('review_opt_out', true).in('email', emails);
    if (error) throw new Error(`suppressedEmails: ${error.message}`);
    for (const r of data ?? []) set.add(String(r.email).toLowerCase());
    return set;
  }
  if (bookingMode() !== 'file') return set;
  const wanted = new Set(emails.map((e) => e.toLowerCase()));
  await withFile((rows) => rows.filter((b) => b.reviewOptOut && wanted.has(b.email.toLowerCase())).forEach((b) => set.add(b.email.toLowerCase())));
  return set;
}

/** Prenota l'invio della richiesta: true solo per il primo che la richiede (nessun doppio invio). */
export async function claimReview(id: string): Promise<boolean> {
  const now = new Date().toISOString();
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('bookings').update({ review_requested_at: now }).eq('id', id).is('review_requested_at', null).select('id');
    if (error) throw new Error(`claimReview: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }
  return withFile((rows) => {
    const b = rows.find((x) => x.id === id);
    if (!b || b.reviewRequestedAt) return false;
    b.reviewRequestedAt = now;
    return true;
  }, true);
}

export async function releaseReview(id: string): Promise<void> {
  const db = getAdmin();
  if (db) { await db.from('bookings').update({ review_requested_at: null }).eq('id', id); return; }
  await withFile((rows) => { const b = rows.find((x) => x.id === id); if (b) b.reviewRequestedAt = null; }, true);
}

/**
 * Disiscrizione dalle richieste di recensione (idempotente). Vale per tutte le prenotazioni con la stessa email;
 * quelle future sono escluse dal controllo `suppressedEmails`. Restituisce false se il token non esiste.
 */
export async function unsubscribeReviews(token: string): Promise<boolean> {
  const b = await getByToken(token);
  if (!b) return false;
  const db = getAdmin();
  if (db) {
    const { error } = await db.from('bookings').update({ review_opt_out: true }).ilike('email', b.email.replace(/[%_\\]/g, '\\$&'));
    if (error) throw new Error(`unsubscribeReviews: ${error.message}`);
    return true;
  }
  const mail = b.email.toLowerCase();
  await withFile((rows) => { rows.forEach((x) => { if (x.email.toLowerCase() === mail) x.reviewOptOut = true; }); }, true);
  return true;
}

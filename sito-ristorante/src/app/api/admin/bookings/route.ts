import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SEATS_PER_SLOT } from '@/lib/availability';
import { isAuthedRequest } from '@/lib/admin-auth';
import { create, listRange, NO_CAP, patch, STATUSES, type Booking } from '@/lib/booking-store';
import { getContent } from '@/lib/content-store';
import { addDays, slotTimes } from '@/lib/hours';

export const dynamic = 'force-dynamic';

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const text = (max: number) => z.string().trim().max(max);

const createSchema = z.object({
  date: ymd, time: hhmm, guests: z.number().int().min(1).max(40),
  name: text(80).min(2), phone: text(30).optional().default(''),
  email: z.union([z.string().trim().email().max(120), z.literal('')]).optional().default(''),
  notes: text(500).optional().default(''), staffNote: text(500).optional().default(''),
  reviewOptIn: z.boolean().optional().default(false),
  force: z.boolean().optional().default(false),
});

const patchSchema = z.object({
  id: z.string().min(1).max(60),
  patch: z.object({
    status: z.enum(STATUSES as [string, ...string[]]).optional(),
    date: ymd.optional(), time: hhmm.optional(), guests: z.number().int().min(1).max(40).optional(),
    name: text(80).min(2).optional(), phone: text(30).optional(),
    email: z.union([z.string().trim().email().max(120), z.literal('')]).optional(),
    notes: text(500).optional(), staffNote: text(500).optional(), reviewOptIn: z.boolean().optional(),
  }).strict(),
  force: z.boolean().optional().default(false),
});

const noStore = { 'Cache-Control': 'no-store' };
/** Il token del link cliente non serve al pannello: non viene mai esposto. */
const publicView = ({ token: _t, ...b }: Booking) => b;

/** Neutralizza le formule di Excel/Sheets (=, +, -, @) nelle celle del CSV (CSV injection). */
function cell(v: string | number): string {
  let s = String(v ?? '');
  // I numeri di telefono (+39 333 123456, -, cifre, spazi, parentesi) restano intatti; tutto il resto che inizia
  // con = + - @ (o tab/CR) viene reso testo con un apostrofo.
  const phoneLike = /^[+-][\d\s().+-]*$/.test(s);
  if (/^[=+\-@\t\r]/.test(s) && !phoneLike) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(rows: Booking[]): string {
  const head = ['Data', 'Ora', 'Persone', 'Nome', 'Telefono', 'Email', 'Note cliente', 'Note staff', 'Stato', 'Origine', 'Confermata dal cliente', 'Creata il'];
  const lines = rows.map((b) => [
    b.date, b.time, b.guests, b.name, b.phone, b.email, b.notes, b.staffNote, b.status, b.source === 'staff' ? 'Staff' : 'Sito',
    b.guestConfirmedAt ? 'sì' : 'no', b.createdAt,
  ].map(cell).join(';'));
  return `﻿${[head.map(cell).join(';'), ...lines].join('\r\n')}\r\n`; // BOM + ';' per Excel in italiano
}

export async function GET(req: Request) {
  if (!isAuthedRequest(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const q = new URL(req.url).searchParams;

  try {
    if (q.get('format') === 'csv') {
      const from = ymd.safeParse(q.get('from')), to = ymd.safeParse(q.get('to'));
      if (!from.success || !to.success || from.data > to.data || to.data > addDays(from.data, 92)) {
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
      }
      const rows = await listRange(from.data, to.data);
      return new Response(toCsv(rows), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="prenotazioni-${from.data}_${to.data}.csv"`,
          ...noStore,
        },
      });
    }

    const date = ymd.safeParse(q.get('date'));
    if (!date.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const { hours } = await getContent();
    const bookings = (await listRange(date.data, date.data)).map(publicView);
    return NextResponse.json({ date: date.data, closed: slotTimes(date.data, hours) === null, capacity: SEATS_PER_SLOT, bookings }, { headers: noStore });
  } catch (e) {
    console.error('admin bookings GET', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

function guard(req: Request) {
  if (!isAuthedRequest(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!req.headers.get('content-type')?.includes('application/json')) return NextResponse.json({ error: 'invalid' }, { status: 415 });
  return null;
}

/** Nuova prenotazione inserita dallo staff (telefono, walk-in). `force` ignora la capienza. */
export async function POST(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid', message: parsed.error.issues[0]?.message }, { status: 400 });
  const { force, staffNote, ...d } = parsed.data;

  try {
    const res = await create({ ...d, marketing: false, locale: 'it' }, force ? NO_CAP : SEATS_PER_SLOT, 'staff');
    if (res.status === 'full') return NextResponse.json({ error: 'full' }, { status: 409 });
    if (!res.stored) return NextResponse.json({ error: 'no_store' }, { status: 503 });
    if (staffNote) await patch(res.id, { staffNote }, NO_CAP);
    return NextResponse.json({ ok: true, id: res.id });
  } catch (e) {
    console.error('admin bookings POST', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

/** Cambio di stato, spostamento o modifica dati. */
export async function PATCH(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid', message: parsed.error.issues[0]?.message }, { status: 400 });

  try {
    const res = await patch(parsed.data.id, parsed.data.patch as Parameters<typeof patch>[1], parsed.data.force ? NO_CAP : SEATS_PER_SLOT);
    if (res.status === 'not_found') return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (res.status === 'full') return NextResponse.json({ error: 'full' }, { status: 409 });
    return NextResponse.json({ ok: true, booking: publicView(res.booking) });
  } catch (e) {
    console.error('admin bookings PATCH', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

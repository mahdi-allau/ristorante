import { BOOKING_HORIZON_DAYS } from '@/content/site';
import { bookingMode, create, usedSeats, type NewBooking } from './booking-store';
import { getContent } from './content-store';
import { addDays, romeNow, slotTimes, type SlotService } from './hours';

export interface Slot { time: string; service: SlotService; available: boolean }
export interface Availability { closed: boolean; slots: Slot[] }

export const SEATS_PER_SLOT = Number(process.env.SEATS_PER_SLOT ?? 24);

export function isBookableDate(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const today = romeNow().ymd;
  return ymd >= today && ymd <= addDays(today, BOOKING_HORIZON_DAYS);
}

/** Pseudo-casuale stabile per (data, persone): simula slot esauriti in modalità demo. */
function seeded(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export async function getAvailability(ymd: string, guests: number): Promise<Availability> {
  const { hours } = await getContent();
  const times = slotTimes(ymd, hours);
  if (!times) return { closed: true, slots: [] };

  const now = romeNow();
  const isToday = ymd === now.ymd;
  const real = bookingMode() !== 'demo';
  const used = real ? await usedSeats(ymd) : new Map<string, number>();

  const rnd = seeded(`${ymd}:${guests}`);
  const slots: Slot[] = [];
  for (const service of ['lunch', 'dinner'] as const) {
    for (const time of times[service]) {
      const [h, m] = time.split(':').map(Number);
      const past = isToday && h + m / 60 < now.time + 1; // almeno 1 ora di anticipo
      const full = real ? (used.get(time) ?? 0) + guests > SEATS_PER_SLOT : rnd() < 0.28;
      if (past) continue;
      slots.push({ time, service, available: !full });
    }
  }
  return { closed: false, slots };
}

export type BookingInput = NewBooking;
export type BookingResult = { status: 'ok'; id: string; token: string; stored: boolean } | { status: 'full' };

export async function createBooking(b: BookingInput): Promise<BookingResult> {
  return create(b, SEATS_PER_SLOT);
}

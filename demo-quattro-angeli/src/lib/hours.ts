import { TZ } from '@/content/site';
import type { Content, Range } from '@/content/types';

export type HoursConfig = Content['hours'];
export type SlotService = 'lunch' | 'dinner';

const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Giorno della settimana (0=dom), ora decimale e data YYYY-MM-DD correnti a Roma. */
export function romeNow(date: Date = new Date()): { day: number; time: number; ymd: string } {
  const parts: Record<string, string> = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
  return {
    day: DAY_INDEX[parts.weekday],
    time: (Number(parts.hour) % 24) + Number(parts.minute) / 60,
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/** "12:30" → 12.5 */
export function toDec(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

/** 12.5 → "12:30" */
export function fmtTime(t: number): string {
  const h = Math.floor(t + 1e-9);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Giorno della settimana di una data YYYY-MM-DD (calendario, senza fuso). */
export function weekdayOf(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function isClosure(ymd: string, cfg: HoursConfig): boolean {
  return cfg.closures.some((c) => ymd >= c.from && ymd <= c.to);
}

/** Fasce di apertura di una data: vuote se è giorno di chiusura settimanale o chiusura straordinaria. */
export function rangesOn(ymd: string, cfg: HoursConfig): Range[] {
  if (isClosure(ymd, cfg)) return [];
  return cfg.week[weekdayOf(ymd)] ?? [];
}

/**
 * Orari prenotabili di una data, oppure null se chiuso. Si prenota dall'apertura fino a
 * 30 minuti prima della chiusura, a passi di mezz'ora; prima delle 17 = pranzo, poi cena.
 */
export function slotTimes(ymd: string, cfg: HoursConfig): Record<SlotService, string[]> | null {
  const ranges = rangesOn(ymd, cfg);
  if (!ranges.length) return null;
  const out: Record<SlotService, string[]> = { lunch: [], dinner: [] };
  for (const r of ranges) {
    const service: SlotService = toDec(r.from) < 17 ? 'lunch' : 'dinner';
    for (let t = toDec(r.from); t <= toDec(r.to) - 0.5 + 1e-9; t += 0.5) out[service].push(fmtTime(t));
  }
  return out;
}

/** Offset (ms) di Europe/Rome rispetto a UTC all'istante dato (gestisce ora legale). */
function romeOffsetMs(utcMs: number): number {
  const p: Record<string, string> = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date(utcMs)).forEach((x) => { p[x.type] = x.value; });
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute), Number(p.second));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** Istante reale (UTC) di una data/ora "a muro" di Roma, es. ('2026-11-04', '20:00'). */
export function romeToDate(ymd: string, hhmm: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - romeOffsetMs(guess);
  const off2 = romeOffsetMs(t);
  if (guess - off2 !== t) t = guess - off2;
  return new Date(t);
}

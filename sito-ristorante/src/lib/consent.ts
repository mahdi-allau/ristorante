'use client';

export interface Consent { v: 1; analytics: boolean; maps: boolean; ts: number }

const KEY = 'lumina-consent';
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;
export const CONSENT_EVENT = 'consent-change';
export const OPEN_EVENT = 'consent-open';

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (c.v !== 1 || Date.now() - c.ts > SIX_MONTHS) return null; // richiesto di nuovo dopo 6 mesi
    return c;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean, maps: boolean): void {
  const c: Consent = { v: 1, analytics, maps, ts: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* storage non disponibile */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
}

export function openConsent(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

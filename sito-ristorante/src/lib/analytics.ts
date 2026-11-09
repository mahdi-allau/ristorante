'use client';

import { readConsent } from './consent';

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }
}

/** Evento di conversione: inviato a GA4 solo se l'utente ha dato il consenso alle statistiche. */
export function track(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  if (!readConsent()?.analytics) return;
  window.gtag?.('event', name, params);
}

// Funzione pianificata di Netlify: richiama ogni ora l'endpoint dei promemoria.
// Variabili richieste su Netlify: URL (impostata da Netlify) e CRON_SECRET (la stessa del sito).
import type { Config } from '@netlify/functions';

export default async () => {
  const base = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error('send-reminders: URL o CRON_SECRET mancanti');
    return;
  }
  const res = await fetch(`${base}/api/cron/reminders`, { method: 'POST', headers: { Authorization: `Bearer ${secret}` } });
  console.log('send-reminders', res.status, await res.text());
};

export const config: Config = { schedule: '@hourly' };

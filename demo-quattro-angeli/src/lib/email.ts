import { promises as fs } from 'fs';
import path from 'path';
import { SITE } from '@/content/site';
import { href, intlLocale, isLocale, type Locale } from '@/i18n/config';
import type { BookingInput } from './availability';
import type { Booking } from './booking-store';
import type { GiftCard } from './gift-store';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export type SendResult = 'sent' | 'skipped' | 'failed';

/**
 * Invio via Resend. Con EMAIL_OUTBOX=1 (solo sviluppo) le email non partono ma vengono scritte in data/outbox/.
 * Restituisce 'skipped' se non c'è nessun fornitore configurato.
 */
interface SendOptions { replyTo?: string; headers?: Record<string, string> }

async function send(to: string, subject: string, html: string, opts: SendOptions = {}): Promise<SendResult> {
  if (process.env.EMAIL_OUTBOX === '1') {
    const dir = path.join(process.cwd(), 'data', 'outbox');
    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.json`;
    await fs.writeFile(path.join(dir, name), JSON.stringify({ to, subject, html, ...opts }, null, 2));
    return 'sent';
  }
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return 'skipped';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, ...(opts.replyTo && { reply_to: opts.replyTo }), ...(opts.headers && { headers: opts.headers }) }),
    });
    if (!res.ok) { console.error('resend error', res.status, await res.text()); return 'failed'; }
    return 'sent';
  } catch (e) {
    console.error('resend error', e);
    return 'failed';
  }
}

// Il testo delle email è in italiano o in inglese (inglese per tutte le altre lingue); date e link seguono la lingua del cliente.
const loc = (l: string) => (isLocale(l) ? intlLocale[l] : 'it-IT');
const isEn = (l: string) => l !== 'it';

/** "mercoledì 4 novembre, ore 20:00" */
export function formatWhen(date: string, time: string, locale: string): string {
  const d = new Intl.DateTimeFormat(loc(locale), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`));
  return isEn(locale) ? `${d}, ${time}` : `${d}, ore ${time}`;
}

export const manageUrl = (locale: string, token: string) =>
  `${SITE.url}${href(isLocale(locale) ? locale : 'it', `/booking/${token}`)}`;

const shell = (inner: string) => `<div style="font-family:Georgia,serif;background:#120A0B;color:#F3EEE6;padding:32px;max-width:520px">
  <p style="letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#D4795A;margin:0 0 16px">${esc(SITE.name)}</p>
  ${inner}
  <p style="color:#A39B8C;font-size:12px;margin:24px 0 0">${esc(SITE.street)}, ${esc(SITE.zip)} ${esc(SITE.city)} · ${esc(SITE.phone)}</p>
</div>`;

const button = (url: string, label: string) =>
  `<p style="margin:20px 0"><a href="${url}" style="background:#D4795A;color:#1A0C0A;padding:12px 22px;text-decoration:none;letter-spacing:.14em;text-transform:uppercase;font-size:13px">${label}</a></p>`;

const people = (n: number, en: boolean) =>
  en ? `${n} guest${n === 1 ? '' : 's'}` : `${n} ${n === 1 ? 'persona' : 'persone'}`;

/** Conferma al cliente (con link per gestire/annullare) e notifica al ristorante. Gli errori non bloccano la prenotazione. */
export async function sendBookingEmails(b: BookingInput & { token: string }): Promise<void> {
  const en = isEn(b.locale);
  const when = formatWhen(b.date, b.time, b.locale);
  const url = manageUrl(b.locale, b.token);
  try {
    await send(
      b.email,
      en ? `Booking confirmed — ${SITE.name}` : `Prenotazione confermata — ${SITE.name}`,
      shell(en
        ? `<p style="font-size:18px">Hello ${esc(b.name)}, your table is confirmed.</p><p style="font-size:22px;color:#EDA987;margin:8px 0">${esc(when)}</p><p>${people(b.guests, true)}</p><p style="color:#CFC8BA">We will send you a reminder the day before. Need to change plans?</p>${button(url, 'Manage booking')}`
        : `<p style="font-size:18px">Ciao ${esc(b.name)}, il tuo tavolo è confermato.</p><p style="font-size:22px;color:#EDA987;margin:8px 0">${esc(when)}</p><p>${people(b.guests, false)}</p><p style="color:#CFC8BA">Ti scriveremo un promemoria il giorno prima. Hai cambiato programma?</p>${button(url, 'Gestisci la prenotazione')}`),
    );
    const owner = process.env.OWNER_EMAIL;
    if (owner) {
      await send(owner, `Nuova prenotazione ${b.date} ${b.time} — ${b.guests} pers.`,
        `<p><b>${esc(b.name)}</b> · ${esc(b.phone)} · ${esc(b.email)}</p><p>${esc(b.date)} ${esc(b.time)} · ${b.guests} pers.</p><p>${esc(b.notes || '—')}</p>`);
    }
  } catch (e) {
    console.error('email error', e);
  }
}

/** Promemoria 24 ore prima, con il link per confermare o annullare. */
export async function sendReminderEmail(b: Booking): Promise<SendResult> {
  const en = isEn(b.locale);
  const when = formatWhen(b.date, b.time, b.locale);
  const url = manageUrl(b.locale, b.token);
  return send(
    b.email,
    en ? `Reminder: your table at ${SITE.name}, ${when}` : `Promemoria: il tuo tavolo all'${SITE.name}, ${when}`,
    shell(en
      ? `<p style="font-size:18px">Hello ${esc(b.name)}, we look forward to seeing you.</p><p style="font-size:22px;color:#EDA987;margin:8px 0">${esc(when)}</p><p>${people(b.guests, true)}</p><p style="color:#CFC8BA">Please confirm you are coming, or let us know if your plans changed so we can offer the table to someone else.</p>${button(url, 'Confirm or cancel')}`
      : `<p style="font-size:18px">Ciao ${esc(b.name)}, ti aspettiamo.</p><p style="font-size:22px;color:#EDA987;margin:8px 0">${esc(when)}</p><p>${people(b.guests, false)}</p><p style="color:#CFC8BA">Conferma che ci sarai, oppure avvisaci se hai cambiato programma: potremo offrire il tavolo a qualcun altro.</p>${button(url, 'Conferma o annulla')}`),
  );
}

/** Link di disiscrizione (pagina con conferma) e URL "one-click" per l'header List-Unsubscribe. */
export const unsubscribeUrl = (locale: string, token: string) =>
  `${SITE.url}${href(isLocale(locale) ? locale : 'it', `/unsubscribe/${token}`)}`;
const unsubscribeApi = (token: string) => `${SITE.url}/api/booking/unsubscribe?token=${token}`;

/**
 * Invito a lasciare una recensione su Google dopo la visita. È sempre lo STESSO messaggio con lo stesso link
 * per tutti: nessuna domanda di gradimento che indirizzi i clienti scontenti altrove (review gating, vietato da Google),
 * nessun premio o sconto in cambio della recensione.
 */
export async function sendReviewRequestEmail(b: Booking, reviewUrl: string): Promise<SendResult> {
  const en = isEn(b.locale);
  const first = esc(b.name.split(' ')[0]);
  const unsub = unsubscribeUrl(b.locale, b.token);
  const html = shell(en
    ? `<p style="font-size:18px">Hello ${first}, thank you for dining with us.</p><p style="color:#CFC8BA">If you enjoyed your evening, a few words on Google help other people find us and help our small team a lot. It takes less than a minute.</p>${button(reviewUrl, 'Write a review')}<p style="color:#CFC8BA;font-size:14px">If something was not as you hoped, just reply to this email: we read everything.</p><p style="color:#A39B8C;font-size:12px;margin-top:20px">You receive this because you asked for it when booking. <a style="color:#A39B8C" href="${unsub}">Do not send me these emails</a>.</p>`
    : `<p style="font-size:18px">Ciao ${first}, grazie di essere stato da noi.</p><p style="color:#CFC8BA">Se la serata ti è piaciuta, qualche parola su Google aiuta altre persone a trovarci e aiuta molto il nostro piccolo team. Ci vuole meno di un minuto.</p>${button(reviewUrl, 'Scrivi una recensione')}<p style="color:#CFC8BA;font-size:14px">Se qualcosa non è andato come speravi, rispondi pure a questa email: leggiamo tutto.</p><p style="color:#A39B8C;font-size:12px;margin-top:20px">Ricevi questa email perché l'hai richiesto al momento della prenotazione. <a style="color:#A39B8C" href="${unsub}">Non voglio più ricevere queste email</a>.</p>`);
  return send(
    b.email,
    en ? `How was your evening at ${SITE.name}?` : `Com'è andata la serata all'${SITE.name}?`,
    html,
    {
      replyTo: SITE.email,
      headers: { 'List-Unsubscribe': `<${unsubscribeApi(b.token)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    },
  );
}

/** Avviso al ristorante quando un cliente annulla o conferma dal link. */
export async function sendOwnerBookingUpdate(b: Booking, kind: 'cancelled' | 'confirmed'): Promise<void> {
  const owner = process.env.OWNER_EMAIL;
  if (!owner) return;
  const label = kind === 'cancelled' ? 'ANNULLATA' : 'Confermata dal cliente';
  await send(owner, `Prenotazione ${label} — ${b.date} ${b.time} · ${b.name}`,
    `<p><b>${esc(b.name)}</b> · ${esc(b.phone)} · ${esc(b.email)}</p><p>${esc(b.date)} ${esc(b.time)} · ${b.guests} pers. — <b>${label}</b></p>`);
}

/* ============ Gift card ============ */

const eur = (cents: number, locale: string) =>
  new Intl.NumberFormat(loc(locale), { style: 'currency', currency: 'EUR' }).format(cents / 100);

function cardHtml(card: GiftCard, intro: string, locale: Locale): string {
  const url = `${SITE.url}${href(locale, `/gift-card/view/${card.code}`)}`;
  const en = isEn(locale);
  const expires = card.expiresAt
    ? new Intl.DateTimeFormat(loc(locale), { dateStyle: 'long' }).format(new Date(card.expiresAt))
    : '';
  return `<div style="font-family:Georgia,serif;background:#120A0B;color:#F3EEE6;padding:32px;max-width:520px">
    <p style="letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#D4795A;margin:0 0 12px">${esc(SITE.name)}</p>
    <p style="font-size:18px;margin:0 0 20px">${intro}</p>
    <div style="border:1px solid #D4795A;padding:24px;text-align:center">
      <div style="font-size:34px;color:#EDA987">${eur(card.amount, locale)}</div>
      <div style="font-family:monospace;font-size:22px;letter-spacing:.12em;margin:12px 0">${esc(card.code)}</div>
      ${card.message ? `<p style="font-style:italic;margin:12px 0 0">«${esc(card.message)}»</p>` : ''}
    </div>
    <p style="font-size:14px;color:#CFC8BA;margin:20px 0 6px">${en ? 'Valid until' : 'Valida fino al'} ${esc(expires)}. ${en ? 'Show this code to our staff when booking or paying.' : 'Mostra questo codice al personale quando prenoti o paghi.'}</p>
    <p style="margin:0"><a style="color:#EDA987" href="${url}">${en ? 'Open and print your gift card' : 'Apri e stampa la tua gift card'}</a></p>
  </div>`;
}

/** Dopo il pagamento: ricevuta all'acquirente e, se diverso, il regalo al destinatario. Non blocca mai l'attivazione. */
export async function sendGiftCardEmails(card: GiftCard): Promise<void> {
  const l = card.locale;
  const en = isEn(l);
  try {
    const toRecipient = card.recipientEmail && card.recipientEmail.toLowerCase() !== card.buyerEmail.toLowerCase();
    await send(
      card.buyerEmail,
      en ? `Your gift card — ${SITE.name}` : `La tua gift card — ${SITE.name}`,
      cardHtml(card, en ? `Thank you, ${esc(card.buyerName)}. Payment received.` : `Grazie, ${esc(card.buyerName)}. Pagamento ricevuto.`, l),
    );
    if (toRecipient) {
      await send(
        card.recipientEmail,
        en ? `A gift for you from ${card.buyerName}` : `Un regalo per te da ${card.buyerName}`,
        cardHtml(card, en ? `${esc(card.recipientName || 'Hello')}, ${esc(card.buyerName)} has given you a dinner at ${esc(SITE.name)}.` : `${esc(card.recipientName || 'Ciao')}, ${esc(card.buyerName)} ti regala una cena all'${esc(SITE.name)}.`, l),
      );
    }
    const owner = process.env.OWNER_EMAIL;
    if (owner) await send(owner, `Gift card venduta ${eur(card.amount, 'it')} — ${card.code}`, `<p>${esc(card.buyerName)} (${esc(card.buyerEmail)}) · ${eur(card.amount, 'it')} · ${esc(card.code)}${card.demo ? ' · DEMO' : ''}</p>`);
  } catch (e) {
    console.error('gift card email error', e);
  }
}

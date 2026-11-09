import 'server-only';
import { claimReview, releaseReview, reviewCandidates, suppressedEmails } from './booking-store';
import { sendReviewRequestEmail } from './email';
import { addDays, romeNow, romeToDate } from './hours';

export interface ReviewReport {
  /** false se manca GOOGLE_REVIEW_URL: nessuna richiesta viene inviata */
  enabled: boolean;
  /** true se in questo momento siamo fuori dalla fascia oraria di invio */
  quietHours: boolean;
  checked: number; sent: number; skipped: number; failed: number; suppressed: number;
}

/** Link diretto "scrivi una recensione" del profilo Google, es. https://g.page/r/XXXX/review (da GOOGLE_REVIEW_URL). */
export function reviewUrl(): string | null {
  const raw = process.env.GOOGLE_REVIEW_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' ? u.toString() : null;
  } catch { return null; }
}

/**
 * Chi riceve la richiesta:
 *  - 'opt_in' (predefinito): solo chi ha spuntato la casella al momento della prenotazione (o l'ha concesso allo staff).
 *  - 'all_seated': tutti gli ospiti serviti. Da usare solo dopo conferma legale (marketing/legittimo interesse):
 *    la disiscrizione in un clic resta sempre attiva.
 */
const audience = () => (process.env.REVIEW_AUDIENCE === 'all_seated' ? 'all_seated' : 'opt_in');

/** Fascia oraria di invio, ora di Roma, "da-a" (es. "9-21"). Evita email di notte. */
function sendWindow(): [number, number] {
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(process.env.REVIEW_SEND_HOURS ?? '9-21');
  const a = m ? Number(m[1]) : 9, b = m ? Number(m[2]) : 21;
  return [Math.min(a, 24), Math.min(b, 24)];
}

const DELAY_HOURS = Number(process.env.REVIEW_DELAY_HOURS ?? 3);      // dopo l'orario della prenotazione
const MAX_AGE_HOURS = Number(process.env.REVIEW_MAX_AGE_HOURS ?? 72); // oltre, la richiesta non ha più senso

/** Invia le richieste di recensione dovute. Da chiamare spesso (ogni ora). Idempotente. */
export async function runReviewRequests(now: Date = new Date()): Promise<ReviewReport> {
  const url = reviewUrl();
  const report: ReviewReport = { enabled: !!url, quietHours: false, checked: 0, sent: 0, skipped: 0, failed: 0, suppressed: 0 };
  if (!url) return report;

  const n = romeNow(now);
  const [from, to] = sendWindow();
  if (n.time < from || n.time >= to) { report.quietHours = true; return report; }

  const candidates = await reviewCandidates(addDays(n.ymd, -4), n.ymd);
  const due = candidates.filter((b) => {
    const h = (now.getTime() - romeToDate(b.date, b.time).getTime()) / 3_600_000;
    return h >= DELAY_HOURS && h <= MAX_AGE_HOURS && (audience() === 'all_seated' || b.reviewOptIn);
  });
  if (!due.length) return report;

  // Chi si è disiscritto in una qualsiasi prenotazione non riceve più nulla, nemmeno dalle successive
  const blocked = await suppressedEmails([...new Set(due.map((b) => b.email))]);

  for (const b of due) {
    if (blocked.has(b.email.toLowerCase())) { report.suppressed++; continue; }
    report.checked++;
    if (!(await claimReview(b.id))) continue;
    const res = await sendReviewRequestEmail(b, url);
    if (res === 'sent') { report.sent++; continue; }
    await releaseReview(b.id); // riprova alla prossima esecuzione
    if (res === 'skipped') report.skipped++; else report.failed++;
  }
  return report;
}

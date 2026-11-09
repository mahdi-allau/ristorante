import 'server-only';
import { REMINDER_LEAD_HOURS, REMINDER_MIN_HOURS } from '@/content/site';
import { claimReminder, releaseReminder, reminderCandidates } from './booking-store';
import { sendReminderEmail } from './email';
import { addDays, romeNow, romeToDate } from './hours';

export interface ReminderReport { checked: number; sent: number; skipped: number; failed: number }

/**
 * Invia i promemoria dovuti. Va chiamato spesso (es. ogni ora): ogni prenotazione riceve il promemoria
 * quando mancano al massimo REMINDER_LEAD_HOURS ore all'arrivo, ma non se ne mancano meno di REMINDER_MIN_HOURS
 * (le prenotazioni dell'ultimo minuto non ricevono un promemoria superfluo). Idempotente.
 */
export async function runReminders(now: Date = new Date()): Promise<ReminderReport> {
  const report: ReminderReport = { checked: 0, sent: 0, skipped: 0, failed: 0 };
  const today = romeNow(now).ymd;
  // L'arrivo può cadere in oggi o nei due giorni successivi a seconda dell'ora: si filtra poi sull'istante esatto
  const candidates = await reminderCandidates(today, addDays(today, 2));
  const minMs = REMINDER_MIN_HOURS * 3_600_000;
  const maxMs = REMINDER_LEAD_HOURS * 3_600_000;

  for (const b of candidates) {
    const ms = romeToDate(b.date, b.time).getTime() - now.getTime();
    if (ms < minMs || ms > maxMs) continue;
    report.checked++;

    // Prenota l'invio prima di spedire: due esecuzioni sovrapposte non inviano due volte
    if (!(await claimReminder(b.id))) continue;
    const result = await sendReminderEmail(b);
    if (result === 'sent') { report.sent++; continue; }
    await releaseReminder(b.id); // riprova al prossimo giro (provider non configurato o errore temporaneo)
    if (result === 'skipped') report.skipped++; else report.failed++;
  }
  return report;
}

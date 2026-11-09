import type { Locale } from './config';
import { manageTr } from './manage-tr';

const it = {
  eyebrow: 'La tua prenotazione',
  title: 'Gestisci la prenotazione',
  guests: ['1 persona', '{n} persone'],
  confirmedByGuest: 'Presenza confermata. Grazie, ti aspettiamo!',
  statusActive: 'Prenotazione confermata',
  confirmBtn: 'Confermo che ci sarò',
  cancelBtn: 'Annulla la prenotazione',
  cancelAsk: 'Vuoi davvero annullare la prenotazione? Il tavolo tornerà disponibile per altri clienti.',
  cancelYes: 'Sì, annulla',
  cancelNo: 'No, la mantengo',
  cancelled: 'La prenotazione è stata annullata. Speriamo di vederti presto.',
  tooLate: 'Mancano meno di {h} ore: per modificare o annullare chiamaci al {phone}.',
  past: 'Questa prenotazione è già passata.',
  newBooking: 'Prenota di nuovo',
  call: 'Chiama il ristorante',
  errors: { generic: 'Qualcosa è andato storto. Riprova o chiamaci.', rate: 'Troppe richieste. Riprova tra poco.', too_late: 'Mancano meno di {h} ore: chiamaci per modificare o annullare.', cancelled: 'La prenotazione risulta già annullata.', past: 'Questa prenotazione è già passata.' },
  notFound: { title: 'Prenotazione non trovata', text: 'Il link non è valido o è scaduto. Se hai bisogno, chiamaci.' },
  address: 'Dove',
  unsub: {
    title: 'Non ricevere più queste email',
    text: "Vuoi smettere di ricevere le email con l'invito a lasciare una recensione? Non ti scriveremo più per questo motivo.",
    button: 'Non inviarmi più queste email',
    done: 'Fatto. Non riceverai più le richieste di recensione.',
    error: 'Qualcosa è andato storto. Riprova tra poco.',
  },
};

export type ManageDict = typeof it;

const en: ManageDict = {
  eyebrow: 'Your booking',
  title: 'Manage your booking',
  guests: ['1 guest', '{n} guests'],
  confirmedByGuest: 'Attendance confirmed. Thank you, we look forward to seeing you!',
  statusActive: 'Booking confirmed',
  confirmBtn: "I'll be there",
  cancelBtn: 'Cancel booking',
  cancelAsk: 'Do you really want to cancel? The table will be offered to other guests.',
  cancelYes: 'Yes, cancel',
  cancelNo: 'No, keep it',
  cancelled: 'Your booking has been cancelled. We hope to see you soon.',
  tooLate: 'Less than {h} hours to go: to change or cancel please call us on {phone}.',
  past: 'This booking is already in the past.',
  newBooking: 'Book again',
  call: 'Call the restaurant',
  errors: { generic: 'Something went wrong. Please try again or call us.', rate: 'Too many requests. Please try again shortly.', too_late: 'Less than {h} hours to go: please call us to change or cancel.', cancelled: 'This booking is already cancelled.', past: 'This booking is already in the past.' },
  notFound: { title: 'Booking not found', text: 'The link is invalid or has expired. If you need help, call us.' },
  address: 'Where',
  unsub: {
    title: 'Stop these emails',
    text: 'Do you want to stop receiving emails inviting you to leave a review? We will not write to you about this again.',
    button: 'Stop sending me these emails',
    done: 'Done. You will no longer receive review requests.',
    error: 'Something went wrong. Please try again shortly.',
  },
};

export const manageDict: Record<Locale, ManageDict> = { it, en, ...manageTr };

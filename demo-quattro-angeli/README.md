# Osteria I Quattro Angeli — sito ristorante (Next.js)

Sito dimostrativo di un ristorante di fantasia, costruito seguendo le skill `rist-*` in `../.claude/skills/`.
Tutti i dati (nome, indirizzo, P.IVA, piatti, recensioni) sono **fittizi**: vanno sostituiti con quelli del cliente (cerca `TODO-CLIENTE` e `src/content/`).

## Avvio

```bash
npm install
cp .env.example .env.local   # facoltativo: senza variabili il sito gira in modalità DEMO
npm run dev                  # http://localhost:3001
npm run build && npm start   # produzione
```

## Cosa c'è

| Area | Dove |
|---|---|
| Pagine IT (`/`) e EN (`/en`), middleware lingua | `src/middleware.ts`, `src/app/[locale]/` |
| Testi IT/EN | `src/i18n/dictionaries.ts` |
| Dati fissi del locale (nome, indirizzo, P.IVA) | `src/content/site.ts` |
| **Pannello /admin** per menu, orari, chiusure e avviso | `src/app/admin/`, `src/app/api/admin/` |
| Archivio contenuti (Supabase o file) e validazione | `src/lib/content-store.ts`, `src/content/validation.ts` |
| Valori iniziali di menu e orari | `src/content/defaults.ts`, `src/content/menu.ts` |
| Gift card: acquisto, carta, webhook, riscatto | `src/app/[locale]/gift-card/`, `src/app/api/gift-card/`, `src/app/api/stripe/webhook/`, `src/lib/gift-store.ts` |
| Prenotazione (UI) | `src/components/BookingForm.tsx` |
| API disponibilità e prenotazione (zod, honeypot, rate limit) | `src/app/api/` |
| Database prenotazioni (Supabase) | `supabase/schema.sql` |
| Email di conferma (Resend) | `src/lib/email.ts` |
| Cookie banner con consenso, GA4 solo dopo consenso | `src/components/CookieBanner.tsx`, `Analytics.tsx` |
| SEO: JSON-LD Restaurant/Menu, hreflang, sitemap, robots, OG image | `src/lib/schema.ts`, `src/lib/meta.ts`, `src/app/*.ts` |
| Pagine privacy / cookie / allergeni (testi-modello) | `src/i18n/dictionaries.ts` → `legal` |

## Modalità demo vs reale

- **Demo** (nessuna variabile Supabase): le disponibilità sono simulate e le prenotazioni **non vengono salvate**.
- **Reale**: crea un progetto Supabase, esegui `supabase/schema.sql`, imposta `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (solo server). Imposta `RESEND_API_KEY`, `RESEND_FROM`, `OWNER_EMAIL` per le email.

## Pannello del ristoratore (/admin)

Il ristoratore modifica da solo, senza programmatore:

- **Menu**: piatti, prezzi, descrizioni IT/EN, allergeni, vegetariano, ordine, e "Disponibile" per nascondere un piatto senza cancellarlo.
- **Orari** settimanali (più fasce al giorno) e **chiusure straordinarie** (ferie, eventi privati): alimentano home, stato "aperto ora", dati strutturati per Google e disponibilità delle prenotazioni.
- **Avviso** in homepage (es. ferie), in italiano e inglese.

Al salvataggio le pagine pubbliche si aggiornano subito (revalidate on-demand).

Attivazione: imposta `ADMIN_PASSWORD` e `ADMIN_SECRET` (almeno 24 caratteri casuali, es. `openssl rand -hex 32`). Senza, il pannello è spento. In sviluppo c'è già un `.env.local` con valori di prova (ignorato da git).

- **Archivio**: con Supabase configurato i contenuti stanno nella tabella `site_content` (esegui `supabase/schema.sql`); senza, in `data/content.json` (va bene in locale o su un server con disco scrivibile, **non** su hosting serverless).
- **Sicurezza**: password unica, sessione firmata di 8 ore in cookie httpOnly/SameSite=Strict, limite di tentativi in memoria, validazione zod lato server. Non ci sono utenti multipli né registro delle modifiche.

## Gift card (Stripe)

Pagina `/gift-card` (IT) e `/en/gift-card`: il cliente sceglie l'importo (20–500 €, configurabile), inserisce destinatario e messaggio, paga con Stripe Checkout. La carta viene **attivata solo dal webhook firmato di Stripe**, poi parte l'email al cliente e al destinatario con il codice (formato `XXXX-XXXX-XXXX`) e il link alla pagina stampabile.

- **Riscatto in sala**: dal pannello `/admin` → tab *Gift card*: cerca il codice, vedi saldo e scadenza, scala l'importo speso (anche in più volte). Il riscatto è atomico: due operazioni simultanee non possono superare il saldo.
- **Validità**: 24 mesi dall'acquisto (`GIFT_VALID_MONTHS` in `src/lib/gift-store.ts`) — da far validare dal consulente legale insieme alle condizioni (`/gift-card/condizioni`).
- **Archivio**: tabelle `gift_cards` e `gift_card_redemptions` + funzione `redeem_gift_card` in `supabase/schema.sql`; senza Supabase, file `data/gift-cards.json` (solo locale/disco scrivibile).

Attivazione con Stripe (usa prima la modalità **test**):

1. Dashboard Stripe → chiavi API → copia la chiave segreta in `STRIPE_SECRET_KEY`.
2. Webhook: endpoint `https://tuodominio.it/api/stripe/webhook`, eventi `checkout.session.completed` e `checkout.session.async_payment_succeeded`; copia il segreto di firma in `STRIPE_WEBHOOK_SECRET`. In locale: `stripe listen --forward-to localhost:3001/api/stripe/webhook`.
3. Imposta anche `NEXT_PUBLIC_SITE_URL` (serve per gli URL di ritorno) e le variabili Resend per le email.
4. Prova un acquisto con la carta di test `4242 4242 4242 4242`, poi passa alle chiavi live.

Sicurezza: senza `STRIPE_SECRET_KEY` l'acquisto è **bloccato in produzione** (pagina "non disponibile", API 503). La modalità demo (carta attivata senza pagamento) esiste solo fuori produzione o con `GIFT_CARD_DEMO=1`: non impostarla mai su un sito pubblico. Il corpo del webhook viene verificato con la firma, si controlla che valuta (EUR) e importo corrispondano alla carta e gli eventi ripetuti sono ignorati.

## Promemoria e gestione delle prenotazioni

- **Conferma immediata**: dopo la prenotazione il cliente riceve un'email con il giorno, l'ora e il link personale "Gestisci la prenotazione".
- **Promemoria 24 ore prima**: un job pianificato chiama `POST /api/cron/reminders` ogni ora. Ogni prenotazione riceve **una sola** email quando mancano al massimo 24 ore all'arrivo (non se ne mancano meno di 2: le prenotazioni dell'ultimo minuto non ricevono un promemoria inutile). Se l'invio fallisce o non c'è un provider email, la prenotazione resta in coda e si riprova all'esecuzione successiva.
- **Pagina `/booking/<token>`** (IT e EN): il cliente conferma la presenza o annulla in un tocco. L'annullamento libera subito i coperti ed è consentito fino a 2 ore prima (`CANCEL_CUTOFF_HOURS` in `src/content/site.ts`); dopo, la pagina invita a telefonare. Le azioni passano da POST: aprire il link (anche da antivirus o anteprime email) non cambia mai nulla. Il ristorante riceve un'email quando un cliente conferma o annulla (`OWNER_EMAIL`).
- **Token**: 24 caratteri casuali (~144 bit) nel link; la pagina non è indicizzata né in cache.

Attivazione:

1. Esegui la parte "Promemoria e gestione prenotazione" di `supabase/schema.sql` (aggiunge colonne a `bookings` e la nuova versione di `create_booking` con il token).
2. Imposta `CRON_SECRET` (almeno 16 caratteri casuali) e le variabili Resend (`RESEND_API_KEY`, `RESEND_FROM`).
3. Pianifica la chiamata oraria, a scelta: **Vercel** (`vercel.json` incluso, invia da solo l'header di autorizzazione), **Netlify** (`netlify/functions/send-reminders.mts` inclusa, usa `@hourly`), oppure qualunque scheduler esterno (es. cron-job.org) con `POST https://tuodominio.it/api/cron/reminders` e header `Authorization: Bearer <CRON_SECRET>`.

Sviluppo: con `BOOKING_STORE=file` le prenotazioni si salvano in `data/bookings.json` e con `EMAIL_OUTBOX=1` le email non partono ma finiscono in `data/outbox/`, così si può provare tutto senza servizi esterni. Non usare queste due variabili in produzione.

Per ora i promemoria sono solo via email; SMS o WhatsApp richiedono un provider (es. Twilio) e il consenso del cliente.

## Pannello sala (tab "Sala" in /admin)

L'agenda del giorno per chi gestisce la sala, pensata per tablet e telefono (si apre per prima, sulla data di oggi):

- **Agenda per orario**, con coperti occupati / capienza dello slot (barra che diventa rossa in overbooking), totale coperti, pranzo e cena, annullate e no-show. Si aggiorna da sola ogni minuto.
- **Stati**: In attesa → *Arrivato* (al tavolo) → *Concluso*, più *No-show*, *Annulla* e *Ripristina*. Annullate e no-show liberano subito i coperti (e quindi gli slot sul sito); le prenotazioni al tavolo o concluse continuano a occuparli.
- **Nuova prenotazione** da telefono o walk-in (email facoltativa: senza email non parte alcun promemoria), con note del cliente (allergie, ricorrenze, evidenziate) e **note interne** dello staff.
- **Modifica / sposta**: cambia data, ora, persone e dati. Se cambiano data o ora, promemoria e conferma del cliente ripartono da zero. La capienza si controlla quando l'operazione può riempire lo slot; se è pieno il pannello chiede se inserire lo stesso (**overbooking**).
- **Stampa** del foglio sala e **CSV** del giorno o dei prossimi 30 giorni (separatore `;`, BOM per Excel; celle che iniziano con `=`, `+`, `-`, `@` neutralizzate contro la CSV injection, i numeri di telefono restano leggibili).
- Il token del link cliente non viene mai mostrato nel pannello.

Per Supabase eseguire anche la parte "Pannello sala" di `supabase/schema.sql` (colonne `source`, `staff_note`, stato `seated`, funzione `staff_update_booking`).

Non incluso: mappa/assegnazione dei tavoli (la capienza è per slot, non per tavolo), lista d'attesa, email al cliente quando lo staff sposta la prenotazione, utenti staff separati dal titolare e registro delle modifiche.

## Richieste di recensione dopo la visita

Dopo la serata il cliente riceve **una sola email** con un pulsante che porta direttamente alla scrittura della recensione su Google. Parte dallo stesso job orario dei promemoria (`/api/cron/reminders`): nessuno scheduler in più.

Quando parte la richiesta (tutte le condizioni insieme):
- il tavolo risulta **servito** nel pannello sala (*Arrivato* o *Concluso*): chi è *In attesa*, no-show o annullato non riceve nulla;
- ha un'email, non ha già ricevuto la richiesta e non si è disiscritto (la disiscrizione vale per tutte le sue prenotazioni, anche future);
- sono passate almeno 3 ore dall'orario della prenotazione e non più di 72;
- è giorno e ora "civili": di default tra le 9 e le 21 (ora di Roma), mai di notte;
- ha **dato il consenso** (modalità predefinita `opt_in`): nel modulo di prenotazione c'è una casella facoltativa dedicata, e lo staff può spuntarla per le prenotazioni telefoniche.

Regole di correttezza incorporate (Google vieta il contrario):
- **stesso messaggio e stesso link per tutti**: nessuna domanda "com'è andata?" che mandi i clienti contenti su Google e gli scontenti altrove (*review gating*). Per chi ha avuto un problema c'è solo l'invito a rispondere all'email;
- **nessun premio, sconto o omaggio** in cambio della recensione;
- disiscrizione in un clic (pagina `/unsubscribe/<token>` + intestazioni `List-Unsubscribe` one-click per Gmail/Apple Mail), solo via POST: aprire il link non disiscrive nessuno.

Attivazione: imposta `GOOGLE_REVIEW_URL` con il link diretto di Google Business Profile ("Chiedi recensioni", forma `https://g.page/r/XXXX/review`); senza link la funzione è spenta. Variabili opzionali: `REVIEW_AUDIENCE`, `REVIEW_SEND_HOURS`, `REVIEW_DELAY_HOURS`, `REVIEW_MAX_AGE_HOURS` (vedi `.env.example`). Per Supabase esegui la parte "Richieste di recensione" di `supabase/schema.sql`.

**Da far validare legalmente** prima di passare a `REVIEW_AUDIENCE=all_seated` (richiesta a tutti gli ospiti serviti, senza casella): una richiesta di recensione può essere considerata comunicazione promozionale e richiedere consenso o una base giuridica solida. L'informativa privacy include già la riga sulla richiesta di recensione (testo-modello).

## Qualità e verifica finale

Risultati (Lighthouse desktop 100/100/100/100, mobile simulato 96–100; test automatici su prenotazioni, promemoria, sala, gift card, recensioni, SEO e API), problemi trovati e risolti, rischi noti e checklist completa di messa online sono in [`../docs/LANCIO.md`](../docs/LANCIO.md).

## Da fare prima di venderlo a un cliente reale

1. Sostituire dati, foto e testi (il servizio fotografico è la parte che pesa di più sulla percezione di valore).
2. Configurare il pannello /admin (vedi sopra) e formare il ristoratore.
3. Testare la prenotazione reale (Supabase + email + cron dei promemoria + pannello sala) contro i servizi veri.
4. Far validare privacy/cookie/allergeni da un consulente legale; scegliere il fornitore del consenso cookie definitivo.
5. Aggiungere CSP, rate limit distribuito (Upstash) se il deploy è serverless, monitoraggio uptime.
6. Eseguire la checklist di `../.claude/skills/rist-lancio-qa/SKILL.md` (Lighthouse, accessibilità, cross-browser).

## Limiti noti

- Pannello admin e sala: una sola password condivisa, nessuna cronologia/annulla; non provati con Supabase reale (le funzioni SQL `staff_update_booking` e `create_booking` aggiornate non sono state eseguite).
- Nessun test automatico (Playwright non ancora configurato).
- RPC `create_booking`/`redeem_gift_card`, le colonne aggiunte a `bookings` e l'invio email (Resend) non sono stati provati contro servizi reali: i promemoria sono verificati solo con archivio su file e email scritte in `data/outbox/` (idem per le richieste di recensione: il link Google usato nei test è finto).
- Promemoria e richieste di recensione solo via email (niente SMS/WhatsApp). Le richieste di recensione dipendono dal fatto che la sala segni i tavoli come *Arrivato/Concluso*; nessuna risposta automatica alle recensioni né monitoraggio del rating.
- Foto: segnaposto grafici.
- Stripe: il webhook è provato con eventi firmati in locale, ma **mai con un pagamento Stripe reale o in modalità test**; Checkout Session, email Resend e le tabelle gift card su Supabase non sono state provate contro servizi veri.
- Gift card: nessun rimborso/annullamento dal pannello (si fa da Stripe e impostando la carta come `void` a mano), nessun QR code.
- Newsletter e form richiesta eventi non sono implementati in questa versione.

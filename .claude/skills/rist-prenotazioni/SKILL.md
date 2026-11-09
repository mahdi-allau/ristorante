---
name: rist-prenotazioni
description: Sistema di prenotazione tavoli, lista d'attesa, richiesta eventi, gift card, caparre e newsletter per il sito di un ristorante. Usa quando si deve implementare o scegliere il motore di prenotazione, le email di conferma, i pagamenti Stripe, i buoni regalo, o integrare TheFork/OpenTable/Google Reserve.
---

# Prenotazioni e vendite online

Il sito deve trasformare visite in tavoli prenotati con **massimo 3 tocchi** da mobile.

## 1. Due strade (scegli con il cliente)
**A. Motore proprio (consigliato per il pacchetto premium)** — controllo totale, zero commissioni per coperto.
**B. Integrazione di una piattaforma** (TheFork Manager, Quandoo, Resy, OpenTable, Tableo, Covermanager): più veloce, ma commissioni e dati del cliente non tuoi. Incorpora il loro widget stilizzato e invia gli eventi a GA4.
Si può combinare: motore proprio sul sito, TheFork solo come canale aggiuntivo con quota di tavoli dedicata.

## 2. Motore proprio — requisiti
Tabelle Supabase: `tables`, `services` (pranzo/cena con orari e turni), `bookings`, `waitlist`, `blackout_dates`, `customers` (con consenso marketing separato).
Flusso:
1. Data → n. persone → fascia oraria (solo slot realmente disponibili)
2. Nome, telefono, email, note (allergie, occasioni), seggiolone, dehors/sala
3. Conferma immediata o a approvazione (per gruppi > N)
4. Email + WhatsApp/SMS di conferma, **promemoria 24 h prima** con link "conferma o cancella" (riduce i no-show del 30–50%)
5. Pannello sala (tablet): agenda del giorno, spostamento tavoli, blocco date, esportazione CSV
6. Lista d'attesa automatica se pieno
Regole: durata tavolo per numero ospiti, buffer fra turni, limite coperti per fascia, anticipo minimo/massimo, tavoli unibili, no sovrapposizioni (transazioni DB + vincoli unici).

## 3. Anti no-show
- **Caparra Stripe** (Payment Intent a carta, autorizzazione o addebito) per gruppi ≥ 6, serate speciali, degustazioni: es. 20 €/persona rimborsabile fino a 24–48 h prima
- Policy di cancellazione chiara, reCAPTCHA/Turnstile invisibile contro lo spam, rate limit sull'API
- Blacklist soft per chi non si presenta ripetutamente

## 4. Eventi e private dining
Form richiesta preventivo (data, numero ospiti, tipo evento, budget, menu preferito, allergie), invio al responsabile + risposta automatica con PDF brochure, pipeline in CRM (tabella `leads`), follow-up a 24 h e 72 h. Pagina dedicata per matrimoni, cene aziendali, compleanni, con galleria e capienze.

## 5. Gift card (ricavo extra, specie Natale/San Valentino/Festa della mamma)
Importi predefiniti + libero, personalizzazione messaggio, invio programmato via email con PDF elegante e codice QR, pagamento Stripe, codice univoco, riscatto in sala dal pannello, scadenza e saldo residuo. Collegare a fatturazione/contabilità del cliente.

## 6. Asporto e delivery (solo se richiesto)
Menu "da portare via" con fasce di ritiro, pagamento online, stampa comanda automatica, zona di consegna. Valuta Shopify (connettore disponibile) o un modulo dedicato; evita commissioni delle piattaforme quando possibile.

## 7. CRM e newsletter
Raccolta iscritti con doppio opt-in, segmenti (compleanni, VIP, eventi, vegetariani), campagne stagionali, automazioni (benvenuto, dopo-visita + richiesta recensione, "ti aspettiamo" dopo 60 giorni di assenza). Strumenti: Mailchimp, Klaviyo, beehiiv (vedi `docs/CONNETTORI.md`).

## 8. Google Prenota un tavolo / Reserve with Google
Se il motore o la piattaforma sono partner, attiva il pulsante "Prenota" direttamente nel profilo Google e in Maps. Altrimenti usa il link prenotazione del GBP con UTM.

## 9. Eventi analytics da tracciare
`booking_start`, `booking_slot_selected`, `booking_submit`, `booking_confirmed`, `booking_cancelled`, `giftcard_purchase`, `event_request`, `newsletter_signup`. Tasso di completamento > 35% dal primo passo.

## 10. Legale
Informativa privacy nel form, checkbox marketing **separata e non pre-spuntata**, conservazione dati limitata, DPA con i fornitori (vedi `rist-legale`).

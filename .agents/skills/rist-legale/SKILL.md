---
name: rist-legale
description: Conformità legale del sito di un ristorante in Italia/UE (GDPR, cookie, privacy, allergeni, dati societari, accessibilità, prezzi, recensioni). Usa prima del lancio o quando si aggiungono form, analytics, mappe, newsletter, gift card, recensioni. Non sostituisce un legale: segnala punti da far validare.
---

# Checklist legale sito ristorante (Italia/UE)

> Nota: non sono un avvocato. Fai validare i testi finali da un consulente privacy/legale del cliente. Questa è una guida operativa.

## 1. Dati obbligatori in footer
Ragione sociale, sede legale, P.IVA, codice fiscale, REA/Camera di Commercio, capitale sociale (se società), PEC o email, telefono. (D.Lgs. 70/2003 e art. 2250 c.c.)

## 2. Privacy e GDPR
- **Informativa privacy** completa (titolare, finalità: prenotazioni, preventivi eventi, newsletter, gift card; basi giuridiche; tempi di conservazione; destinatari; diritti; contatti DPO se presente)
- **Informativa breve** sotto ogni form + link; checkbox per il marketing **separata, facoltativa, non pre-selezionata**
- Registro dei trattamenti e contratti di nomina responsabile (DPA) con: hosting, Supabase, Resend, Stripe, Mailchimp, ecc. Preferire server UE
- Retention: prenotazioni 12–24 mesi, lead 24 mesi, newsletter fino a revoca; cancellazione automatica pianificata
- Doppio opt-in newsletter, link di disdetta in ogni email

## 3. Cookie
- Banner conforme alle Linee guida del Garante (giugno 2021): pulsanti **Accetta / Rifiuta / Personalizza** con pari evidenza, nessun cookie non tecnico prima del consenso, nessun cookie wall, consenso ripetibile dopo 6 mesi
- Consent Mode v2 per Google (Analytics/Ads), blocco preventivo di mappe, YouTube/Vimeo, pixel Meta, widget di terzi fino al consenso
- **Cookie policy** con elenco aggiornato e pulsante "Gestisci cookie" nel footer
- Strumenti: Iubenda, Cookiebot, Klaro (open source), Orestbida CookieConsent

## 4. Allergeni e informazioni alimentari
- Reg. UE 1169/2011 e D.Lgs. 231/2017: indicare i **14 allergeni** (glutine, crostacei, uova, pesce, arachidi, soia, latte, frutta a guscio, sedano, senape, sesamo, solfiti, lupini, molluschi) per ogni piatto, sul menu web e cartaceo, o rimando chiaro al personale
- Dicitura su prodotto congelato/abbattuto ("decongelato", "surgelato") dove applicabile
- Prezzi in euro, IVA inclusa, coperto e servizio dichiarati chiaramente (Codice del Consumo)

## 5. Gift card, caparre e vendite online
Condizioni generali di vendita, diritto di recesso (esclusioni per servizi con data/ora specifica, art. 59 Cod. Cons.), politica di cancellazione e rimborso, scadenza buoni, informazioni sul pagamento (Stripe, PCI-DSS). Fatturazione/scontrino elettronico gestiti dal cliente.

## 6. Recensioni e claim
- Mostrare solo recensioni reali, con fonte; **vietato** acquistare o incentivare recensioni positive o nascondere le negative (Direttiva Omnibus, AGCM)
- Premi e guide (Michelin, Gambero Rosso…) solo se veri e aggiornati; chiedere liberatoria per foto con persone riconoscibili e per citazioni

## 7. Immagini e licenze
Foto/font/icone con licenza documentata (file `docs/licenze.md`), liberatoria per fotografo e modelli, musica del video con licenza.

## 8. Accessibilità
Allineamento a WCAG 2.1 AA; dal 28 giugno 2025 l'European Accessibility Act (recepito in Italia) riguarda i servizi di e-commerce e prenotazione online. Redigere **dichiarazione di accessibilità** se rientra nell'ambito e verificare con axe/Lighthouse + test da tastiera.

## 9. Pagine da creare
`/privacy`, `/cookie`, `/termini-gift-card`, `/allergeni`, `/accessibilita`, eventuale `/note-legali`.

## 10. Contratto con il ristoratore
Proprietà del codice e dei contenuti, licenze terze parti, manutenzione, responsabilità sui contenuti, privacy (tu sei responsabile del trattamento per l'hosting se lo gestisci), SLA. Vedi `rist-vendita`.

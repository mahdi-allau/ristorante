---
name: rist-master
description: Orchestratore per costruire il sito completo di un ristorante da A a Z (livello agenzia, valore 10.000 euro). Usa quando l'utente dice "nuovo sito ristorante", "costruisci il sito per il ristorante X", "da zero a online", o chiede di coordinare brief, design, sviluppo, SEO locale, prenotazioni, legale, lancio e vendita.
---

# Sito ristorante A→Z — Orchestratore

Obiettivo: consegnare un sito elegante, veloce, che **riempie i tavoli** e fa salire il ristorante su Google Maps e nelle ricerche locali. Non è un "sito vetrina": è una macchina di prenotazioni.

## Principi non negoziabili
1. **Mobile first**: il 80%+ dei clienti arriva da telefono, spesso camminando in strada ("ristorante vicino a me"). Telefono, mappa e "Prenota" sempre a un tocco.
2. **Il tavolo prenotato è la metrica**. Ogni pagina ha una sola azione primaria: Prenota.
3. **Lusso = sottrazione**: tanto spazio bianco, pochissimi font, foto vere e curate, animazioni lente e sottili. Niente template riconoscibili.
4. **Velocità**: LCP < 2,0 s su 4G, Lighthouse ≥ 95 su tutti e 4 gli indici.
5. **Il ristoratore è autonomo**: aggiorna menu, orari, eventi da solo, senza programmatore.
6. **Mai inventare** dati del cliente (indirizzo, orari, P.IVA, piatti, recensioni). Se manca, chiedere o segnare `TODO-CLIENTE`.

## Fasi (esegui in ordine, una skill per fase)
| # | Fase | Skill | Output |
|---|------|-------|--------|
| 0 | Vendita e preventivo | `rist-vendita` | proposta, contratto, acconto |
| 1 | Brief e raccolta materiali | `rist-brief` | `docs/brief.md`, checklist materiali |
| 2 | Identità e design system | `rist-design` | token, tipografia, layout, moodboard |
| 3 | Sviluppo sito | `rist-build` | repo Next.js funzionante |
| 4 | SEO locale + Google | `rist-seo-locale` | schema, GBP, citazioni, keyword |
| 5 | Prenotazioni, menu, vendite online | `rist-prenotazioni` | booking, gift card, eventi |
| 6 | Legale e privacy | `rist-legale` | cookie, privacy, allergeni |
| 7 | QA e lancio | `rist-lancio-qa` | online, dominio, analytics |
| 8 | Crescita post-lancio | `rist-crescita` | recensioni, ads, newsletter, social |

## Procedura
1. Crea la cartella `docs/` e un file `docs/STATO.md` con le fasi e lo stato (da fare / in corso / fatto).
2. Parti sempre da `rist-brief`. Senza brief non si disegna né si scrive codice.
3. Dopo ogni fase: aggiorna `STATO.md`, mostra un'anteprima al cliente (screenshot o URL di preview), raccogli feedback prima di passare oltre.
4. Prima del lancio esegui l'intera checklist di `rist-lancio-qa`. Non pubblicare se un punto "bloccante" è rosso.
5. A fine progetto consegna: credenziali, guida PDF di 1 pagina per il ristoratore, video di formazione di 10 minuti, piano di crescita a 90 giorni.

## Stack di riferimento (cambialo solo con motivo)
- **Next.js (App Router) + TypeScript + Tailwind CSS**, immagini con `next/image`
- **CMS headless (Sanity)** per menu, orari, eventi, galleria, ferie/chiusure
- **Supabase** per prenotazioni, lista d'attesa, newsletter, gift card
- **Resend** per email transazionali (conferma, promemoria)
- **Stripe** per caparre e gift card
- **Netlify** per hosting e deploy (connettore disponibile), CDN, form, preview per ramo
- Analytics: **GA4 + Google Search Console + Google Tag Manager**, rispetto del consenso
- Alternativa per ristoratori che vogliono il minimo costo: WordPress.com o Wix (vedi `docs/CONNETTORI.md`), ma il valore di 10.000 € si giustifica con codice su misura.

Vedi `docs/CONNETTORI.md` per l'elenco completo dei connettori e a cosa servono.

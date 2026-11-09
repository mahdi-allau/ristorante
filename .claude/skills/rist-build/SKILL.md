---
name: rist-build
description: Sviluppo tecnico del sito del ristorante con Next.js, Tailwind, CMS headless, i18n, performance e deploy. Usa quando si deve creare il repository, strutturare le pagine, collegare il CMS per menu/orari, implementare il multilingua o ottimizzare velocità e Core Web Vitals.
---

# Sviluppo sito ristorante

## 1. Setup
```bash
npx create-next-app@latest sito-ristorante --typescript --tailwind --app --eslint --src-dir
cd sito-ristorante
npm i next-intl @sanity/client next-sanity @sanity/image-url zod resend @supabase/supabase-js stripe framer-motion
```
Struttura:
```
src/app/[locale]/(site)/{page,menu,locale,eventi,prenota,gift-card,contatti,journal}
src/app/api/{booking,newsletter,events-request,stripe-webhook}/route.ts
src/components/{ui,sections}
src/lib/{sanity,supabase,schema-org,i18n,analytics}
sanity/ (schema: dish, menuSection, wine, openingHours, closure, event, review, page)
docs/
```

## 2. Contenuti gestibili dal ristoratore (CMS)
- **Menu**: sezioni, piatti, prezzo, descrizione IT/EN, foto, allergeni (14 UE) e flag (vegano, vegetariano, senza glutine, piccante), "piatto firma", disponibilità stagionale
- **Carta dei vini**, **menu degustazione**, **menu del giorno** con data
- **Orari + chiusure straordinarie** (alimentano home, schema.org e Google Business Profile)
- **Eventi, news, galleria, recensioni selezionate, banner avviso** (es. "Chiusi per ferie fino al 25/8")
- Pubblicazione con **ISR/revalidate on-demand** (webhook Sanity → `revalidateTag`) così gli aggiornamenti vanno online in secondi.
- Fornisci ruoli: *Titolare* (tutto), *Sala* (solo menu del giorno e prenotazioni).

## 3. Multilingua (`next-intl`)
IT (default `/`), EN `/en`, + lingue per target turistico. Tag `hreflang`, `alternate` nel sitemap, selettore lingua, URL tradotti, contenuti CMS tradotti (non traduzione automatica non rivista nei piatti).

## 4. Performance (obiettivo Lighthouse ≥ 95)
- `next/image` con `sizes`, AVIF/WebP, `priority` solo sull'hero; blur placeholder
- Font con `next/font` (self-hosted, `display: swap`, subset latin)
- Video hero: ≤ 3 MB, `preload="metadata"`, caricato dopo LCP; poster ottimizzato
- Script di terze parti (GTM, mappe, widget) caricati **dopo consenso** e con `strategy="lazyOnload"`
- Niente librerie pesanti: animazioni con CSS + `framer-motion` solo dove serve (importazione dinamica)
- Cache CDN, `Cache-Control` immutabile sugli asset, compressione Brotli
- Budget: JS iniziale < 130 KB, CLS < 0.05, INP < 200 ms

## 5. Funzioni "da 10.000 euro"
- Stato **Aperto/Chiuso ora** calcolato lato server con fuso `Europe/Rome`
- Menu stampabile (CSS `@media print`) + PDF generato; **QR code** per i tavoli che punta al menu web
- Pulsanti flottanti: **WhatsApp**, **Chiama**, **Indicazioni** (`geo:` / Google Maps deep link)
- Prima del "Prenota": **disponibilità in tempo reale** (vedi `rist-prenotazioni`)
- Pagina 404 curata, `robots.txt`, `sitemap.xml` dinamica, `manifest.webmanifest` (PWA: icona sulla home dello smartphone)
- Open Graph image dinamica per ogni pagina (`next/og`) con foto + logo, per condivisioni belle su WhatsApp/Instagram
- Pannello **statistiche semplici** per il titolare (prenotazioni, clic su telefono/mappa, fonti) via GA4 Looker Studio

## 6. Qualità del codice
TypeScript strict, ESLint, Prettier, test E2E Playwright sul flusso prenotazione, variabili d'ambiente in `.env.example` (mai segreti nel repo), CI GitHub Actions (lint + build + Lighthouse CI), preview su ogni pull request.

## 7. Deploy
Netlify (o Vercel): ramo `main` → produzione, rami → preview. Dominio, SSL, redirect `www`→apex, redirect 301 dal vecchio sito, header di sicurezza (CSP, HSTS, X-Frame-Options, Referrer-Policy).

## Definition of done
Tutte le pagine nella mappa `rist-design` pubblicate in preview, contenuti reali (non lorem), CMS usabile dal titolare in 15 minuti di formazione, Lighthouse ≥ 95 mobile.

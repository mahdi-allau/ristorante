# Verifica finale e checklist di lancio — Osteria Lumina (demo)

Stato al 3/11/2026, sulla build di produzione (`next build` + `next start`) in locale. Le cifre di Lighthouse sono misurate con Chrome headless e throttling simulato; non sostituiscono una misura su dominio reale (CrUX/PageSpeed Insights dopo il lancio).

## 1. Cosa è stato verificato

| Area | Esito |
|---|---|
| Tipi (`tsc --noEmit`) e build di produzione | ✅ senza errori |
| Lighthouse **desktop** (6 pagine) | Prestazioni 100 · Accessibilità 100 · Best practices 100 · SEO 100 · LCP 0,6 s |
| Lighthouse **mobile** (Moto G, 4G lenta, CPU 4×) | Prestazioni 96–100 · Accessibilità 100 · Best practices 100 · SEO 100 · CLS 0 · TBT ≤ 20 ms · LCP 1,7–2,8 s (simulato) |
| Test automatici contro il server locale | SEO/crawl 20 · contenuti e API 18 · promemoria 28 · pannello sala 44 · gift card e webhook Stripe 35 · recensioni 19 (+3 modalità) |
| Link interni (22), sitemap (12 URL, tutti 200), hreflang, canonical, 1 solo H1, title ≤ 70, description 50–170 | ✅ |
| Dati strutturati Restaurant + Menu (13 piatti, prezzi EUR) | ✅ JSON valido (non ancora passato dal Rich Results Test di Google) |
| Header di sicurezza: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy | ✅ (CSP provata nel browser: mappa, prenotazioni e pannello senza violazioni) |
| Pagine statiche servite dalla cache (`s-maxage`), aggiornate subito al salvataggio dal pannello | ✅ |
| Dipendenze (`npm audit --omit=dev`) | ⚠️ vedi punto 4 |

### Problemi trovati e risolti durante la verifica
- **Tutto il sito veniva renderizzato a ogni richiesta** (nessuna cache): causa `headers()` nella pagina 404. Ora le pagine sono prerenderizzate e cacheabili.
- Meta description nel `<body>` invece che nell'`<head>` (SEO 91 → 100).
- Titolo della home nascosto fino al caricamento di JavaScript (ritardava l'LCP).
- Link "IT/EN" sbagliati nelle pagine statiche italiane (`/en/it/...`).
- Ordine dei titoli nel modulo gift card (accessibilità 98 → 100).
- URL dell'immagine social con `localhost` in produzione.
- `zod` aggiornato alla v4 per una vulnerabilità di consumo di memoria (tutte le suite riprovate dopo l'aggiornamento).

## 2. Da fare prima di pubblicare per un cliente vero

**Contenuti (cerca `TODO-CLIENTE`, `src/content/site.ts`, `src/i18n/`)**
- [ ] Nome, ragione sociale, P.IVA, REA, indirizzo, telefono, email, coordinate, link social (`SITE`)
- [ ] Foto professionali (oggi segnaposto), video hero facoltativo, logo
- [ ] Menu, prezzi, allergeni, orari, chiusure (dal pannello `/admin` dopo l'attivazione)
- [ ] Testi legali (privacy, cookie, allergeni, condizioni gift card) **rivisti da un consulente**; recensioni vere (oggi una citazione d'esempio) o rimozione della sezione
- [ ] Togliere la fascia "sito dimostrativo" e le diciture di demo

**Servizi esterni (variabili in `sito-ristorante/.env.example`)**
- [ ] `NEXT_PUBLIC_SITE_URL` = dominio definitivo (https, senza slash finale)
- [ ] **Supabase**: progetto UE, eseguire `supabase/schema.sql` per intero; `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Resend**: dominio verificato (SPF/DKIM/DMARC), `RESEND_API_KEY`, `RESEND_FROM`, `OWNER_EMAIL`
- [ ] **Pannello**: `ADMIN_PASSWORD` (lunga, unica) e `ADMIN_SECRET` (≥ 24 caratteri casuali)
- [ ] **Promemoria e recensioni**: `CRON_SECRET` + job orario (Netlify/Vercel/esterno), `GOOGLE_REVIEW_URL`
- [ ] **Stripe** (gift card): prima chiavi di test + webhook di test e un acquisto con `4242 4242 4242 4242`, poi chiavi live; **non** impostare `GIFT_CARD_DEMO`
- [ ] **Google Analytics 4**: `NEXT_PUBLIC_GA_ID` (si carica solo con il consenso); verificare la CSP con un evento reale
- [ ] **Non** impostare in produzione: `BOOKING_STORE`, `EMAIL_OUTBOX`, `GIFT_CARD_DEMO`
- [ ] 2FA su tutti gli account (dominio, hosting, Supabase, Stripe, Google, Resend)

**Google e visibilità (skill `rist-seo-locale`)**
- [ ] Google Business Profile verificato, orari/foto/menu, link Prenota con UTM, QR per le recensioni
- [ ] Search Console: verifica del dominio, invio di `/sitemap.xml`, richiesta di indicizzazione delle pagine chiave
- [ ] Rich Results Test sui dati strutturati; stesso NAP (nome, indirizzo, telefono) su Google, TripAdvisor, TheFork, social
- [ ] Redirect 301 dal vecchio sito (se esiste)

## 3. Messa online (esempio: Netlify)
1. Repository con il progetto; `netlify.toml` incluso (build `npm run build`, Node 22).
2. Collegare il repository, impostare le variabili d'ambiente (punto 2) e distribuire una **anteprima**.
3. Provare sull'anteprima: prenotazione completa con email, link di conferma/annullo, promemoria (chiamando il cron a mano con `CRON_SECRET`), acquisto gift card in test, riscatto dal pannello, banner cookie (nessun cookie non tecnico prima del consenso), form su iPhone e Android reali.
4. Collegare il dominio: abbassare il TTL DNS 24 ore prima, impostare i record, attendere HTTPS, redirect `www` → dominio principale.
5. Dopo il passaggio: inviare la sitemap, aggiornare l'URL su Google Business Profile e sui social, test post-lancio in 30 minuti, monitor di uptime con avviso al telefono.
6. Consegna al ristoratore: accessi (in un gestore di password), manuale di una pagina, formazione di 60 minuti, report iniziale (posizione su Maps, recensioni, traffico) per misurare i risultati.

## 4. Rischi noti e limiti accettati (da comunicare)
- **npm audit**: restano 1 avviso moderato e 1 alto legati a `next` → `postcss` (XSS/lettura file tramite CSS controllato da un attaccante). Colpisce l'elaborazione di CSS non fidato a *build time*: nel progetto il CSS è solo quello nostro, quindi non è sfruttabile. La correzione richiede **Next.js 16** (cambio di versione maggiore: da pianificare e ritestare con tutte le suite).
- **CSP** con `'unsafe-inline'` per gli script (necessario per gli script inline di Next senza nonce; con i nonce il sito non sarebbe più cacheabile). Resta vietato caricare risorse da domini non elencati.
- **Limite di richieste in memoria**: su hosting serverless (più istanze) va sostituito con un servizio condiviso (es. Upstash Redis); oggi protegge un solo processo.
- **Pannello**: una sola password condivisa, sessione di 8 ore, nessun registro delle modifiche, nessun 2FA.
- **Mai provato contro servizi reali**: Supabase (tabelle e funzioni SQL), Resend, Stripe (pagamento e webhook con eventi veri), Google Analytics, job pianificato su Netlify/Vercel. Le prove locali usano archivio su file, email scritte su disco ed eventi Stripe firmati a mano.
- **Test**: suite automatiche con script Node contro il server locale; non c'è una suite E2E nel browser (Playwright) né test su dispositivi reali. Test di tastiera/screen reader solo in parte (Lighthouse/axe automatici = 100).
- **Contenuti**: tutti di fantasia; foto segnaposto; testi legali di esempio.
- **Non incluso**: SMS/WhatsApp, newsletter, form richiesta preventivo eventi, assegnazione dei singoli tavoli, lista d'attesa, rimborso/annullo gift card dal pannello, risposta alle recensioni.

## 5. Dopo il lancio (14 giorni)
Controllare Search Console (copertura, errori), velocità reale (CrUX), conversioni (prenotazioni, gift card), log degli errori del server, consegna delle email (spam/bounce), correzioni minime incluse nel pacchetto. Poi seguire il piano a 90 giorni di `rist-crescita`.

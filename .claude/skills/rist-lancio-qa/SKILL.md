---
name: rist-lancio-qa
description: Controllo qualità e messa online del sito di un ristorante (performance, SEO tecnica, accessibilità, sicurezza, test prenotazione, DNS, analytics, consegna al cliente). Usa prima di pubblicare, durante il go-live e per la consegna finale.
---

# QA e lancio

Non pubblicare se un punto **[BLOCCANTE]** è rosso.

## 1. Funzionale
- [BLOCCANTE] Prenotazione end-to-end su iPhone, Android, desktop: conferma email, promemoria, cancellazione, pannello sala
- [BLOCCANTE] Pagamenti Stripe in modalità test e poi live con 1 transazione reale rimborsata; webhook verificato
- [BLOCCANTE] Tutti i form inviano e arrivano alla persona giusta (controlla spam, SPF/DKIM/DMARC del dominio)
- Menu: prezzi e allergeni verificati dal ristoratore **firma per accettazione**
- Orari, festivi, chiusure: coerenti con Google Business Profile
- Link telefono `tel:`, WhatsApp, mappe: funzionano da mobile
- Lingue: nessun testo mancante, nessun layout rotto

## 2. Performance e tecnica
- [BLOCCANTE] Lighthouse mobile ≥ 90 (target 95+) su Home, Menu, Prenota
- Core Web Vitals: LCP < 2,0 s, CLS < 0,05, INP < 200 ms (verifica con PageSpeed Insights e test su 4G reale)
- Immagini ottimizzate, video hero leggero, font self-hosted
- Test cross-browser: Safari iOS, Chrome Android, Chrome/Edge/Firefox/Safari desktop

## 3. SEO tecnica
- [BLOCCANTE] `robots.txt` corretto (rimuovi `noindex` della staging), `sitemap.xml` inviata a Search Console
- Redirect 301 dal vecchio sito (mappa vecchio→nuovo URL)
- Title/meta/H1 unici, canonical, hreflang, Open Graph/Twitter card
- Schema.org validato (Rich Results Test), nessun errore in Search Console
- Link interni senza 404 (crawler: Screaming Frog o `linkinator`)
- HTTPS ovunque, HSTS, nessun contenuto misto

## 4. Accessibilità
axe DevTools senza errori critici, navigazione da tastiera completa, contrasto ≥ 4.5:1, `alt` su tutte le immagini informative, form con label, focus visibile.

## 5. Sicurezza
Header di sicurezza (CSP, HSTS, X-Content-Type-Options, Referrer-Policy), segreti solo in variabili d'ambiente, rate limit sulle API, validazione Zod lato server, Supabase RLS attivo, backup giornalieri DB, 2FA su tutti gli account (dominio, hosting, CMS, Google, Stripe).

## 6. Legale
Banner cookie funzionante (nessun cookie prima del consenso), pagine privacy/cookie/allergeni/termini online, footer con dati societari (vedi `rist-legale`).

## 7. Analytics e tracking
GA4 con Consent Mode v2, eventi chiave attivi, conversioni definite, Search Console verificata, GTM, Looker Studio collegato, UTM sui link GBP e social, monitor uptime (UptimeRobot/Better Stack) con alert al telefono.

## 8. Go-live
1. Abbassa TTL DNS 24 h prima. 2. Collega il dominio (A/AAAA/CNAME), SSL attivo. 3. Switch DNS in orario di bassa attività (mattina, non sabato sera). 4. Test post-lancio in 30 minuti. 5. Invia sitemap, richiedi indicizzazione delle pagine chiave. 6. Aggiorna URL in Google Business Profile, Instagram, Facebook, TripAdvisor, TheFork. 7. Annuncio sui social + newsletter.

## 9. Consegna al cliente
- Cartella condivisa con: credenziali (gestore password), accessi al CMS, codice sorgente, licenze (`docs/licenze.md`), brand kit, manuale PDF 1 pagina "Come aggiorno menu e orari"
- **Formazione live 60 min** + video registrato di 10 min
- Report iniziale: baseline (posizione Maps, recensioni, traffico) per misurare i risultati
- Contratto manutenzione attivo (vedi `rist-vendita`)
- Piano di crescita 90 giorni (vedi `rist-crescita`)

## 10. Dopo 14 giorni
Controllo errori in Search Console, velocità reale (CrUX), conversioni, bug segnalati, ritocchi gratuiti inclusi nel pacchetto.

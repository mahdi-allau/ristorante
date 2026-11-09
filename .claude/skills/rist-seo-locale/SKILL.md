---
name: rist-seo-locale
description: SEO locale e visibilità su Google per ristoranti (Google Business Profile, Google Maps, schema.org Restaurant, keyword locali, recensioni, citazioni NAP, Search Console). Usa per far salire il ristorante nelle ricerche "ristorante + zona", nel local pack di Google Maps e nelle risposte delle AI.
---

# SEO locale ristorante

Le prenotazioni arrivano da tre posti: **Google Maps/local pack**, **ricerca organica** e **AI (ChatGPT, Gemini, Perplexity)**. Lavora su tutti e tre.

## 1. Google Business Profile (priorità assoluta, peso ~35% nel ranking locale)
- Rivendica/verifica il profilo; categoria primaria precisa (es. "Ristorante di pesce", non "Ristorante"), 3–5 categorie secondarie
- Nome **identico all'insegna** (niente keyword stuffing: Google sospende il profilo)
- Orari regolari + festivi + chiusure straordinarie sempre aggiornati
- Attributi: prenotazioni, dehors, accessibile, wifi, cani ammessi, vegetariano, senza glutine, pagamenti
- Link **Prenota** (prenotazioni) e **Menu** → pagine del sito con UTM (`?utm_source=google&utm_medium=gbp`)
- **Foto**: minimo 40 al lancio, poi 4–8 nuove al mese (interno, esterno, piatti, staff); video brevi
- **Prodotti/Menu** caricati in GBP; **Post** settimanali (eventi, piatti stagionali, offerte) 
- **Domande e risposte**: pre-popola le 8 FAQ principali
- Messaggi attivi, risposta entro 1 ora quando possibile

## 2. Recensioni (leva n.1 per il posizionamento e la conversione)
- Link diretto e **QR code** `g.page/r/.../review` su scontrino, tavolo, biglietto da visita, WhatsApp post-visita
- Procedura: 2 ore dopo la cena, messaggio WhatsApp/email cortissimo con link; mai incentivi in cambio di recensioni positive (vietato da Google e dall'AGCM)
- Rispondi **a tutte** le recensioni entro 48 h, con tono umano, nominando piatto o zona; per le negative: ringrazia, offri contatto privato, non polemizzare
- Obiettivo: +10 recensioni/mese, rating ≥ 4,6; mostra sul sito solo recensioni reali con fonte e data

## 3. Keyword (esempi, da validare con Search Console/Ahrefs/OpenSEO)
- `ristorante [zona]`, `dove mangiare a [città]`, `ristorante [cucina] [quartiere]`, `ristorante romantico [città]`, `cena di lavoro [città]`, `ristorante con dehors [zona]`, `pranzo domenica [città]`, `ristorante vicino a [monumento/hotel]`, `miglior [piatto tipico] [città]`
- Mappa keyword → pagina (una intent per pagina): home = brand + generica; menu = piatti; eventi = cerimonie/aziendali; journal = long tail
- Title: `Ristorante [Cucina] a [Zona], [Città] | [Nome]` (≤ 60 car.); meta description ≤ 155 car. con verbo d'azione e CTA "Prenota"

## 4. Schema.org (JSON-LD) — in ogni pagina rilevante
```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "TODO-CLIENTE",
  "image": ["https://.../hero.jpg"],
  "url": "https://...",
  "telephone": "+39 ...",
  "priceRange": "€€€",
  "servesCuisine": ["Italiana", "Pesce"],
  "address": {"@type":"PostalAddress","streetAddress":"","addressLocality":"","postalCode":"","addressCountry":"IT"},
  "geo": {"@type":"GeoCoordinates","latitude":0,"longitude":0},
  "openingHoursSpecification": [{"@type":"OpeningHoursSpecification","dayOfWeek":["Tuesday"],"opens":"19:00","closes":"23:00"}],
  "hasMenu": "https://.../menu",
  "acceptsReservations": "True",
  "sameAs": ["instagram", "facebook", "tripadvisor", "google maps"]
}
```
Aggiungi anche: `Menu/MenuSection/MenuItem`, `Event` per ogni evento, `FAQPage`, `BreadcrumbList`, `Review` (solo reali, aggregate se supportato). Valida con Rich Results Test.

## 5. On-page e contenuti
- H1 unico per pagina con intent locale; testo reale (≥ 300 parole su home) che nomina quartiere, vie vicine, punti di interesse, parcheggi
- Pagina "Come arrivare" con mappa, mezzi, parcheggi → cattura ricerche "vicino a"
- **Journal** (2 articoli/mese): stagionalità, produttori, vini, guide al quartiere, "cosa fare a [città] di sera" → traffico + link
- Immagini con nome file e `alt` descrittivi, WebP/AVIF
- Link interni coerenti, URL brevi, `canonical`, `hreflang`

## 6. Citazioni e autorevolezza (NAP identico ovunque)
TripAdvisor, TheFork, Facebook, Instagram, Apple Business Connect, Bing Places, Yelp, PagineGialle, Gambero Rosso, Michelin Guide, Slow Food, blog locali, siti turistici del comune, hotel partner, Camera di Commercio. Cerca 10+ link da fonti locali/gastronomiche.

## 7. Ottimizzazione per le AI (GEO/AEO)
Sezione FAQ chiara ("Avete menu vegano? Si può prenotare per 12? C'è parcheggio?"), dati strutturati puliti, descrizioni fattuali, menzioni su fonti terze affidabili, `llms.txt` opzionale con riassunto del locale.

## 8. Misurazione
GA4 (eventi: `click_prenota`, `click_telefono`, `click_mappa`, `prenotazione_completata`), Search Console (query, pagine, copertura), GBP Insights (chiamate, indicazioni, siti), report mensile in Looker Studio con 6 numeri: impression Maps, chiamate, indicazioni, clic sito, prenotazioni, nuove recensioni.

## Checklist rapida lancio
[ ] GBP verificato e completo [ ] NAP coerente [ ] Schema validato [ ] Sitemap inviata [ ] 301 dal vecchio sito [ ] QR recensioni stampati [ ] Piano 30/60/90 giorni consegnato

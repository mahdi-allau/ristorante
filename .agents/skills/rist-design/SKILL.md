---
name: rist-design
description: Direzione artistica e design system di un sito ristorante elegante e moderno (tipografia, palette, griglie, fotografia, animazioni, componenti). Usa quando si deve decidere l'aspetto del sito, creare token di design, scegliere font/colori, impostare l'hero, o migliorare l'eleganza di una pagina esistente.
---

# Design system ristorante — "lusso silenzioso"

Il sito deve sembrare il locale: se è un fine dining, sobrio e cinematografico; se è una trattoria, caldo e materico. **Parti dal brief**, mai da un template.

## 1. Scegli una direzione (una sola)
| Direzione | Quando | Palette | Tipografia |
|-----------|--------|---------|-----------|
| **Noir cinematografico** | fine dining, cocktail bar, lounge | nero caldo `#0E0D0B`, avorio `#F3EEE6`, oro spento `#B79A5B` | titoli serif ad alto contrasto (Cormorant Garamond, Playfair Display), corpo sans (Inter, Manrope) |
| **Mediterraneo luminoso** | pesce, trattoria chic, vista mare | avorio `#FAF6EF`, terracotta `#B5563B`, oliva `#5C6B3A`, blu profondo `#1F3A4D` | serif editoriale (Fraunces, DM Serif Display) + sans (DM Sans) |
| **Osteria contemporanea** | cucina regionale, vino naturale | carta `#F5F0E6`, bordeaux `#6B1E2E`, inchiostro `#1B1B1B` | serif (Libre Caslon) + grotesk (Space Grotesk) |
| **Minimal giapponese/nordico** | sushi, cucina d'autore | bianco `#FFFFFF`, grigio pietra `#8C8A84`, nero `#111` | sans larga (Jost) + serif sottile |

Definisci in `tailwind.config` / CSS variables: `--bg`, `--fg`, `--accent`, `--muted`, `--line`, e fai la versione dark solo se coerente col locale.

## 2. Regole d'eleganza
- **Max 2 famiglie di font**, 3 pesi. Titoli grandi (clamp 3rem→7rem), interlinea stretta; corpo 17–19 px, interlinea 1.6.
- **Spazio**: sezioni con padding verticale 96–160 px desktop, 64–96 mobile. Massimo 12 colonne, ma impagina in modo asimmetrico.
- **Fotografia**: a tutta larghezza, rapporto coerente, color grading uniforme. Mai foto da stock di piatti non serviti. Hero: video loop 8–15 s muto (webm+mp4, poster, `prefers-reduced-motion` rispettato) oppure foto 16:9 con leggero zoom lento (Ken Burns 20 s).
- **Movimento**: fade+translate di 12–24 px, durata 600–900 ms, easing `cubic-bezier(.2,.7,.2,1)`. Parallasse minima. Nessun carosello automatico di slider.
- **Dettagli**: linee sottili 1 px, numeri romani o ornamenti discreti, cursore personalizzato solo su desktop, transizioni di pagina morbide.
- **Bottoni**: uno primario (Prenota) pieno o outline spesso, uno secondario testuale con sottolineatura animata.
- **Header**: logo centrato o a sinistra, menu minimo (Menu · Il locale · Eventi · Contatti), CTA Prenota sempre visibile; su mobile barra fissa in basso con **Chiama · Indicazioni · Prenota**.

## 3. Mappa pagine consigliata
1. **Home**: hero + payoff, 3 pilastri (cucina/atmosfera/territorio), piatti firma, recensioni vere, galleria, orari+mappa, CTA prenota.
2. **Menu** (stampabile, filtrabile, allergeni, vini): una pagina per lingua.
3. **Il locale / La storia / Lo chef**
4. **Eventi & Private dining** (form richiesta preventivo)
5. **Prenota** (widget integrato, no iframe brutto)
6. **Gift card**
7. **Galleria**, **Stampa/Premi**, **Blog/Journal** (per SEO: stagionalità, territorio, produttori)
8. **Contatti & Come arrivare** (mappa, parcheggi, mezzi)
9. Pagine legali (vedi `rist-legale`)

## 4. Componenti da realizzare
`Hero`, `SectionTitle`, `DishCard`, `MenuSection` (con allergeni a icone), `ReviewQuote`, `GalleryMasonry` + lightbox, `OpeningHours` (con stato "Aperto ora/Chiude alle 23"), `MapEmbed` (lazy, rispetta cookie), `BookingWidget`, `StickyMobileBar`, `LanguageSwitch`, `EventCard`, `InstagramGrid`, `Footer` con NAP e dati societari.

## 5. Accessibilità = eleganza
Contrasto ≥ 4.5:1, focus visibile e bello, `alt` descrittivi, tasti navigabili, `prefers-reduced-motion`. È anche requisito di legge (Legge Stanca / European Accessibility Act dal 28/06/2025).

## Output
`docs/design.md` (direzione scelta, palette, font, esempi), `styles/tokens.css`, componenti in `components/ui/`, preview di home + menu approvata dal cliente prima di sviluppare il resto.

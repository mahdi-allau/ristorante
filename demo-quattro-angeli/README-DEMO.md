# Demo di presentazione — Osteria I Quattro Angeli (Ferrara)

Proposta di sito per sostituire quello attuale (iquattroangeli.it). Stesso motore del progetto `sito-ristorante` (prenotazioni, pannello del ristoratore, sala, gift card, promemoria, recensioni, IT/EN), con **identità, menu, cantina e orari del locale**.

## Avvio

```bash
npm install          # una volta
npm run build && npm start     # http://localhost:3001
```

Pannello del ristoratore: `http://localhost:3001/admin`. Le credenziali di prova sono in `.env.local` (file locale, non condividere né pubblicare). Le prenotazioni "Esempio · …" nel pannello Sala sono dati fittizi inseriti per la presentazione; le email non partono davvero (finiscono in `data/outbox/`).

## Da dove vengono i dati

Tutto è copiato dalle pagine pubbliche del sito attuale (Home, Menu, Gluten free, Dolci, Carta vini, menu inglese) e dalla scheda pubblica del locale (Bing/TripAdvisor, 3/11/2026). Niente è stato inventato; dove un dato mancava è segnato **TODO-CLIENTE**.

| Dato | Valore usato | Fonte |
|---|---|---|
| Nome | Osteria I Quattro Angeli | sito attuale |
| Telefono | 0532 211 869 | sito attuale |
| Email | osteriai4angeli@libero.it | sito attuale |
| Indirizzo | Largo Castello 10, 44121 Ferrara | scheda pubblica Bing/TripAdvisor |
| Orari | mar–dom 12:00–15:00 e 19:00–23:00, lunedì chiuso | home del sito attuale |
| Servizi | feste di laurea, eventi aziendali, menù d'asporto (ordine telefonico, ritiro mar–ven) | home del sito attuale |
| Valutazione | 4,1/5, oltre 1.800 recensioni (TripAdvisor) | scheda pubblica, 3/11/2026 |
| Menu | 39 piatti + 23 senza glutine + contorni + dolci, con prezzi | sito attuale |
| Cantina | 19 vini (calice/bottiglia) | sito attuale |
| Traduzioni inglesi | quelle del sito attuale | sito attuale |

## Da confermare con il titolare (TODO-CLIENTE)

1. **Indirizzo**: il sito attuale scrive "Piazza Castello, 22" nella pagina Contatti; la scheda pubblica scrive "Largo Castello 10". Va scelto quello giusto e reso identico ovunque (Google, TripAdvisor, social): un indirizzo incoerente penalizza il posizionamento locale.
2. **Orari**: la pagina Contatti del sito attuale mostra orari diversi da quelli della home (9:00–18:00 / 11:00–17:00, sembrano un testo-modello). Qui si usano quelli della home.
3. **Ragione sociale, P.IVA, REA**: non sono sul sito attuale (obbligatori in footer e nell'informativa).
4. **Allergeni**: il sito attuale non li riporta. Vanno compilati piatto per piatto (Reg. UE 1169/2011): il pannello ha già i campi; la pagina Allergeni oggi dice "Da completare con il ristorante".
5. **Prezzo** dei cappellacci di zucca senza glutine: 13 € sulla pagina italiana, 12 € su quella inglese.
6. **Correzione** al testo originale: "stracciatella si cufala" → "stracciatella di bufala".
7. **Traduzioni inglesi** mancanti sul sito attuale (piatti senza glutine, dolci, maialino): scritte ex novo, da rivedere.
8. **Foto professionali**: oggi segnaposto. **Recensioni**: la valutazione TripAdvisor va aggiornata; le citazioni vere vanno richieste (con permesso).
9. **Coordinate** della mappa: indicative (zona Castello Estense). **Capienza** per fascia oraria (`SEATS_PER_SLOT`, oggi 24): da definire con la sala.
10. **Funzioni nuove proposte** (non presenti oggi): prenotazione online con promemoria, gift card, richieste di recensione, pannello sala: vanno approvate e, per Stripe/email, configurate (vedi `docs/LANCIO.md` del progetto principale).

## Non incluso nella demo
Dominio, hosting, Stripe reale, email reali, Google Business Profile, Search Console, redirect dal vecchio sito, testi legali rivisti da un consulente.

## Foto nella demo
La galleria contiene nove foto fornite come esempio: **la sala** (`sala.webp`), **un angolo con la botte** (`botte.webp`), **l'angolo dei salumi** (`salumi.webp`), **il bancone** (`bancone.webp`) e cinque foto verticali di atmosfera (`tavolo-rose`, `candele`, `dehors-sera`, `scala`, `festa`, tutte in `src/assets/photos/`). Le foto dei piatti sono state rimosse. L'ultima (`festa`) ritrae un ambiente addobbato per Natale che sembra un negozio, non un'osteria: da togliere se non è del locale.
Il logo (la targa con i quattro angeli) è in `src/assets/logo.webp` (intestazione e piè di pagina), `src/app/icon.png` e `apple-icon.png` (icone del sito) e `public/logo.png` (dati strutturati per Google). Prima della pubblicazione vanno sostituite con foto reali dell'osteria (shooting professionale), con liberatoria per fotografo e persone riconoscibili. Per cambiarle basta sostituire i file e le didascalie in `src/i18n/dictionaries.ts` (`gallery`).

## Video 3D del piatto
La sezione "Il piatto simbolo" (cappellacci di zucca, burro e salvia) mostra un video di 12 secondi di un piatto girevole: `public/video/dish.mp4` (6 MB), `dish.webm` (3,6 MB) e l'anteprima `dish-poster.jpg`. **È un rendering 3D illustrativo costruito con three.js (texture della pasta con farina, burro lucido, salvia con nervature, profondità di campo, vapore, 1600×900), non una fotografia né un video del piatto vero**: la didascalia sotto il video lo dice. Il video parte solo quando la sezione entra nello schermo e non parte per chi ha attivato "riduci animazioni" o il risparmio dati. Per il sito definitivo va sostituito con un video girato davvero (stessi nomi di file, oppure si cambia `base` in `src/app/[locale]/page.tsx`).

## Lingue
Sei lingue, nell'ordine del selettore con bandiere: italiano (senza prefisso), francese (`/fr`), arabo (`/ar`, scritto da destra a sinistra), inglese (`/en`), tedesco (`/de`), spagnolo (`/es`). Per l'arabo la bandiera è quella degli Emirati Arabi Uniti (nessuna bandiera nazionale rappresenta tutti i paesi arabi; questa è la più usata nei selettori e non porta scritte sacre).
- Testi dell'interfaccia: `src/i18n/dictionaries.ts` (italiano e inglese) e `src/i18n/dict/{fr,ar,de,es}.ts`; gift card in `gift-tr.ts`, gestione prenotazione in `manage-tr.ts`.
- Menu: i nomi dei piatti restano quelli italiani (inglese dove esiste); le descrizioni sono tradotte in tutte le lingue (`src/content/menu-tr.ts`).
- Email di conferma e promemoria: in italiano o in inglese (inglese per le altre lingue), con date e link nella lingua del cliente.
- **Le traduzioni sono mie e vanno riviste da una persona madrelingua prima della pubblicazione**, soprattutto l'arabo e i testi legali (privacy, cookie, allergeni).
- La pagina `/proposta` per il titolare resta in italiano.

## Direzione artistica
Palette presa dalla targa del locale: noce scuro, oro, pergamena e un pizzico di bordeaux. Sezioni scure (hero, galleria, cantina, eventi, prenotazione) alternate a sezioni su carta (pilastri e menu, con i puntini di guida fra piatto e prezzo). Dettagli: cornice sottile nell'hero, numeri romani, angoli decorati sulle schede, galleria a due altezze. I colori sono variabili CSS in cima a `src/app/globals.css` (blocco "Direzione artistica").

## Hero con il Castello Estense
Lo sfondo della home è una foto del Castello Estense al tramonto (`src/assets/photos/castello.webp`, 3840×2161), con un lentissimo zoom che si ferma per chi ha chiesto meno animazioni. È la foto inviata dal titolare del progetto: **prima della pubblicazione va verificata la licenza d'uso** (autore, fonte, uso commerciale) e, se richiesto, aggiunto il credito. La foto originale è 1672×941: la versione sul sito (3840×2161) è stata ingrandita in locale con Real-ESRGAN (intelligenza artificiale, modello x4plus) e mescolata al 38% con un ingrandimento classico per mantenere la grana dei mattoni. **I dettagli nuovi sono ricostruiti dall'algoritmo, non fotografati**: sono plausibili ma non reali. Per un risultato fedele serve l'originale ad alta risoluzione (almeno 3840 px di larghezza). Per cambiarla basta sostituire il file.

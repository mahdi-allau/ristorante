# Connettori e strumenti per il sito del ristorante

Verificato il 30/10/2026 nel registro connettori di Claude. "Connesso" = già attivo nella tua sessione; "Da collegare" = esiste, ma devi autorizzarlo tu (tramite `/mcp` o il pulsante Connetti).

## A. Già connessi (puoi usarli subito)
| Connettore | A cosa serve nel progetto |
|---|---|
| **Netlify** | Hosting, deploy da ramo, anteprime per il cliente, dominio, SSL, form, variabili d'ambiente |
| **Supabase** | Database prenotazioni, lista d'attesa, lead, gift card, autenticazione pannello sala, storage foto |
| **Google Drive** | Cartella condivisa col cliente: foto, menu, brand kit, consegna finale |
| **Gmail** | Bozze di email a cliente e preventivi, follow-up commerciali |
| **Shopify** | Solo se serve shop di prodotti (olio, vino, panettoni), asporto o gift card con checkout pronto |
| **WordPress.com** | Alternativa low-cost per clienti con budget ridotto (pacchetto Essenziale) |
| **Wix** | Alternativa con prenotazioni integrate (Wix Restaurants/Bookings) per pacchetto Essenziale |
| **Claude Docs** | Proposte, contratti, manuale PDF per il ristoratore |
| **Browser in-app / Chrome** | Anteprima del sito, test mobile, controllo concorrenti |

## B. Da collegare (consigliati per il livello 10.000 €)
| Connettore | Perché | Fase |
|---|---|---|
| **Stripe** | Caparre anti no-show, gift card, pagamenti eventi | `rist-prenotazioni` |
| **Canva** | Brand kit, menu stampabili, locandine QR, post social | `rist-design`, `rist-crescita` |
| **Intuit Mailchimp** | Newsletter, automazioni (benvenuto, compleanno, riattivazione) | `rist-crescita` |
| **OpenSEO** | Audit tecnico, tracciamento posizioni, concorrenti SERP | `rist-seo-locale` |
| **Adspirer Search Ads** | Campagne Google Ads locali, ricerca competitor, report | `rist-crescita` |
| **Abency** | Gestione multi-cliente di Ads + report (se gestisci più ristoranti) | `rist-crescita` |
| **Ahrefs** | Keyword e backlink (già elencato fra quelli che richiedono autenticazione) | `rist-seo-locale` |
| **Klaviyo** | CRM/email avanzato per catene o clienti con molti dati | `rist-crescita` |
| **Supermetrics** | Dati GA4, Ads, Meta in un unico report mensile | `rist-crescita` |
| **Figma** | Mockup e handoff del design | `rist-design` |
| **DocuSign** | Firma elettronica del contratto | `rist-vendita` |
| **Notion / Asana** | Gestione progetto e checklist col cliente | `rist-master` |
| **beehiiv** | Newsletter editoriale/blog gastronomico | `rist-crescita` |

## C. Servizi senza connettore (da integrare via API o configurazione manuale)
Questi sono fondamentali ma non li ho trovati come connettori Claude: si collegano con chiavi API/configurazione nel codice o nei loro pannelli.
- **Google Business Profile** (l'elemento più importante per Maps): gestione dal pannello Google, lo script/API richiede accesso del titolare
- **Google Analytics 4, Search Console, Tag Manager, Looker Studio**
- **Sanity** (CMS), **Resend** (email transazionali), **Twilio / WhatsApp Business API** (promemoria)
- **TheFork Manager / OpenTable / Quandoo**, **Reserve with Google**
- **TripAdvisor**, **Apple Business Connect**, **Bing Places**
- **Cookiebot / Iubenda** (cookie), **UptimeRobot / Better Stack** (monitoraggio)
- **Meta Business Suite** (Instagram/Facebook)

## D. Stack consigliato "da 10.000 €"
Next.js + Tailwind (Netlify) · Sanity (menu/orari) · Supabase (prenotazioni) · Stripe (caparre/gift card) · Resend + WhatsApp (promemoria) · GA4 + Search Console + GTM · Cookiebot · Mailchimp · Canva · Google Business Profile ottimizzato.

## E. Cosa dire al ristoratore
"Con questo sistema il sito prenota i tavoli da solo, ti ricorda i clienti, ti fa comparire su Google Maps, ti porta recensioni e vende buoni regalo. Tu aggiorni il menu in due minuti dal telefono."

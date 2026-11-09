import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { href, isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { Footer } from '@/components/SiteChrome';

type Props = { params: Promise<{ locale: string }> };

// Pagina di presentazione per il titolare: in italiano, mai indicizzata, fuori dal sitemap.
export const metadata: Metadata = {
  title: 'Proposta per il titolare — Osteria I Quattro Angeli',
  robots: { index: false, follow: false },
};

// Tutto quello che segue viene dalle pagine pubbliche del sito attuale (3/11/2026) e dalle funzioni
// già presenti e provate in questa demo. Nessun risultato promesso: niente percentuali inventate.
const FOUND = [
  { t: 'Due indirizzi diversi', p: 'La pagina Contatti dice «Piazza Castello, 22», le schede pubbliche «Largo Castello 10». Google premia chi scrive lo stesso indirizzo ovunque.' },
  { t: 'Orari che non coincidono', p: 'La home indica martedì–domenica 12–15 e 19–23; la pagina Contatti mostra altri orari, che sembrano un testo di esempio.' },
  { t: 'Allergeni non indicati', p: 'Per i piatti non ci sono gli allergeni, che sono un obbligo (Reg. UE 1169/2011). Nel nuovo sito si compilano piatto per piatto dal pannello.' },
  { t: 'Prenotazione solo al telefono', p: 'Non abbiamo trovato una prenotazione online: chi cerca di sera o a locale chiuso non può prenotare.' },
  { t: 'Piccole differenze nei testi', p: 'Il prezzo dei cappellacci di zucca senza glutine è 13 € in italiano e 12 € in inglese; c’è un «stracciatella si cufala» da correggere.' },
];

const CHANGES = [
  { n: '01', t: 'Prenotazione online, sempre aperta', p: 'I clienti prenotano anche quando l’osteria è chiusa. Il sistema conta i coperti liberi per fascia oraria e non fa prenotare oltre la capienza.' },
  { n: '02', t: 'Meno tavoli lasciati vuoti', p: 'Un’email 24 ore prima ricorda la prenotazione e permette di confermarla o annullarla con un clic: se qualcuno non viene, il tavolo si libera in tempo.' },
  { n: '03', t: 'Pannello sala', p: 'Le prenotazioni del giorno, i coperti, le note e le intolleranze in una sola schermata, anche da telefono. Si modificano, si cancellano, si scaricano.' },
  { n: '04', t: 'Gift card', p: 'Buoni regalo acquistabili online con pagamento sicuro: per Natale e compleanni, e il denaro arriva prima della visita.' },
  { n: '05', t: 'Menu e orari modificabili da voi', p: 'Piatti, prezzi, vini, orari e chiusure straordinarie si cambiano dal pannello, senza chiamare nessuno. Il sito si aggiorna subito.' },
  { n: '06', t: 'Più visibili su Google e più recensioni', p: 'Dati del locale scritti come Google li vuole (orari, menu, indirizzo), sito veloce da telefono. Dopo la visita parte una sola email a chi ha acconsentito, con il link per recensire: uguale per tutti, senza premi e senza filtrare i clienti scontenti.' },
];

const NEEDS = [
  'L’indirizzo corretto e uguale ovunque (sito, Google, TripAdvisor, social)',
  'Gli orari veri, comprese ferie e chiusure',
  'Ragione sociale, partita IVA e numero REA (obbligatori in fondo al sito)',
  'Gli allergeni di ogni piatto',
  'Foto e video veri dell’osteria: uno shooting di mezza giornata basta',
  'Quanti coperti accogliete in ogni fascia oraria',
  'Il vostro via libera alle funzioni nuove: prenotazioni, gift card, richieste di recensione',
];

export default async function Proposta({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);

  return (
    <>
      <main id="main" className="proposal">
        <section className="section prop-hero">
          <div className="wrap">
            <p className="eyebrow">Proposta per il titolare</p>
            <h1>Un sito che riempie i tavoli, <em>non solo una vetrina.</em></h1>
            <p className="lead">
              Questa è la demo del nuovo sito di Osteria I Quattro Angeli. Qui sotto trovate che cosa abbiamo notato nel
              sito attuale e che cosa cambia, in parole semplici.
            </p>
            <div className="hero-cta">
              <Link className="btn" href={`${href(locale, '/')}#prenota`}>Provate la prenotazione</Link>
              <Link className="link" href={href(locale, '/')}>Tornate al sito</Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <p className="eyebrow">Il punto di partenza</p>
            <h2>Che cosa abbiamo notato nel sito attuale</h2>
            <p className="sub">Dalle pagine pubbliche di iquattroangeli.it (3 novembre 2026). Sono cose che fanno perdere clienti senza che ve ne accorgiate.</p>
            <ul className="prop-list">
              {FOUND.map((f) => (
                <li key={f.t}><h3>{f.t}</h3><p>{f.p}</p></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section prop-changes">
          <div className="wrap">
            <p className="eyebrow">Che cosa cambia</p>
            <h2>Sei cose che lavorano per voi</h2>
            <div className="prop-grid">
              {CHANGES.map((c) => (
                <article className="card" key={c.n}>
                  <span className="num">{c.n}</span>
                  <h3>{c.t}</h3>
                  <p>{c.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <p className="eyebrow">Misurato sulla demo</p>
            <h2>Veloce, anche da telefono</h2>
            <div className="prop-stats">
              <div><b>100</b><span>prestazioni, accessibilità, buone pratiche e SEO da computer</span></div>
              <div><b>96–100</b><span>da telefono con rete lenta simulata</span></div>
              <div><b>IT · EN</b><span>due lingue, per i turisti di Ferrara</span></div>
              <div><b>Nessun</b><span>cookie di statistica senza il consenso del cliente</span></div>
            </div>
            <p className="note">Misure fatte con Lighthouse sulla versione di prova; vanno ripetute a sito pubblicato.</p>
          </div>
        </section>

        <section className="section prop-needs">
          <div className="wrap narrow">
            <p className="eyebrow">I prossimi passi</p>
            <h2>Che cosa ci serve da voi</h2>
            <ul className="prop-check">
              {NEEDS.map((n) => <li key={n}>{n}</li>)}
            </ul>
            <p className="note">Foto e video di questa demo sono di esempio e dati e prezzi sono quelli pubblici: vanno confermati insieme prima di pubblicare.</p>
            <p className="center"><Link className="btn" href={`${href(locale, '/')}#prenota`}>Tornate alla prenotazione</Link></p>
          </div>
        </section>
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}

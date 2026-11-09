'use client';

import { useEffect, useMemo, useState } from 'react';
import { ALLERGEN_KEYS, COURSES, type Closure, type Content, type Course, type Dish, type Range } from '@/content/types';
import { getDict } from '@/i18n/dictionaries';
import GiftCardsPanel from './GiftCardsPanel';
import SalaPanel from './SalaPanel';

const it = getDict('it');
type Tab = 'sala' | 'menu' | 'orari' | 'chiusure' | 'avviso' | 'gift';
const TABS: Array<[Tab, string]> = [['sala', 'Sala'], ['menu', 'Menu'], ['orari', 'Orari'], ['chiusure', 'Chiusure'], ['avviso', 'Avviso'], ['gift', 'Gift card']];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunedì → domenica
const todayISO = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });

export default function Editor({ initial, storage }: { initial: Content; storage: 'supabase' | 'file' }) {
  const [c, setC] = useState<Content>(initial);
  const [saved, setSaved] = useState<string>(JSON.stringify(initial));
  const [tab, setTab] = useState<Tab>('sala');
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(() => JSON.stringify(c) !== saved, [c, saved]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const edit = (fn: (draft: Content) => Content) => { setC((prev) => fn(structuredClone(prev))); setStatus(null); };

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; path?: string };
      if (res.ok) {
        setSaved(JSON.stringify(c));
        setStatus({ kind: 'ok', text: 'Salvato. Il sito è aggiornato.' });
      } else if (res.status === 401) {
        setStatus({ kind: 'err', text: 'Sessione scaduta: ricarica la pagina e accedi di nuovo.' });
      } else {
        setStatus({ kind: 'err', text: data.message ? `${data.message}${data.path ? ` (${data.path})` : ''}` : 'Salvataggio non riuscito.' });
      }
    } catch {
      setStatus({ kind: 'err', text: 'Errore di rete. Riprova.' });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  /* ---------- Menu ---------- */
  const setDish = (id: string, patch: Partial<Dish>) =>
    edit((d) => { d.menu.dishes = d.menu.dishes.map((x) => (x.id === id ? { ...x, ...patch } : x)); return d; });
  const addDish = (course: Course) =>
    edit((d) => {
      d.menu.dishes.push({
        id: `d${Date.now().toString(36)}`, course, price: 0, allergens: [], vegetarian: false, available: true,
        name: { it: '', en: '' }, desc: { it: '', en: '' },
      });
      return d;
    });
  const removeDish = (id: string, name: string) => {
    if (!window.confirm(`Eliminare «${name || 'piatto senza nome'}»? Per nasconderlo senza cancellarlo togli la spunta «Disponibile».`)) return;
    edit((d) => { d.menu.dishes = d.menu.dishes.filter((x) => x.id !== id); return d; });
  };
  const moveDish = (id: string, dir: -1 | 1) =>
    edit((d) => {
      const course = d.menu.dishes.find((x) => x.id === id)?.course;
      const idx = d.menu.dishes.map((x, i) => (x.course === course ? i : -1)).filter((i) => i >= 0);
      const pos = idx.findIndex((i) => d.menu.dishes[i].id === id);
      const swap = idx[pos + dir];
      if (swap === undefined) return d;
      [d.menu.dishes[idx[pos]], d.menu.dishes[swap]] = [d.menu.dishes[swap], d.menu.dishes[idx[pos]]];
      return d;
    });

  /* ---------- Orari ---------- */
  const setRange = (day: number, i: number, patch: Partial<Range>) =>
    edit((d) => { d.hours.week[day][i] = { ...d.hours.week[day][i], ...patch }; return d; });
  const addRange = (day: number) =>
    edit((d) => { d.hours.week[day].push({ from: '19:30', to: '23:00' }); return d; });
  const removeRange = (day: number, i: number) =>
    edit((d) => { d.hours.week[day].splice(i, 1); return d; });
  const copyDay = (day: number) =>
    edit((d) => { d.hours.week = d.hours.week.map(() => d.hours.week[day].map((r) => ({ ...r }))); return d; });

  /* ---------- Chiusure ---------- */
  const setClosure = (i: number, patch: Partial<Closure>) =>
    edit((d) => { d.hours.closures[i] = { ...d.hours.closures[i], ...patch }; return d; });
  const addClosure = () =>
    edit((d) => { d.hours.closures.push({ from: todayISO(), to: todayISO(), note: '' }); return d; });
  const removeClosure = (i: number) =>
    edit((d) => { d.hours.closures.splice(i, 1); return d; });

  return (
    <div className="adm-shell">
      <header className="adm-top">
        <div>
          <p className="adm-eyebrow">Osteria Lumina</p>
          <h1>Pannello del ristorante</h1>
        </div>
        <div className="adm-top-actions">
          <a className="adm-btn" href="/" target="_blank" rel="noopener">Vedi il sito ↗</a>
          <button className="adm-btn" type="button" onClick={logout}>Esci</button>
        </div>
      </header>

      {storage === 'file' && (
        <p className="adm-warn">
          Archivio locale (file): va bene per sviluppo o un server con disco scrivibile. In produzione su hosting serverless configura Supabase.
        </p>
      )}

      <nav className="adm-tabs" role="tablist" aria-label="Sezioni">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </nav>

      <main className="adm-main">
        {tab === 'menu' && (
          <>
            <section className="adm-panel">
              <h2>Titolo del menu</h2>
              <div className="adm-grid2">
                <label>Italiano
                  <input value={c.menu.title.it} maxLength={60} onChange={(e) => edit((d) => { d.menu.title.it = e.target.value; return d; })} />
                </label>
                <label>Inglese
                  <input value={c.menu.title.en} maxLength={60} onChange={(e) => edit((d) => { d.menu.title.en = e.target.value; return d; })} />
                </label>
              </div>
            </section>

            {COURSES.map((course) => {
              const list = c.menu.dishes.filter((d) => d.course === course);
              return (
                <section className="adm-panel" key={course}>
                  <div className="adm-row-between">
                    <h2>{it.menu.courses[course]} <span className="adm-count">{list.length}</span></h2>
                    <button className="adm-btn" type="button" onClick={() => addDish(course)}>+ Aggiungi piatto</button>
                  </div>
                  {list.length === 0 && <p className="adm-muted">Nessun piatto in questa sezione.</p>}
                  {list.map((d, i) => (
                    <article className={`adm-dish${d.available ? '' : ' off'}`} key={d.id}>
                      <div className="adm-grid2">
                        <label>Nome (italiano) *
                          <input value={d.name.it} maxLength={90} onChange={(e) => setDish(d.id, { name: { ...d.name, it: e.target.value } })} />
                        </label>
                        <label>Nome (inglese)
                          <input value={d.name.en} maxLength={90} onChange={(e) => setDish(d.id, { name: { ...d.name, en: e.target.value } })} />
                        </label>
                        <label>Descrizione (italiano)
                          <textarea rows={2} value={d.desc.it} maxLength={240} onChange={(e) => setDish(d.id, { desc: { ...d.desc, it: e.target.value } })} />
                        </label>
                        <label>Descrizione (inglese)
                          <textarea rows={2} value={d.desc.en} maxLength={240} onChange={(e) => setDish(d.id, { desc: { ...d.desc, en: e.target.value } })} />
                        </label>
                      </div>

                      <div className="adm-row">
                        <label className="adm-price">Prezzo (€)
                          <input type="number" min={0} max={999} step={0.5} value={Number.isFinite(d.price) ? d.price : 0}
                                 onChange={(e) => setDish(d.id, { price: e.target.value === '' ? 0 : Number(e.target.value) })} />
                        </label>
                        <label className="adm-check">
                          <input type="checkbox" checked={d.available} onChange={(e) => setDish(d.id, { available: e.target.checked })} /> Disponibile
                        </label>
                        <label className="adm-check">
                          <input type="checkbox" checked={d.vegetarian} onChange={(e) => setDish(d.id, { vegetarian: e.target.checked })} /> Vegetariano
                        </label>
                        <label className="adm-select">Sezione
                          <select value={d.course} onChange={(e) => setDish(d.id, { course: e.target.value as Course })}>
                            {COURSES.map((k) => <option key={k} value={k}>{it.menu.courses[k]}</option>)}
                          </select>
                        </label>
                      </div>

                      <fieldset className="adm-allergens">
                        <legend>Allergeni presenti (obbligatorio per legge)</legend>
                        {ALLERGEN_KEYS.map((a) => (
                          <label key={a} className="adm-check">
                            <input type="checkbox" checked={d.allergens.includes(a)}
                                   onChange={(e) => setDish(d.id, {
                                     allergens: e.target.checked ? [...d.allergens, a] : d.allergens.filter((x) => x !== a),
                                   })} />
                            {it.menu.allergens[a].l}
                          </label>
                        ))}
                      </fieldset>

                      <div className="adm-row-between">
                        <div className="adm-row">
                          <button className="adm-btn sm" type="button" disabled={i === 0} onClick={() => moveDish(d.id, -1)} aria-label="Sposta su">↑ Su</button>
                          <button className="adm-btn sm" type="button" disabled={i === list.length - 1} onClick={() => moveDish(d.id, 1)} aria-label="Sposta giù">↓ Giù</button>
                        </div>
                        <button className="adm-btn sm danger" type="button" onClick={() => removeDish(d.id, d.name.it)}>Elimina</button>
                      </div>
                    </article>
                  ))}
                </section>
              );
            })}
          </>
        )}

        {tab === 'orari' && (
          <section className="adm-panel">
            <h2>Orari settimanali</h2>
            <p className="adm-muted">Aggiungi una fascia per ogni servizio (pranzo, cena). Nessuna fascia = giorno di chiusura. Le prenotazioni online partono dall&apos;apertura e finiscono 30 minuti prima della chiusura.</p>
            {DAY_ORDER.map((day) => (
              <div className="adm-day" key={day}>
                <strong>{it.contacts.days[day]}</strong>
                <div className="adm-ranges">
                  {c.hours.week[day].length === 0 && <span className="adm-muted">Chiuso</span>}
                  {c.hours.week[day].map((r, i) => (
                    <div className="adm-range" key={i}>
                      <input type="time" value={r.from} onChange={(e) => setRange(day, i, { from: e.target.value })} aria-label={`${it.contacts.days[day]} apertura`} />
                      <span>–</span>
                      <input type="time" value={r.to} onChange={(e) => setRange(day, i, { to: e.target.value })} aria-label={`${it.contacts.days[day]} chiusura`} />
                      <button className="adm-btn sm danger" type="button" onClick={() => removeRange(day, i)} aria-label="Rimuovi fascia">✕</button>
                    </div>
                  ))}
                </div>
                <div className="adm-row">
                  <button className="adm-btn sm" type="button" onClick={() => addRange(day)}>+ Fascia</button>
                  <button className="adm-btn sm" type="button" onClick={() => copyDay(day)} title="Copia questi orari su tutti i giorni">Copia su tutti</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === 'chiusure' && (
          <section className="adm-panel">
            <div className="adm-row-between">
              <h2>Chiusure straordinarie</h2>
              <button className="adm-btn" type="button" onClick={addClosure}>+ Aggiungi chiusura</button>
            </div>
            <p className="adm-muted">Ferie, giorni festivi, eventi privati. In queste date il sito risulta chiuso e non accetta prenotazioni. Le date sono comprese.</p>
            {c.hours.closures.length === 0 && <p className="adm-muted">Nessuna chiusura programmata.</p>}
            {c.hours.closures.map((cl, i) => (
              <div className="adm-closure" key={i}>
                <label>Dal<input type="date" value={cl.from} onChange={(e) => setClosure(i, { from: e.target.value })} /></label>
                <label>Al<input type="date" value={cl.to} onChange={(e) => setClosure(i, { to: e.target.value })} /></label>
                <label className="grow">Nota interna<input value={cl.note} maxLength={120} placeholder="es. Ferie estive" onChange={(e) => setClosure(i, { note: e.target.value })} /></label>
                <button className="adm-btn sm danger" type="button" onClick={() => removeClosure(i)}>Elimina</button>
              </div>
            ))}
          </section>
        )}

        {tab === 'sala' && <SalaPanel />}
        {tab === 'gift' && <GiftCardsPanel />}

        {tab === 'avviso' && (
          <section className="adm-panel">
            <h2>Avviso in homepage</h2>
            <p className="adm-muted">Un messaggio breve in evidenza nella prima schermata del sito (es. «Chiusi per ferie dal 10 al 25 agosto»).</p>
            <label className="adm-check">
              <input type="checkbox" checked={c.notice.active} onChange={(e) => edit((d) => { d.notice.active = e.target.checked; return d; })} /> Mostra l&apos;avviso
            </label>
            <div className="adm-grid2">
              <label>Testo (italiano)
                <textarea rows={2} maxLength={200} value={c.notice.text.it} onChange={(e) => edit((d) => { d.notice.text.it = e.target.value; return d; })} />
              </label>
              <label>Testo (inglese)
                <textarea rows={2} maxLength={200} value={c.notice.text.en} onChange={(e) => edit((d) => { d.notice.text.en = e.target.value; return d; })} />
              </label>
            </div>
          </section>
        )}
      </main>

      {tab !== 'gift' && tab !== 'sala' && (
      <footer className="adm-savebar">
        <span className={`adm-status ${status?.kind ?? ''}`} role="status">
          {status?.text ?? (dirty ? 'Modifiche non salvate' : 'Tutto salvato')}
        </span>
        <button className="adm-btn primary" type="button" onClick={save} disabled={!dirty || busy}>
          {busy ? 'Salvo…' : 'Salva modifiche'}
        </button>
      </footer>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Status = 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
interface B {
  id: string; date: string; time: string; guests: number; name: string; phone: string; email: string;
  notes: string; staffNote: string; source: 'web' | 'staff'; status: Status;
  reminderSentAt: string | null; guestConfirmedAt: string | null;
  reviewOptIn: boolean; reviewOptOut: boolean; reviewRequestedAt: string | null;
}
interface DayData { date: string; closed: boolean; capacity: number; bookings: B[] }
interface Form { date: string; time: string; guests: number; name: string; phone: string; email: string; notes: string; staffNote: string; reviewOptIn: boolean; force: boolean }

const LABEL: Record<Status, string> = { confirmed: 'In attesa', seated: 'Al tavolo', completed: 'Concluso', cancelled: 'Annullata', no_show: 'No-show' };
const COUNTS: Status[] = ['confirmed', 'seated', 'completed'];
const todayRome = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
const shift = (ymd: string, n: number) => { const [y, m, d] = ymd.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
const longDate = (ymd: string) => new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${ymd}T12:00:00Z`));
const emptyForm = (date: string): Form => ({ date, time: '20:00', guests: 2, name: '', phone: '', email: '', notes: '', staffNote: '', reviewOptIn: false, force: false });

export default function SalaPanel() {
  const [date, setDate] = useState('');
  const [data, setData] = useState<DayData | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [showOff, setShowOff] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm(''));
  const [busy, setBusy] = useState(false);

  useEffect(() => { setDate(todayRome()); }, []);

  const load = useCallback(async (d: string) => {
    if (!d) return;
    const r = await fetch(`/api/admin/bookings?date=${d}`);
    if (r.status === 401) { setErr('Sessione scaduta: ricarica la pagina e accedi di nuovo.'); return; }
    if (!r.ok) { setErr('Impossibile caricare le prenotazioni.'); return; }
    setErr('');
    setData((await r.json()) as DayData);
  }, []);

  useEffect(() => { setData(null); void load(date); }, [date, load]);
  // aggiornamento automatico ogni minuto, ma non mentre si sta modificando
  useEffect(() => {
    if (editId || adding) return;
    const id = setInterval(() => void load(date), 60_000);
    return () => clearInterval(id);
  }, [date, load, editId, adding]);

  async function call(method: 'PATCH' | 'POST', body: unknown): Promise<{ ok: boolean; error?: string }> {
    const r = await fetch('/api/admin/bookings', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = (await r.json().catch(() => ({}))) as { error?: string; message?: string };
    return r.ok ? { ok: true } : { ok: false, error: j.error ?? 'server' };
  }

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, retry?: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true); setMsg(''); setErr('');
    try {
      let res = await fn();
      if (!res.ok && res.error === 'full' && retry && window.confirm('Lo slot è già pieno. Vuoi inserirla lo stesso (overbooking)?')) res = await retry();
      if (res.ok) { setMsg(okText); setEditId(null); setAdding(false); await load(date); }
      else setErr(res.error === 'full' ? 'Slot pieno: operazione non eseguita.' : res.error === 'not_found' ? 'Prenotazione non trovata.' : res.error === 'no_store' ? 'Archivio prenotazioni non attivo (modalità demo).' : 'Operazione non riuscita. Controlla i dati e riprova.');
    } finally { setBusy(false); }
  }

  const setStatus = (b: B, status: Status, text: string) =>
    run(() => call('PATCH', { id: b.id, patch: { status } }), text, () => call('PATCH', { id: b.id, patch: { status }, force: true }));

  const askCancel = (b: B) => { if (window.confirm(`Annullare la prenotazione di ${b.name} (${b.guests} pers., ${b.time})?`)) void setStatus(b, 'cancelled', 'Prenotazione annullata.'); };

  const saveEdit = (b: B) => {
    const patch = { date: form.date, time: form.time, guests: form.guests, name: form.name, phone: form.phone, email: form.email, notes: form.notes, staffNote: form.staffNote, reviewOptIn: form.reviewOptIn };
    void run(() => call('PATCH', { id: b.id, patch, force: form.force }), 'Modifiche salvate.', () => call('PATCH', { id: b.id, patch, force: true }));
  };

  const saveNew = () => {
    const body = { ...form };
    void run(() => call('POST', body), 'Prenotazione inserita.', () => call('POST', { ...body, force: true }));
  };

  const startEdit = (b: B) => {
    setAdding(false); setEditId(b.id);
    setForm({ date: b.date, time: b.time, guests: b.guests, name: b.name, phone: b.phone, email: b.email, notes: b.notes, staffNote: b.staffNote, reviewOptIn: b.reviewOptIn, force: false });
  };

  const bookings = data?.bookings ?? [];
  const active = bookings.filter((b) => COUNTS.includes(b.status));
  const off = bookings.filter((b) => !COUNTS.includes(b.status));
  const shown = showOff ? bookings : active;

  const groups = useMemo(() => {
    const m = new Map<string, B[]>();
    for (const b of shown) m.set(b.time, [...(m.get(b.time) ?? []), b]);
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [shown]);

  const covers = (list: B[]) => list.filter((b) => COUNTS.includes(b.status)).reduce((s, b) => s + b.guests, 0);
  const lunch = covers(active.filter((b) => b.time < '17:00'));
  const dinner = covers(active.filter((b) => b.time >= '17:00'));
  const cap = data?.capacity ?? 24;

  // La data di oggi si calcola nel browser dopo il primo rendering: fino ad allora non c'è nulla da mostrare
  if (!date) return null;

  const FormFields = (
    <div className="sala-form">
      <div className="adm-grid2">
        <label>Nome *<input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Telefono<input value={form.phone} maxLength={30} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label>Email (facoltativa: serve per promemoria)<input type="email" value={form.email} maxLength={120} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <div className="adm-row">
          <label>Data<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label>Ora<input type="time" step={900} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label className="adm-price">Persone<input type="number" min={1} max={40} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) || 1 })} /></label>
        </div>
        <label>Note del cliente (allergie, occasioni)<textarea rows={2} maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        <label>Note interne (staff)<textarea rows={2} maxLength={500} value={form.staffNote} onChange={(e) => setForm({ ...form, staffNote: e.target.value })} /></label>
      </div>
      <label className="adm-check"><input type="checkbox" checked={form.reviewOptIn} onChange={(e) => setForm({ ...form, reviewOptIn: e.target.checked })} /> Il cliente accetta di ricevere, dopo la visita, una email per lasciare una recensione</label>
      <label className="adm-check"><input type="checkbox" checked={form.force} onChange={(e) => setForm({ ...form, force: e.target.checked })} /> Ignora la capienza dello slot (overbooking)</label>
    </div>
  );

  return (
    <>
      <section className="adm-panel sala-head">
        <div className="adm-row-between no-print">
          <div className="adm-row">
            <button className="adm-btn sm" type="button" onClick={() => setDate(shift(date, -1))} aria-label="Giorno precedente">◀</button>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} style={{ width: 160 }} aria-label="Data" />
            <button className="adm-btn sm" type="button" onClick={() => setDate(shift(date, 1))} aria-label="Giorno successivo">▶</button>
            <button className="adm-btn sm" type="button" onClick={() => setDate(todayRome())}>Oggi</button>
          </div>
          <div className="adm-row">
            <button className="adm-btn primary" type="button" onClick={() => { setEditId(null); setAdding(true); setForm(emptyForm(date)); }}>+ Nuova prenotazione</button>
            <button className="adm-btn" type="button" onClick={() => window.print()}>Stampa</button>
            <a className="adm-btn" href={`/api/admin/bookings?format=csv&from=${date}&to=${date}`}>CSV giorno</a>
            <a className="adm-btn" href={`/api/admin/bookings?format=csv&from=${date}&to=${shift(date, 30)}`}>CSV 30 giorni</a>
          </div>
        </div>
        <h2 className="sala-title">{date ? longDate(date) : '…'}</h2>
        {data?.closed && <p className="adm-warn" style={{ margin: '.6rem 0 0' }}>Il ristorante risulta chiuso in questa data (giorno di riposo o chiusura straordinaria).</p>}
        <p className="sala-stats">
          <b>{covers(active)}</b> coperti · {active.length} prenotazioni
          {' · '}pranzo {lunch} · cena {dinner}
          {off.length > 0 && <> · {off.filter((b) => b.status === 'cancelled').length} annullate · {off.filter((b) => b.status === 'no_show').length} no-show</>}
        </p>
        {off.length > 0 && <label className="adm-check no-print"><input type="checkbox" checked={showOff} onChange={(e) => setShowOff(e.target.checked)} /> Mostra annullate e no-show</label>}
        {msg && <p className="adm-status ok no-print" role="status" style={{ margin: '.5rem 0 0' }}>{msg}</p>}
        {err && <p className="adm-status err no-print" role="alert" style={{ margin: '.5rem 0 0' }}>{err}</p>}
      </section>

      {adding && (
        <section className="adm-panel no-print">
          <h2>Nuova prenotazione</h2>
          {FormFields}
          <div className="adm-row" style={{ marginTop: '.8rem' }}>
            <button className="adm-btn primary" type="button" disabled={busy || form.name.trim().length < 2} onClick={saveNew}>Inserisci</button>
            <button className="adm-btn" type="button" onClick={() => setAdding(false)}>Annulla</button>
          </div>
        </section>
      )}

      {data && groups.length === 0 && <section className="adm-panel"><p className="adm-muted">Nessuna prenotazione per questa data.</p></section>}

      {groups.map(([time, list]) => {
        const used = covers(list);
        return (
          <section className="adm-panel sala-slot" key={time}>
            <div className="adm-row-between">
              <h2 style={{ margin: 0 }}>{time}</h2>
              <span className={`sala-cap${used > cap ? ' over' : ''}`}>{used} / {cap} coperti</span>
            </div>
            <div className="sala-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, (used / cap) * 100)}%` }} className={used > cap ? 'over' : ''} /></div>

            {list.map((b) => (
              <article className={`sala-card st-${b.status}`} key={b.id}>
                <div className="adm-row-between">
                  <div>
                    <strong>{b.name}</strong> · {b.guests} {b.guests === 1 ? 'persona' : 'persone'}
                    {b.phone && <> · <a href={`tel:${b.phone.replace(/\s/g, '')}`}>{b.phone}</a></>}
                  </div>
                  <span className={`sala-badge st-${b.status}`}>{LABEL[b.status]}</span>
                </div>
                {b.notes && <p className="sala-note">⚠ {b.notes}</p>}
                {b.staffNote && <p className="sala-staff">Staff: {b.staffNote}</p>}
                <p className="sala-meta">
                  {b.source === 'staff' ? 'Inserita dallo staff' : 'Dal sito'}
                  {b.guestConfirmedAt && ' · ✓ confermata dal cliente'}
                  {b.reminderSentAt && ' · promemoria inviato'}
                  {!b.email && ' · senza email'}
                  {b.reviewRequestedAt ? ' · richiesta recensione inviata' : b.reviewOptOut ? ' · non vuole richieste di recensione' : b.reviewOptIn ? ' · riceverà la richiesta di recensione' : ''}
                </p>

                {editId === b.id ? (
                  <div className="no-print">
                    {FormFields}
                    <div className="adm-row" style={{ marginTop: '.8rem' }}>
                      <button className="adm-btn primary" type="button" disabled={busy || form.name.trim().length < 2} onClick={() => saveEdit(b)}>Salva</button>
                      <button className="adm-btn" type="button" onClick={() => setEditId(null)}>Chiudi</button>
                    </div>
                  </div>
                ) : (
                  <div className="adm-row no-print">
                    {b.status === 'confirmed' && <>
                      <button className="adm-btn sm primary" type="button" disabled={busy} onClick={() => setStatus(b, 'seated', 'Segnato come arrivato.')}>Arrivato</button>
                      <button className="adm-btn sm" type="button" disabled={busy} onClick={() => setStatus(b, 'no_show', 'Segnato come no-show.')}>No-show</button>
                    </>}
                    {b.status === 'seated' && <>
                      <button className="adm-btn sm primary" type="button" disabled={busy} onClick={() => setStatus(b, 'completed', 'Segnato come concluso.')}>Concluso</button>
                      <button className="adm-btn sm" type="button" disabled={busy} onClick={() => setStatus(b, 'confirmed', 'Rimesso in attesa.')}>Non è arrivato</button>
                    </>}
                    {b.status === 'completed' && <button className="adm-btn sm" type="button" disabled={busy} onClick={() => setStatus(b, 'seated', 'Riaperto: al tavolo.')}>Riapri</button>}
                    {(b.status === 'cancelled' || b.status === 'no_show') && <button className="adm-btn sm" type="button" disabled={busy} onClick={() => setStatus(b, 'confirmed', 'Prenotazione ripristinata.')}>Ripristina</button>}
                    <button className="adm-btn sm" type="button" disabled={busy} onClick={() => startEdit(b)}>Modifica / sposta</button>
                    {(b.status === 'confirmed' || b.status === 'seated') && <button className="adm-btn sm danger" type="button" disabled={busy} onClick={() => askCancel(b)}>Annulla</button>}
                  </div>
                )}
              </article>
            ))}
          </section>
        );
      })}
    </>
  );
}

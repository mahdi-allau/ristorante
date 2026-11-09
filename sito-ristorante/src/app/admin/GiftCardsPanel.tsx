'use client';

import { useCallback, useEffect, useState } from 'react';

interface Card {
  code: string; status: 'pending' | 'active' | 'void'; amount: number; balance: number;
  buyerName: string; buyerEmail: string; recipientName: string; message: string;
  demo: boolean; createdAt: string; expiresAt: string | null;
  redemptions: Array<{ at: string; amount: number; note: string }>;
}

const eur = (c: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(c / 100);
const day = (iso: string) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(new Date(iso));
const REASONS: Record<string, string> = {
  not_found: 'Codice non trovato.', inactive: 'La carta non è attiva.', expired: 'La carta è scaduta.',
  insufficient: 'Importo superiore al saldo residuo.', invalid: 'Importo non valido.',
};

export default function GiftCardsPanel() {
  const [code, setCode] = useState('');
  const [card, setCard] = useState<Card | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [recent, setRecent] = useState<Card[]>([]);
  const [busy, setBusy] = useState(false);

  const loadRecent = useCallback(async () => {
    const r = await fetch('/api/admin/giftcards');
    if (r.ok) setRecent(((await r.json()) as { cards: Card[] }).cards);
  }, []);
  useEffect(() => { void loadRecent(); }, [loadRecent]);

  async function search(e?: React.FormEvent, forced?: string) {
    e?.preventDefault();
    const c = (forced ?? code).trim();
    if (!c) return;
    setMsg(null); setCard(null); setBusy(true);
    try {
      const r = await fetch(`/api/admin/giftcards?code=${encodeURIComponent(c)}`);
      if (r.ok) { setCard(((await r.json()) as { card: Card }).card); setAmount(''); setNote(''); }
      else setMsg({ kind: 'err', text: r.status === 401 ? 'Sessione scaduta: ricarica la pagina.' : REASONS.not_found });
    } finally { setBusy(false); }
  }

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    if (!card) return;
    const value = Number(amount.replace(',', '.'));
    if (!(value > 0)) { setMsg({ kind: 'err', text: REASONS.invalid }); return; }
    if (!window.confirm(`Riscuotere ${eur(Math.round(value * 100))} dalla carta ${card.code}?`)) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/admin/giftcards/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: card.code, amount: value, note }),
      });
      const data = (await r.json().catch(() => ({}))) as { card?: Card; error?: string };
      if (r.ok && data.card) {
        setCard(data.card); setAmount(''); setNote('');
        setMsg({ kind: 'ok', text: `Riscossi ${eur(Math.round(value * 100))}. Saldo residuo ${eur(data.card.balance)}.` });
        void loadRecent();
      } else {
        setMsg({ kind: 'err', text: REASONS[data.error ?? ''] ?? 'Operazione non riuscita.' });
      }
    } finally { setBusy(false); }
  }

  const expired = card?.expiresAt ? new Date(card.expiresAt) < new Date() : false;
  const usable = !!card && card.status === 'active' && !expired && card.balance > 0;

  return (
    <>
      <section className="adm-panel">
        <h2>Riscuoti una gift card</h2>
        <p className="adm-muted">Inserisci il codice mostrato dal cliente (es. K7MQ-2XWD-9RTB), controlla il saldo e scala l&apos;importo speso. Si può riscuotere anche in più volte.</p>
        <form className="adm-row" onSubmit={search}>
          <label style={{ flex: 1, minWidth: 220 }}>Codice
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX-XXXX" maxLength={20} autoComplete="off" />
          </label>
          <button className="adm-btn primary" type="submit" disabled={busy || !code.trim()} style={{ alignSelf: 'flex-end' }}>Cerca</button>
        </form>

        {msg && <p className={`adm-status ${msg.kind}`} role="status" style={{ marginTop: '.8rem' }}>{msg.text}</p>}

        {card && (
          <div className="adm-dish" style={{ marginTop: '1rem' }}>
            <div className="adm-row-between">
              <strong style={{ fontFamily: 'ui-monospace,monospace', letterSpacing: '.08em' }}>{card.code}</strong>
              <span className={card.status === 'active' && !expired ? 'adm-status ok' : 'adm-status err'}>
                {card.status === 'active' ? (expired ? 'Scaduta' : 'Attiva') : card.status === 'void' ? 'Annullata' : 'In attesa'}{card.demo ? ' · DEMO' : ''}
              </span>
            </div>
            <div className="adm-grid2">
              <p style={{ margin: 0 }}><span className="adm-muted">Saldo residuo</span><br /><b style={{ fontSize: '1.5rem' }}>{eur(card.balance)}</b> <span className="adm-muted">di {eur(card.amount)}</span></p>
              <p style={{ margin: 0 }} className="adm-muted">
                Acquistata da {card.buyerName} il {day(card.createdAt)}<br />
                {card.recipientName && <>Per {card.recipientName}<br /></>}
                {card.expiresAt && <>Scade il {day(card.expiresAt)}</>}
              </p>
            </div>
            {card.message && <p className="adm-muted" style={{ margin: 0 }}>«{card.message}»</p>}

            {usable && (
              <form className="adm-row" onSubmit={redeem}>
                <label className="adm-price">Importo (€)
                  <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
                </label>
                <button className="adm-btn sm" type="button" onClick={() => setAmount((card.balance / 100).toFixed(2).replace('.', ','))}>Tutto il saldo</button>
                <label style={{ flex: 1, minWidth: 160 }}>Nota (es. tavolo 4)
                  <input value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} />
                </label>
                <button className="adm-btn primary" type="submit" disabled={busy || !amount} style={{ alignSelf: 'flex-end' }}>Riscuoti</button>
              </form>
            )}

            {card.redemptions.length > 0 && (
              <div>
                <p className="adm-muted" style={{ margin: '0 0 .3rem' }}>Movimenti</p>
                <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                  {card.redemptions.map((x, i) => <li key={i}>{day(x.at)} · {eur(x.amount)}{x.note ? ` · ${x.note}` : ''}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="adm-panel">
        <div className="adm-row-between">
          <h2>Ultime gift card</h2>
          <button className="adm-btn sm" type="button" onClick={() => void loadRecent()}>Aggiorna</button>
        </div>
        {recent.length === 0 && <p className="adm-muted">Nessuna gift card venduta finora.</p>}
        {recent.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead><tr><th>Codice</th><th>Acquirente</th><th>Importo</th><th>Saldo</th><th>Data</th><th /></tr></thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.code}>
                    <td style={{ fontFamily: 'ui-monospace,monospace' }}>{c.code}{c.demo ? ' ·DEMO' : ''}</td>
                    <td>{c.buyerName}</td><td>{eur(c.amount)}</td><td>{eur(c.balance)}</td><td>{day(c.createdAt)}</td>
                    <td><button className="adm-btn sm" type="button" onClick={() => { setCode(c.code); void search(undefined, c.code); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Apri</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

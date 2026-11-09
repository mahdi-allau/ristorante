'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { window.location.reload(); return; }
      setError(res.status === 429 ? 'Troppi tentativi. Riprova tra qualche minuto.' : 'Password errata.');
    } catch {
      setError('Errore di rete. Riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-center">
      <form className="adm-card" onSubmit={submit}>
        <p className="adm-eyebrow">Osteria I Quattro Angeli</p>
        <h1>Pannello del ristorante</h1>
        <p>Accedi per modificare menu, orari e avvisi del sito.</p>
        <label>Password
          <input type="password" value={password} autoComplete="current-password" autoFocus
                 onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn primary" type="submit" disabled={busy || !password}>{busy ? 'Accesso…' : 'Accedi'}</button>
      </form>
    </main>
  );
}

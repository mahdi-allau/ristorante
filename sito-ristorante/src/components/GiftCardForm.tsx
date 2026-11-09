'use client';

import { useState } from 'react';
import Link from 'next/link';
import { href, type Locale } from '@/i18n/config';
import { fmt } from '@/i18n/dictionaries';
import type { GiftDict } from '@/i18n/gift';
import { track } from '@/lib/analytics';

const PRESETS = [50, 100, 150, 200];

interface Props { locale: Locale; t: GiftDict; min: number; max: number; demo: boolean }

export default function GiftCardForm({ locale, t, min, max, demo }: Props) {
  const [preset, setPreset] = useState<number | 'other'>(100);
  const [custom, setCustom] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const amount = preset === 'other' ? Number(custom) : preset;
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err =
      !Number.isInteger(amount) || amount < min || amount > max ? t.errors.amount
      : buyerName.trim().length < 2 ? t.errors.buyerName
      : !emailRe.test(buyerEmail.trim()) ? t.errors.buyerEmail
      : recipientEmail.trim() && !emailRe.test(recipientEmail.trim()) ? t.errors.recipientEmail
      : !terms ? t.errors.terms
      : !privacy ? t.errors.privacy
      : '';
    setError(err);
    if (err) return;

    setBusy(true);
    track('giftcard_checkout', { value: amount, currency: 'EUR' });
    try {
      const res = await fetch('/api/gift-card/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount, buyerName, buyerEmail, recipientName, recipientEmail, message, privacy, terms, locale, website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) { window.location.assign(data.url); return; }
      setError(res.status === 429 ? t.errors.rate : t.errors.generic);
    } catch {
      setError(t.errors.generic);
    }
    setBusy(false);
  }

  return (
    <form className="book" onSubmit={submit} noValidate>
      {demo && <p className="note" style={{ marginTop: 0 }}>{t.demoNotice}</p>}

      <fieldset className="slots-fs">
        <legend>{t.amount}</legend>
        <div className="slots" role="radiogroup" aria-label={t.amount}>
          {PRESETS.filter((p) => p >= min && p <= max).map((p) => (
            <button key={p} type="button" role="radio" aria-checked={preset === p}
                    className={`slot${preset === p ? ' sel' : ''}`} onClick={() => setPreset(p)}>
              {p} €
            </button>
          ))}
          <button type="button" role="radio" aria-checked={preset === 'other'}
                  className={`slot${preset === 'other' ? ' sel' : ''}`} onClick={() => setPreset('other')}>
            {t.other.replace(' (€)', '')}
          </button>
        </div>
        {preset === 'other' && (
          <label style={{ marginTop: '.8rem' }}>{t.other}
            <input type="number" inputMode="numeric" min={min} max={max} step={1} value={custom}
                   onChange={(e) => setCustom(e.target.value)} />
          </label>
        )}
        <p className="hint">{fmt(t.amountHint, { min, max })}</p>
      </fieldset>

      <h2 className="gift-h">{t.recipientTitle}</h2>
      <div className="row">
        <label>{t.recipientName}
          <input type="text" value={recipientName} maxLength={80} onChange={(e) => setRecipientName(e.target.value)} />
        </label>
        <label>{t.recipientEmail}
          <input type="email" value={recipientEmail} maxLength={120} onChange={(e) => setRecipientEmail(e.target.value)} />
        </label>
      </div>
      <p className="hint" style={{ marginTop: '-.4rem' }}>{t.recipientHint}</p>
      <label>{t.message}
        <textarea rows={3} maxLength={240} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      <h2 className="gift-h">{t.buyerTitle}</h2>
      <div className="row">
        <label>{t.buyerName}
          <input type="text" autoComplete="name" value={buyerName} maxLength={80} onChange={(e) => setBuyerName(e.target.value)} required />
        </label>
        <label>{t.buyerEmail}
          <input type="email" autoComplete="email" value={buyerEmail} maxLength={120} onChange={(e) => setBuyerEmail(e.target.value)} required />
        </label>
      </div>

      <div className="hp" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      <label className="check">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
        <span>{t.termsPre}<Link href={href(locale, '/gift-card/condizioni')} style={{ textDecoration: 'underline' }}>{t.termsLink}</Link>{t.termsPost}</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required />
        <span>{t.privacyPre}<Link href={href(locale, '/privacy')} style={{ textDecoration: 'underline' }}>{t.privacyLink}</Link>{t.privacyPost}</span>
      </label>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-block" type="submit" disabled={busy}>
        {busy ? t.paying : `${t.pay}${Number.isInteger(amount) && amount > 0 ? ` · ${amount} €` : ''}`}
      </button>
      <p className="hint center">{t.secure}</p>
    </form>
  );
}

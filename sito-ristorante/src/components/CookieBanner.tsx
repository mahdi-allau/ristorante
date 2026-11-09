'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OPEN_EVENT, readConsent, writeConsent } from '@/lib/consent';
import { href, type Locale } from '@/i18n/config';
import type { Dict } from '@/i18n/dictionaries';

export default function CookieBanner({ locale, t }: { locale: Locale; t: Dict['cookie'] }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [maps, setMaps] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) setOpen(true);
    else { setAnalytics(c.analytics); setMaps(c.maps); }
    const reopen = () => {
      const cur = readConsent();
      setAnalytics(cur?.analytics ?? false);
      setMaps(cur?.maps ?? false);
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const close = (a: boolean, m: boolean) => { writeConsent(a, m); setOpen(false); setCustom(false); };

  return (
    <div className="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
      <h2 id="cookie-title">{t.title}</h2>
      <p>{t.text}</p>

      {custom && (
        <div>
          <div className="opt">
            <input type="checkbox" checked disabled aria-label={t.necessary} />
            <span>{t.necessary}<small>{t.necessaryText}</small></span>
          </div>
          <label className="opt">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            <span>{t.analytics}<small>{t.analyticsText}</small></span>
          </label>
          <label className="opt">
            <input type="checkbox" checked={maps} onChange={(e) => setMaps(e.target.checked)} />
            <span>{t.maps}<small>{t.mapsText}</small></span>
          </label>
        </div>
      )}

      {/* Accetta e Rifiuta hanno pari evidenza (Linee guida Garante, giugno 2021) */}
      <div className="acts" style={custom ? { marginTop: '1rem' } : undefined}>
        <button type="button" className="btn btn-ghost" onClick={() => close(false, false)}>{t.reject}</button>
        {custom
          ? <button type="button" className="btn btn-ghost" onClick={() => close(analytics, maps)}>{t.save}</button>
          : <button type="button" className="btn btn-ghost" onClick={() => setCustom(true)}>{t.customize}</button>}
        <button type="button" className="btn btn-ghost" onClick={() => close(true, true)}>{t.accept}</button>
      </div>
      <Link className="more" href={href(locale, '/cookie')}>{t.more}</Link>
    </div>
  );
}

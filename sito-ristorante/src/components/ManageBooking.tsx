'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SITE } from '@/content/site';
import { fmt } from '@/i18n/dictionaries';
import type { ManageDict } from '@/i18n/manage';

interface Props {
  token: string;
  t: ManageDict;
  state: 'active' | 'confirmed' | 'cancelled' | 'past' | 'late';
  cutoffHours: number;
}

export default function ManageBooking({ token, t, state, cutoffHours }: Props) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function act(action: 'confirm' | 'cancel') {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/booking/manage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) { setAsking(false); router.refresh(); return; }
      const key = data.error as keyof ManageDict['errors'] | undefined;
      setError(res.status === 429 ? t.errors.rate : fmt((key && t.errors[key]) || t.errors.generic, { h: cutoffHours }));
      if (res.status === 409) router.refresh();
    } catch {
      setError(t.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  const call = <a className="link" href={`tel:${SITE.phoneHref}`}>{t.call} · {SITE.phone}</a>;

  if (state === 'cancelled') return <><p className="warn">{t.cancelled}</p><p>{call}</p></>;
  if (state === 'past') return <p className="warn">{t.past}</p>;
  if (state === 'late') return <><p className="warn">{fmt(t.tooLate, { h: cutoffHours, phone: SITE.phone })}</p><p>{call}</p></>;

  return (
    <div className="manage-actions">
      {state === 'confirmed'
        ? <p className="warn" role="status">{t.confirmedByGuest}</p>
        : <button className="btn" type="button" onClick={() => act('confirm')} disabled={busy}>{t.confirmBtn}</button>}

      {!asking ? (
        <button className="link" type="button" onClick={() => setAsking(true)} disabled={busy}>{t.cancelBtn}</button>
      ) : (
        <div className="manage-ask" role="alertdialog" aria-label={t.cancelBtn}>
          <p>{t.cancelAsk}</p>
          <div className="acts">
            <button className="btn btn-ghost" type="button" onClick={() => act('cancel')} disabled={busy}>{t.cancelYes}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setAsking(false)} disabled={busy}>{t.cancelNo}</button>
          </div>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}

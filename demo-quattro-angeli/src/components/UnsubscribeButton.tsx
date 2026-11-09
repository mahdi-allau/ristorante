'use client';

import { useState } from 'react';
import type { ManageDict } from '@/i18n/manage';

export default function UnsubscribeButton({ token, t }: { token: string; t: ManageDict['unsub'] }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function go() {
    setState('busy');
    try {
      const res = await fetch('/api/booking/unsubscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') return <p className="warn" role="status">{t.done}</p>;
  return (
    <>
      <button className="btn" type="button" onClick={go} disabled={state === 'busy'}>{t.button}</button>
      {state === 'error' && <p className="error" role="alert">{t.error}</p>}
    </>
  );
}

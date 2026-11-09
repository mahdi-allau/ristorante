'use client';

import { useEffect, useState } from 'react';
import { addDays, fmtTime, rangesOn, romeNow, toDec, type HoursConfig } from '@/lib/hours';
import { fmt } from '@/i18n/dictionaries';

interface Props {
  t: { open: string; closed: string; closedDay: string; days: string[] };
  hours: HoursConfig;
}

function compute(t: Props['t'], hours: HoursConfig): { open: boolean; msg: string } {
  const n = romeNow();
  const today = rangesOn(n.ymd, hours).map((r) => [toDec(r.from), toDec(r.to)] as const);
  const cur = today.find(([a, b]) => n.time >= a && n.time < b);
  if (cur) return { open: true, msg: fmt(t.open, { t: fmtTime(cur[1]) }) };
  const next = today.find(([a]) => n.time < a);
  if (next) return { open: false, msg: fmt(t.closed, { t: fmtTime(next[0]) }) };
  for (let i = 1; i <= 60; i++) {
    const ymd = addDays(n.ymd, i);
    const first = rangesOn(ymd, hours)[0];
    if (first) {
      const day = t.days[(n.day + i) % 7];
      return { open: false, msg: fmt(t.closedDay, { d: day, t: first.from }) };
    }
  }
  return { open: false, msg: '' };
}

/** Calcolato solo nel browser (evita differenze server/client); aggiornato ogni minuto. */
export default function OpenStatus({ t, hours }: Props) {
  const [s, setS] = useState<{ open: boolean; msg: string } | null>(null);
  useEffect(() => {
    const run = () => setS(compute(t, hours));
    run();
    const id = setInterval(run, 60_000);
    return () => clearInterval(id);
  }, [t, hours]);

  return (
    <p className="status" role="status" aria-live="polite">
      {s ? (<><i className={s.open ? 'open' : ''} />{s.msg}</>) : ' '}
    </p>
  );
}

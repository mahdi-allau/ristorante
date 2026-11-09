'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MAX_GUESTS, TZ } from '@/content/site';
import { addDays } from '@/lib/hours';
import { track } from '@/lib/analytics';
import { BOOKING_HORIZON_DAYS } from '@/content/site';
import { href, intlLocale, type Locale } from '@/i18n/config';
import { fmt, type Dict } from '@/i18n/dictionaries';

interface Slot { time: string; service: 'lunch' | 'dinner'; available: boolean }
interface Av { closed: boolean; slots: Slot[] }
type Done = { name: string; email: string; guests: number; date: string; time: string; demo: boolean };

const todayRome = () => new Date().toLocaleDateString('sv-SE', { timeZone: TZ });

export default function BookingForm({ locale, t }: { locale: Locale; t: Dict['booking'] }) {
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [av, setAv] = useState<Av | null>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [reviewOptIn, setReviewOptIn] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const started = useRef(false);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = todayRome();
    setMinDate(today);
    setMaxDate(addDays(today, BOOKING_HORIZON_DAYS));
  }, []);

  useEffect(() => {
    setTime('');
    if (!date) { setAv(null); return; }
    const ctl = new AbortController();
    setLoading(true);
    fetch(`/api/availability?date=${date}&guests=${guests}`, { signal: ctl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<Av>) : Promise.reject(new Error('bad'))))
      .then((d) => { setAv(d); setLoading(false); })
      .catch((e) => { if (e.name !== 'AbortError') { setAv(null); setLoading(false); setError(t.errors.generic); } });
    return () => ctl.abort();
  }, [date, guests, t.errors.generic]);

  useEffect(() => { if (done) confirmRef.current?.focus(); }, [done]);

  const groups = useMemo(() => {
    const s = av?.slots ?? [];
    return [
      { id: 'lunch', label: t.lunch, slots: s.filter((x) => x.service === 'lunch') },
      { id: 'dinner', label: t.dinner, slots: s.filter((x) => x.service === 'dinner') },
    ].filter((g) => g.slots.length);
  }, [av, t.lunch, t.dinner]);

  const anyFree = av?.slots.some((s) => s.available) ?? false;
  const step = !date ? 0 : !time ? 1 : 2;

  function markStarted() {
    if (!started.current) { started.current = true; track('booking_start'); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err =
      !date ? t.errors.date
      : !time ? t.errors.time
      : name.trim().length < 2 ? t.errors.name
      : phone.replace(/\D/g, '').length < 7 ? t.errors.phone
      : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? t.errors.email
      : !privacy ? t.errors.privacy
      : '';
    setError(err);
    if (err) return;

    setSending(true);
    track('booking_submit');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, guests, name, phone, email, notes, privacy, marketing, reviewOptIn, website, locale }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; demo?: boolean; error?: string };
      if (res.ok && data.ok) {
        setDone({ name, email, guests, date, time, demo: !!data.demo });
        track('booking_confirmed', { guests });
      } else if (data.error === 'full') {
        setError(t.errors.full);
        setTime('');
        setDate((d) => d); // ricarica gli orari
        setAv(null);
        const r = await fetch(`/api/availability?date=${date}&guests=${guests}`);
        if (r.ok) setAv((await r.json()) as Av);
      } else if (res.status === 429) {
        setError(t.errors.rate);
      } else {
        setError(t.errors.generic);
      }
    } catch {
      setError(t.errors.generic);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setDone(null); setTime(''); setNotes(''); setPrivacy(false); setMarketing(false); setReviewOptIn(false); setError('');
    started.current = false;
  }

  if (done) {
    const when = new Intl.DateTimeFormat(intlLocale[locale], {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
    }).format(new Date(`${done.date}T12:00:00Z`));
    const persons = fmt(done.guests === 1 ? t.persons[0] : t.persons[1], { n: done.guests });
    return (
      <div className="confirm" ref={confirmRef} role="status" tabIndex={-1}>
        <p className="eyebrow">{t.confirmEyebrow}</p>
        <h3>{fmt(t.thanks, { name: done.name.split(' ')[0] })}</h3>
        <p>
          {fmt(t.confirmText, { n: persons, date: when, time: done.time, email: done.email })}
          {done.demo && ` ${t.demoHint}`}
        </p>
        <button className="link" type="button" onClick={reset}>{t.again}</button>
      </div>
    );
  }

  return (
    <form className="book reveal" onSubmit={submit} noValidate onFocus={markStarted}>
      <ol className="steps" aria-hidden="true">
        {t.steps.map((s, i) => <li key={s} className={i <= step ? 'on' : undefined}>{s}</li>)}
      </ol>

      <div className="row">
        <label>{t.date}
          <input type="date" value={date} min={minDate} max={maxDate} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>{t.guests}
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{fmt(n === 1 ? t.guestsOpt[0] : t.guestsOpt[1], { n })}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="slots-fs">
        <legend>{t.time}</legend>
        <div className="slots" role="radiogroup" aria-label={t.time}>
          {groups.map((g) => (
            <div className="slot-group" key={g.id}>
              <span className="slot-sep">{g.label}</span>
              {g.slots.map((s) => (
                <button
                  key={s.time} type="button" role="radio" aria-checked={time === s.time}
                  className={`slot${time === s.time ? ' sel' : ''}`} disabled={!s.available}
                  onClick={() => setTime(s.time)}
                >
                  {s.time}
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className="hint" aria-live="polite">
          {!date ? t.pickDate
            : loading ? t.loading
            : av?.closed ? t.closedDay
            : av && !anyFree ? t.allFull
            : av ? t.legendFull : ''}
        </p>
      </fieldset>

      <div className="row">
        <label>{t.name}
          <input type="text" value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>{t.phone}
          <input type="tel" value={phone} autoComplete="tel" onChange={(e) => setPhone(e.target.value)} required />
        </label>
      </div>
      <label>{t.email}
        <input type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>{t.notes}
        <textarea rows={2} value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div className="hp" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      <label className="check">
        <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} required />
        <span>{t.privacyPre}<Link href={href(locale, '/privacy')} style={{ textDecoration: 'underline' }}>{t.privacyLink}</Link>{t.privacyPost}</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        <span>{t.marketing}</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={reviewOptIn} onChange={(e) => setReviewOptIn(e.target.checked)} />
        <span>{t.reviewOptIn}</span>
      </label>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-block" type="submit" disabled={sending}>{sending ? t.sending : t.submit}</button>
      <p className="hint center">{t.hint}</p>
    </form>
  );
}

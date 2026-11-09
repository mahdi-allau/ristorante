'use client';

import { useEffect, useState } from 'react';
import { fmt } from '@/i18n/dictionaries';
import { intlLocale, type Locale } from '@/i18n/config';
import { romeNow, type HoursConfig } from '@/lib/hours';

interface Props {
  locale: Locale;
  hours: HoursConfig;
  days: string[];
  closed: string;
  closuresTitle: string;
  closureRange: string;
}

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunedì → domenica

export default function HoursTable({ locale, hours, days, closed, closuresTitle, closureRange }: Props) {
  const [today, setToday] = useState<{ day: number; ymd: string } | null>(null);
  useEffect(() => { const n = romeNow(); setToday({ day: n.day, ymd: n.ymd }); }, []);

  const dateFmt = new Intl.DateTimeFormat(intlLocale[locale], { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const show = (ymd: string) => dateFmt.format(new Date(`${ymd}T12:00:00Z`));
  // Solo le chiusure future o in corso (da oggi in poi); finché non si conosce "oggi" si mostrano tutte
  const upcoming = hours.closures.filter((c) => !today || c.to >= today.ymd).sort((a, b) => a.from.localeCompare(b.from));

  return (
    <>
      <table className="hours">
        <tbody>
          {ORDER.map((d) => (
            <tr key={d} className={today?.day === d ? 'today' : undefined}>
              <th scope="row">{days[d]}</th>
              <td>
                {hours.week[d]?.length
                  ? hours.week[d].map((r) => `${r.from}–${r.to}`).join(' · ')
                  : closed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {upcoming.length > 0 && (
        <div className="closures">
          <h4>{closuresTitle}</h4>
          <ul>
            {upcoming.map((c) => (
              <li key={`${c.from}-${c.to}`}>
                {c.from === c.to ? show(c.from) : fmt(closureRange, { a: show(c.from), b: show(c.to) })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

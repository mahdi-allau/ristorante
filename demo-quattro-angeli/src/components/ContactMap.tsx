'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/content/site';
import { CONSENT_EVENT, readConsent, type Consent } from '@/lib/consent';
import type { Dict } from '@/i18n/dictionaries';

/** Google Maps si carica solo con consenso "mappe" oppure dopo un clic esplicito. */
export default function ContactMap({ t }: { t: Dict['contacts'] }) {
  const [allowed, setAllowed] = useState(false);
  const [once, setOnce] = useState(false);

  useEffect(() => {
    setAllowed(!!readConsent()?.maps);
    const h = (e: Event) => setAllowed((e as CustomEvent<Consent>).detail.maps);
    window.addEventListener(CONSENT_EVENT, h);
    return () => window.removeEventListener(CONSENT_EVENT, h);
  }, []);

  const q = encodeURIComponent(`${SITE.street}, ${SITE.zip} ${SITE.city}`);
  if (allowed || once) {
    return (
      <div className="map">
        <iframe
          title={t.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${q}&output=embed`}
        />
      </div>
    );
  }
  return (
    <div className="map">
      <div>
        <p>{t.mapText}</p>
        <button type="button" className="link map-btn" onClick={() => setOnce(true)}>{t.mapLoad}</button>
      </div>
    </div>
  );
}

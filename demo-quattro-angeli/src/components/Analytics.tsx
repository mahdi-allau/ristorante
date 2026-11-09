'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { CONSENT_EVENT, readConsent, type Consent } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Google Analytics 4: nessuno script e nessun cookie prima del consenso alle statistiche. */
export default function Analytics() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(!!readConsent()?.analytics);
    const h = (e: Event) => setOn((e as CustomEvent<Consent>).detail.analytics);
    window.addEventListener(CONSENT_EVENT, h);
    return () => window.removeEventListener(CONSENT_EVENT, h);
  }, []);

  if (!GA_ID || !on || !/^G-[A-Z0-9]+$/.test(GA_ID)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}

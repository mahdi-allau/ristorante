'use client';

import { openConsent } from '@/lib/consent';

export default function ManageCookies({ label }: { label: string }) {
  return <button type="button" onClick={openConsent}>{label}</button>;
}

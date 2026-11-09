'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { href, localeFromPath, type Locale } from '@/i18n/config';

interface S { title: string; text: string; cta: string }

export default function NotFoundView({ strings }: { strings: Record<Locale, S> }) {
  const pathname = usePathname() ?? '/';
  const locale = localeFromPath(pathname);
  const t = strings[locale];
  return (
    <main id="main" className="nf">
      <div>
        <p className="eyebrow">404</p>
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        <Link className="btn" href={href(locale, '/')}>{t.cta}</Link>
      </div>
    </main>
  );
}

import { NextResponse, type NextRequest } from 'next/server';
import { locales } from '@/i18n/config';

// Italiano alla radice (/), le altre lingue sotto il proprio prefisso (/en, /fr, /ar, /de, /es).
// Internamente le pagine vivono in app/[locale].
const PREFIXED = locales.filter((l) => l !== 'it');

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /it e /it/... sono duplicati dell'italiano senza prefisso: redirect permanente
  if (pathname === '/it' || pathname.startsWith('/it/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (PREFIXED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/it${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|admin|_next|opengraph-image|.*\\..*).*)'],
};

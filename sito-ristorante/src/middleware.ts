import { NextResponse, type NextRequest } from 'next/server';

// Italiano alla radice (/), inglese sotto /en. Internamente le pagine vivono in app/[locale].
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /it e /it/... sono duplicati dell'italiano senza prefisso: redirect permanente
  if (pathname === '/it' || pathname.startsWith('/it/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/it${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|admin|_next|opengraph-image|.*\\..*).*)'],
};

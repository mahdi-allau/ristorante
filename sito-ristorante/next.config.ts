import type { NextConfig } from 'next';

// Content-Security-Policy di base. 'unsafe-inline' per gli script serve agli script inline di Next.js
// (con i nonce l'intero sito diventerebbe dinamico e non cacheabile): resta comunque vietato caricare
// script, stili, frame o connessioni da domini non elencati.
//  - Google Analytics e Maps compaiono solo dopo il consenso cookie.
//  - Stripe Checkout è un reindirizzamento di pagina intera: non richiede regole qui.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com https://www.google.com https://maps.gstatic.com https://*.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.google.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  // CSS incluso nell'HTML: elimina la richiesta che blocca il primo rendering
  experimental: { inlineCss: true },
  // Metadati (title, description, Open Graph) sempre nell'<head>, anche per Chrome/Lighthouse
  htmlLimitedBots: /.*/,
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

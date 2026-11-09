import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'Quattro Angeli',
    start_url: '/',
    display: 'standalone',
    background_color: '#120A0B',
    theme_color: '#120A0B',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

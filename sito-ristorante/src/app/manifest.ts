import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: 'Lumina',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E0D0B',
    theme_color: '#0E0D0B',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

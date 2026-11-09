import { ImageResponse } from 'next/og';

// Immagine per le anteprime sui social (WhatsApp, Facebook, LinkedIn…), 1200x630.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 90, color: '#F3EEE6', fontFamily: 'Georgia, serif',
          backgroundColor: '#0E0D0B',
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(183,154,91,0.35), rgba(14,13,11,0) 60%)',
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 8, color: '#B79A5B', textTransform: 'uppercase', marginBottom: 28 }}>
          Navigli · Milano
        </div>
        <div style={{ fontSize: 112, lineHeight: 1.02, display: 'flex' }}>Osteria Lumina</div>
        <div style={{ fontSize: 40, fontStyle: 'italic', color: '#D4BC82', marginTop: 24, display: 'flex' }}>
          La cucina italiana, a lume di candela.
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
  );
}

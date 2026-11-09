import { ImageResponse } from 'next/og';

// Immagine per le anteprime sui social (WhatsApp, Facebook, LinkedIn…), 1200x630.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 90, color: '#F3EEE6', fontFamily: 'Georgia, serif',
          backgroundColor: '#120A0B',
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(212,121,90,0.35), rgba(18,10,11,0) 60%)',
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 8, color: '#D4795A', textTransform: 'uppercase', marginBottom: 28 }}>
          Ferrara · Largo Castello
        </div>
        <div style={{ fontSize: 96, lineHeight: 1.05, display: 'flex' }}>Osteria I Quattro Angeli</div>
        <div style={{ fontSize: 40, fontStyle: 'italic', color: '#EDA987', marginTop: 24, display: 'flex' }}>
          La tradizione ferrarese, e oltre.
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
  );
}

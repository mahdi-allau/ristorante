'use client';

import { useEffect, useRef, useState } from 'react';

// Video decorativo (muto, in loop): parte solo quando entra nello schermo e non parte per chi ha chiesto meno animazioni
// o ha il risparmio dati; fino ad allora resta l'immagine di anteprima.
export default function LazyVideo({ base, poster }: { base: string; poster: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData || !box.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setPlay(true); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="lazy-video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" loading="lazy" decoding="async" />
      {play && (
        <video autoPlay muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1}>
          <source src={`${base}.mp4`} type="video/mp4" />
          <source src={`${base}.webm`} type="video/webm" />
        </video>
      )}
    </div>
  );
}

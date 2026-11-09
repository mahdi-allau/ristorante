'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

/** Header che si scurisce allo scroll, animazioni di comparsa e tracciamento dei clic chiave. */
export default function PageEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector('.header');
    const onScroll = () => header?.classList.toggle('solid', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
      if (el?.dataset.track) track(el.dataset.track);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}

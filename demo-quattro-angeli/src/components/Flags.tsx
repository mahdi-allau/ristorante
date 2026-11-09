import type { Locale } from '@/i18n/config';

// Bandiere disegnate in SVG (le emoji delle bandiere su Windows compaiono come lettere).
// Arabo: bandiera degli Emirati Arabi Uniti, la più usata nei selettori di lingua e senza scritte sacre.
const FLAGS: Record<Locale, React.ReactNode> = {
  it: (<><rect width="1" height="2" fill="#009246" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#CE2B37" /></>),
  fr: (<><rect width="1" height="2" fill="#0055A4" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#EF4135" /></>),
  de: (<><rect width="3" height="0.667" fill="#000" /><rect y="0.667" width="3" height="0.667" fill="#DD0000" /><rect y="1.333" width="3" height="0.667" fill="#FFCE00" /></>),
  es: (<><rect width="3" height="2" fill="#AA151B" /><rect y="0.5" width="3" height="1" fill="#F1BF00" /></>),
  ar: (<><rect width="3" height="2" fill="#fff" /><rect width="3" height="0.667" fill="#00732F" /><rect y="1.333" width="3" height="0.667" fill="#000" /><rect width="0.75" height="2" fill="#FF0000" /></>),
  en: (<>
    <rect width="3" height="2" fill="#012169" />
    <path d="M0 0 3 2M3 0 0 2" stroke="#fff" strokeWidth="0.4" />
    <path d="M0 0 3 2M3 0 0 2" stroke="#C8102E" strokeWidth="0.15" />
    <path d="M1.5 0v2M0 1h3" stroke="#fff" strokeWidth="0.7" />
    <path d="M1.5 0v2M0 1h3" stroke="#C8102E" strokeWidth="0.4" />
  </>),
};

export default function Flag({ locale, size = 22 }: { locale: Locale; size?: number }) {
  return (
    <svg className="flag" width={size} height={Math.round((size * 2) / 3)} viewBox="0 0 3 2" role="img" aria-hidden="true" focusable="false">
      {FLAGS[locale]}
    </svg>
  );
}

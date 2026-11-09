import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Pannello — Osteria Lumina',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="adm">{children}</body>
    </html>
  );
}

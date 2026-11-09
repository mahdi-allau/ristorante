import { notFound } from 'next/navigation';

// Qualsiasi percorso sconosciuto mostra la 404 curata dentro il layout del sito.
export default function CatchAll() {
  notFound();
}

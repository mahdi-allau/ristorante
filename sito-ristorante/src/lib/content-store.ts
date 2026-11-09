import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { unstable_cache } from 'next/cache';
import { DEFAULT_CONTENT } from '@/content/defaults';
import type { Content } from '@/content/types';
import { contentSchema } from '@/content/validation';
import { getAdmin } from './supabase';

/**
 * Archivio dei contenuti modificabili dal pannello /admin.
 *  - Con Supabase configurato: tabella `site_content` (chiave 'main').
 *  - Altrimenti: file locale data/content.json (sviluppo o server con disco scrivibile).
 *  - Se nulla è stato ancora salvato: valori predefiniti.
 */
const FILE = path.join(process.cwd(), 'data', 'content.json');
const KEY = 'main';

async function readRaw(): Promise<unknown | null> {
  const db = getAdmin();
  if (db) {
    const { data, error } = await db.from('site_content').select('value').eq('key', KEY).maybeSingle();
    if (error) throw new Error(`site_content: ${error.message}`);
    return data?.value ?? null;
  }
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

async function loadContent(): Promise<Content> {
  try {
    const raw = await readRaw();
    if (raw == null) return DEFAULT_CONTENT;
    const parsed = contentSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    console.error('content non valido, uso i predefiniti:', parsed.error.issues[0]);
  } catch (e) {
    console.error('lettura contenuti fallita, uso i predefiniti:', e);
  }
  return DEFAULT_CONTENT;
}

/** Lettura con cache; si invalida con revalidateTag('content') dopo ogni salvataggio. */
export const getContent = unstable_cache(loadContent, ['site-content'], { tags: ['content'] });

/** Lettura diretta senza cache (usata dal pannello admin per mostrare sempre l'ultima versione). */
export const getContentFresh = loadContent;

export async function saveContent(content: Content): Promise<void> {
  const db = getAdmin();
  if (db) {
    const { error } = await db
      .from('site_content')
      .upsert({ key: KEY, value: content, updated_at: new Date().toISOString() });
    if (error) throw new Error(`site_content: ${error.message}`);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(content, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

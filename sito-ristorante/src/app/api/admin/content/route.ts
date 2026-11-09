import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { contentSchema } from '@/content/validation';
import { isAuthedRequest } from '@/lib/admin-auth';
import { saveContent } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  if (!isAuthedRequest(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'invalid' }, { status: 415 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }

  const parsed = contentSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: 'validation', message: issue?.message ?? 'Dati non validi', path: issue?.path.join('.') },
      { status: 422 },
    );
  }

  try {
    await saveContent(parsed.data);
  } catch (e) {
    console.error('salvataggio contenuti fallito', e);
    return NextResponse.json(
      { error: 'storage', message: 'Impossibile salvare: archivio non scrivibile. Configura Supabase.' },
      { status: 500 },
    );
  }

  // Aggiorna subito tutte le pagine pubbliche (IT e EN)
  revalidateTag('content');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}

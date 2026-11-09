import { cookies } from 'next/headers';
import { ADMIN_COOKIE, isAdminConfigured, verifySessionToken } from '@/lib/admin-auth';
import { getContentFresh } from '@/lib/content-store';
import { getAdmin } from '@/lib/supabase';
import Editor from './Editor';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <main className="adm-center">
        <div className="adm-card">
          <h1>Pannello non attivo</h1>
          <p>Imposta <code>ADMIN_PASSWORD</code> e <code>ADMIN_SECRET</code> (almeno 24 caratteri) nelle variabili d&apos;ambiente e riavvia il sito.</p>
        </div>
      </main>
    );
  }

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) return <LoginForm />;

  const content = await getContentFresh();
  return <Editor initial={content} storage={getAdmin() ? 'supabase' : 'file'} />;
}

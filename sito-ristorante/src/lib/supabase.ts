import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

/** Client con service_role, SOLO lato server. Restituisce null in modalità demo (variabili mancanti). */
export function getAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export const isDemoMode = (): boolean => getAdmin() === null;

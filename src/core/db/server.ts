import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '../env';

/**
 * Cliente com service_role: ignora RLS e tem acesso total ao banco.
 *
 * O `server-only` no topo faz o build falhar se este módulo for importado por
 * um Client Component — é a garantia mecânica de que a chave nunca chega ao
 * navegador. É essa fronteira que resolve o achado A1 da auditoria.
 */
let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    client = createClient(serverEnv.supabaseUrl, serverEnv.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

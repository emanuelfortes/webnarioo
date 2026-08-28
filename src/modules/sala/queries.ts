import 'server-only';
import { db } from '@/core/db/server';
import type { MessageRow } from '@/core/types';

/**
 * Histórico do chat da sessão, carregado no servidor para que a sala já chegue
 * com as mensagens renderizadas. O realtime assume a partir daí.
 */
export async function mensagensDaSessao(sessionAt: number, limite = 300): Promise<MessageRow[]> {
  const { data } = await db()
    .from('messages')
    .select('*')
    .eq('session_at', sessionAt)
    .order('id', { ascending: true })
    .limit(limite);

  return (data ?? []) as MessageRow[];
}

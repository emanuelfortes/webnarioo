import 'server-only';
import { db } from '@/core/db/server';
import { exigirAdmin } from '@/core/auth/session';
import type { Application, Lead } from '@/core/types';

/**
 * B6 da auditoria: as listas truncavam em 2000 linhas sem paginação e sem
 * aviso. Retornar o total junto permite dizer na tela quantas ficaram de fora.
 */
export interface Pagina<T> {
  itens: T[];
  total: number;
  limite: number;
}

const LIMITE = 500;

export async function listarLeads(): Promise<Pagina<Lead>> {
  await exigirAdmin();

  const { data, count } = await db()
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(LIMITE);

  return { itens: (data ?? []) as Lead[], total: count ?? 0, limite: LIMITE };
}

export async function listarAplicacoes(): Promise<Pagina<Application>> {
  await exigirAdmin();

  const { data, count } = await db()
    .from('applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(LIMITE);

  return { itens: (data ?? []) as Application[], total: count ?? 0, limite: LIMITE };
}

/** Sessões que já tiveram inscritos, da mais recente para a mais antiga. */
export async function listarSessoes(): Promise<number[]> {
  await exigirAdmin();

  const { data } = await db()
    .from('leads')
    .select('session_at')
    .order('session_at', { ascending: false })
    .limit(1000);

  const unicas = new Set((data ?? []).map((l) => l.session_at as number));
  return [...unicas].sort((a, b) => b - a);
}

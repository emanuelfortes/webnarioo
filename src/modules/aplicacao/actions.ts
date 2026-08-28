'use server';

import { db } from '@/core/db/server';
import { visitante } from '@/core/identity';
import { CHAVES } from './steps';

export interface ResultadoAplicacao {
  ok: boolean;
  erro?: string;
}

/**
 * Grava a aplicação.
 *
 * B7 da auditoria: antes o insert guardava só as respostas. Sem `lead_id` nem
 * `session_at`, a linha "Preencheram a aplicação" do funil era um cruzamento
 * entre tabelas sem chave — não dava para saber de qual sessão veio ninguém.
 * A identidade vem do cookie e a sessão, do próprio lead.
 */
export async function enviarAplicacao(
  respostas: Record<string, string>,
): Promise<ResultadoAplicacao> {
  const eu = await visitante();

  // Aceita apenas as chaves do questionário: o cliente não escolhe colunas.
  const limpas: Record<string, string> = {};
  for (const chave of CHAVES) {
    const valor = respostas[chave];
    if (typeof valor === 'string' && valor.trim()) {
      limpas[chave] = valor.trim().slice(0, 500);
    }
  }

  if (Object.keys(limpas).length === 0) {
    return { ok: false, erro: 'Nenhuma resposta recebida.' };
  }

  let sessionAt: number | null = null;
  if (eu.leadId) {
    const { data } = await db().from('leads').select('session_at').eq('id', eu.leadId).single();
    sessionAt = (data?.session_at as number | undefined) ?? null;
  }

  const { error } = await db()
    .from('applications')
    .insert({ ...limpas, lead_id: eu.leadId, session_at: sessionAt });

  if (error) {
    console.error('[aplicacao] falha ao gravar', error.message);
    return { ok: false, erro: 'Não conseguimos salvar sua aplicação. Tente novamente.' };
  }

  return { ok: true };
}

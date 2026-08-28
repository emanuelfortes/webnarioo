import 'server-only';
import { cookies } from 'next/headers';
import type { Visitor } from './types';

const COOKIE_LEAD = 'wb_lead';
const COOKIE_NOME = 'wb_name';
const DURACAO_DIAS = 30;

/**
 * A3 da auditoria: antes a identidade nascia no navegador com
 * `localStorage.getItem('wb_lead') || crypto.randomUUID()` — e o UUID novo
 * nunca era gravado de volta. Quem abrisse /sala direto virava um lead novo a
 * cada carregamento, e todo evento apontava para um lead inexistente.
 *
 * Agora a identidade é emitida pelo servidor no momento do cadastro e vive num
 * cookie httpOnly. Sem cadastro não há identidade — e sem identidade não há
 * evento, o que mantém as métricas limpas em vez de enchê-las de lixo.
 */
export async function visitante(): Promise<Visitor> {
  const jar = await cookies();
  return {
    leadId: jar.get(COOKIE_LEAD)?.value ?? null,
    name: jar.get(COOKIE_NOME)?.value ?? 'Visitante',
  };
}

export async function registrarIdentidade(leadId: string, nome: string): Promise<void> {
  const jar = await cookies();
  const opcoes = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACAO_DIAS * 24 * 3600,
  };

  jar.set(COOKIE_LEAD, leadId, opcoes);
  jar.set(COOKIE_NOME, nome, opcoes);
}

'use server';

import { redirect } from 'next/navigation';
import { db } from '@/core/db/server';
import { getConfig } from '@/core/config';
import { registrarIdentidade } from '@/core/identity';

export interface EstadoCadastro {
  erro?: string;
}

/**
 * Próximo horário de sessão, com no mínimo 1 minuto de antecedência.
 *
 * B5 da auditoria: antes isso rodava no navegador e usava o intervalo padrão de
 * 15 minutos caso o visitante enviasse o formulário antes de a configuração
 * carregar. No servidor a configuração já está resolvida quando a conta acontece.
 */
function proximaSessao(intervalMin: number): number {
  const ms = Math.max(1, intervalMin) * 60000;
  return Math.ceil((Date.now() + 60000) / ms) * ms;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function cadastrar(
  _anterior: EstadoCadastro,
  form: FormData,
): Promise<EstadoCadastro> {
  const nome = String(form.get('nome') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const whatsapp = String(form.get('whatsapp') ?? '').trim();
  const consentiu = form.get('consentimento') === 'on';

  // Validação no servidor. Antes, qualquer um podia inserir linhas arbitrárias
  // na tabela `leads` com a anon key, sem passar por validação nenhuma.
  if (nome.length < 2) return { erro: 'Informe seu nome.' };
  if (!EMAIL.test(email)) return { erro: 'Informe um e-mail válido.' };
  if (whatsapp.replace(/\D/g, '').length < 10) return { erro: 'Informe um WhatsApp válido com DDD.' };
  if (!consentiu) return { erro: 'É preciso aceitar a política de privacidade para continuar.' };

  const cfg = await getConfig();
  const sessionAt = proximaSessao(cfg.interval_min);

  const { data, error } = await db()
    .from('leads')
    .insert({
      name: nome.slice(0, 120),
      email,
      whatsapp: whatsapp.slice(0, 40),
      session_at: sessionAt,
      consent_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    return { erro: 'Não conseguimos registrar sua vaga. Tente novamente em instantes.' };
  }

  await registrarIdentidade(data.id as string, nome);

  redirect(`/sala?s=${sessionAt}`);
}

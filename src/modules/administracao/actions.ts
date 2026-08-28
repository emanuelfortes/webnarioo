'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/core/db/server';
import { exigirAdmin } from '@/core/auth/session';
import type { ScheduledMessage } from '@/core/types';

export interface EstadoConfig {
  ok?: boolean;
  erro?: string;
}

const CAMPOS_TEXTO = [
  'title',
  'video_url',
  'offer_title',
  'offer_headline',
  'offer_text',
  'cta_label',
  'cta_url',
  'booking_url',
] as const;

const CAMPOS_NUMERO = ['duration_sec', 'interval_min', 'offer_show_at_sec'] as const;

/**
 * A1 da auditoria: antes este update saía do navegador com a anon key. Se o RLS
 * não estivesse perfeito, qualquer visitante reescrevia a configuração do
 * webinar. Agora exige sessão de admin assinada, verificada no servidor.
 */
export async function salvarConfig(
  _anterior: EstadoConfig,
  form: FormData,
): Promise<EstadoConfig> {
  await exigirAdmin();

  let agendadas: ScheduledMessage[];
  try {
    const bruto = JSON.parse(String(form.get('scheduled_messages') ?? '[]'));
    if (!Array.isArray(bruto)) throw new Error('esperava uma lista');

    agendadas = bruto.map((m, i) => {
      if (typeof m?.at !== 'number' || typeof m?.text !== 'string') {
        throw new Error(`item ${i}: precisa de "at" numérico e "text" em texto`);
      }
      return { at: m.at, name: String(m.name ?? 'Apresentador'), text: m.text };
    });
  } catch (e) {
    return { erro: 'JSON das mensagens programadas inválido: ' + (e as Error).message };
  }

  const atualizacao: Record<string, unknown> = { scheduled_messages: agendadas };

  for (const campo of CAMPOS_TEXTO) {
    atualizacao[campo] = String(form.get(campo) ?? '');
  }
  for (const campo of CAMPOS_NUMERO) {
    const n = Number.parseInt(String(form.get(campo) ?? '0'), 10);
    atualizacao[campo] = Number.isFinite(n) && n >= 0 ? n : 0;
  }

  const { error } = await db().from('webinar_config').update(atualizacao).eq('id', 1);
  if (error) return { erro: 'Erro ao salvar: ' + error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function enviarComoApresentador(sessionAt: number, texto: string): Promise<void> {
  await exigirAdmin();

  const limpo = texto.trim().slice(0, 500);
  if (!limpo || !Number.isFinite(sessionAt)) return;

  await db().from('messages').insert({
    session_at: sessionAt,
    lead_id: null,
    name: 'ACEV',
    text: limpo,
    is_host: true,
  });
}

export async function apagarMensagem(id: number): Promise<void> {
  await exigirAdmin();
  await db().from('messages').delete().eq('id', id);
}

/** Histórico do chat de uma sessão, para a aba de moderação. */
export async function carregarMensagens(sessionAt: number) {
  await exigirAdmin();

  const { data } = await db()
    .from('messages')
    .select('*')
    .eq('session_at', sessionAt)
    .order('id', { ascending: true })
    .limit(500);

  return (data ?? []) as import('@/core/types').MessageRow[];
}

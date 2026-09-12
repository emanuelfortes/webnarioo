'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/core/db/server';
import { exigirAdmin } from '@/core/auth/session';
import type { ScheduledMessage, ViewerPoint } from '@/core/types';

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
  // Copy da landing de captação.
  'landing_subtitle',
  'author_name',
  'author_bio',
  'register_cta_label',
  'consent_text',
  'footer_text',
] as const;

const CAMPOS_NUMERO = ['duration_sec', 'interval_min', 'offer_show_at_sec'] as const;

/** Lê um JSON vindo do formulário, garantindo que é uma lista. */
function lista(form: FormData, campo: string): unknown[] {
  const bruto = JSON.parse(String(form.get(campo) ?? '[]'));
  if (!Array.isArray(bruto)) throw new Error('esperava uma lista');
  return bruto;
}

function lerMensagens(form: FormData): ScheduledMessage[] {
  return lista(form, 'scheduled_messages')
    .map((m, i) => {
      const item = m as Partial<ScheduledMessage>;

      if (typeof item?.at !== 'number' || !Number.isFinite(item.at) || item.at < 0) {
        throw new Error(`comentário ${i + 1}: o tempo precisa ser um número de segundos`);
      }
      if (typeof item?.text !== 'string' || !item.text.trim()) {
        throw new Error(`comentário ${i + 1}: o texto está vazio`);
      }

      return {
        at: Math.round(item.at),
        name: String(item.name ?? '').trim().slice(0, 80) || 'Participante',
        text: item.text.trim().slice(0, 500),
        host: item.host === true,
      };
    })
    .sort((a, b) => a.at - b.at);
}

function lerCurva(form: FormData): ViewerPoint[] {
  return lista(form, 'viewers_curve')
    .map((p, i) => {
      const item = p as Partial<ViewerPoint>;

      if (typeof item?.at !== 'number' || !Number.isFinite(item.at) || item.at < 0) {
        throw new Error(`ponto ${i + 1}: o tempo precisa ser um número de segundos`);
      }
      if (typeof item?.n !== 'number' || !Number.isFinite(item.n) || item.n < 0) {
        throw new Error(`ponto ${i + 1}: a quantidade de pessoas precisa ser zero ou mais`);
      }

      return { at: Math.round(item.at), n: Math.round(item.n) };
    })
    .sort((a, b) => a.at - b.at);
}

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
  let curva: ViewerPoint[];

  try {
    agendadas = lerMensagens(form);
  } catch (e) {
    return { erro: 'Comentários programados: ' + (e as Error).message };
  }

  try {
    curva = lerCurva(form);
  } catch (e) {
    return { erro: 'Curva de espectadores: ' + (e as Error).message };
  }

  const atualizacao: Record<string, unknown> = {
    scheduled_messages: agendadas,
    viewers_curve: curva,
  };

  for (const campo of CAMPOS_TEXTO) {
    atualizacao[campo] = String(form.get(campo) ?? '');
  }
  for (const campo of CAMPOS_NUMERO) {
    const n = Number.parseInt(String(form.get(campo) ?? '0'), 10);
    atualizacao[campo] = Number.isFinite(n) && n >= 0 ? n : 0;
  }

  const { error } = await db().from('webinar_config').update(atualizacao).eq('id', 1);

  if (error) {
    // A coluna ausente é o erro esperado de quem ainda não rodou a migração.
    if (/column .* does not exist/i.test(error.message)) {
      return {
        erro:
          'O banco ainda não tem as colunas novas. Rode supabase/migracao-002-copy-e-espectadores.sql ' +
          'no SQL Editor do Supabase e tente de novo. (' + error.message + ')',
      };
    }
    return { erro: 'Erro ao salvar: ' + error.message };
  }

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

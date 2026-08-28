'use server';

import { db } from '@/core/db/server';
import { visitante } from '@/core/identity';
import type { EventType } from '@/core/types';

/** Violação de unicidade no Postgres — o evento já tinha sido contado. */
const DUPLICADO = '23505';

/**
 * Envia mensagem no chat.
 *
 * O nome e a identidade vêm do cookie no servidor, nunca do corpo da
 * requisição: assim ninguém escreve no chat se passando por outra pessoa.
 */
export async function enviarMensagem(sessionAt: number, texto: string): Promise<void> {
  const eu = await visitante();
  const limpo = texto.trim().slice(0, 500);
  if (!limpo || !Number.isFinite(sessionAt)) return;

  await db().from('messages').insert({
    session_at: sessionAt,
    lead_id: eu.leadId,
    name: eu.name,
    text: limpo,
    is_host: false,
  });
}

/**
 * Registra um evento de telemetria.
 *
 * A3 da auditoria: sem identidade emitida pelo servidor não há evento. Antes,
 * cada carregamento de /sala inventava um lead_id novo que não existia na
 * tabela `leads`, e o erro do insert era descartado silenciosamente.
 *
 * A unicidade é garantida pelo índice `events_dedup`, então uma corrida entre
 * abas não conta o mesmo marco duas vezes.
 */
export async function registrarEvento(
  sessionAt: number,
  type: EventType,
  value?: number,
): Promise<void> {
  const eu = await visitante();
  if (!eu.leadId || !Number.isFinite(sessionAt)) return;

  const { error } = await db().from('events').insert({
    lead_id: eu.leadId,
    session_at: sessionAt,
    type,
    value: value ?? null,
  });

  if (error && error.code !== DUPLICADO) {
    // Telemetria não derruba a sala, mas também não some sem deixar rastro.
    console.error('[sala] falha ao registrar evento', { type, value, erro: error.message });
  }
}

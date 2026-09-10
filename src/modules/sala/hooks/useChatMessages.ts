'use client';

import { useCallback, useEffect, useState } from 'react';
import { realtime } from '@/core/db/browser';
import type { MessageRow } from '@/core/types';
import { enviarMensagem } from '../actions';

export function useChatMessages(sessionAt: number, iniciais: MessageRow[]) {
  const [messages, setMessages] = useState<MessageRow[]>(iniciais);

  /**
   * Acrescenta ao fim, ignorando o que já está na lista.
   *
   * A ordem é a de chegada, não a de id: as mensagens programadas do
   * apresentador entram com id negativo e precisam aparecer no instante em que
   * disparam, não no topo.
   */
  const adicionarLocal = useCallback((m: MessageRow) => {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }, []);

  useEffect(() => {
    const canal = realtime
      .channel('chat_' + sessionAt)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'session_at=eq.' + sessionAt,
        },
        (payload) => {
          // A própria mensagem do autor já foi inserida no envio, com o id
          // devolvido pelo servidor. O eco cai na deduplicação por id.
          adicionarLocal(payload.new as MessageRow);
        },
      )
      .on(
        'postgres_changes',
        // M4 da auditoria: só INSERT era assinado. Ao apagar uma mensagem, ela
        // sumia da tela do admin e continuava visível para a sala inteira até
        // alguém dar reload — ou seja, a moderação ao vivo não moderava nada.
        // O payload de DELETE traz apenas a chave primária, então não há filtro
        // por sessão: a remoção por id já é inofensiva para as outras salas.
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const removida = payload.old as { id?: number };
          if (removida?.id == null) return;
          setMessages((prev) => prev.filter((m) => m.id !== removida.id));
        },
      )
      .subscribe();

    return () => {
      realtime.removeChannel(canal);
    };
  }, [sessionAt, adicionarLocal]);

  /**
   * Envia e mostra na hora, com a linha que o servidor gravou.
   *
   * Antes, o autor nunca via a própria mensagem: o handler de realtime
   * descartava o eco por `lead_id` esperando uma inserção otimista que não
   * existia em lugar nenhum.
   */
  const enviar = useCallback(
    async (texto: string) => {
      const gravada = await enviarMensagem(sessionAt, texto);
      if (gravada) adicionarLocal(gravada);
    },
    [sessionAt, adicionarLocal],
  );

  return { messages, adicionarLocal, enviar };
}

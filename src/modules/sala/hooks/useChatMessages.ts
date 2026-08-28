'use client';

import { useCallback, useEffect, useState } from 'react';
import { realtime } from '@/core/db/browser';
import type { MessageRow } from '@/core/types';
import { enviarMensagem } from '../actions';

interface Opcoes {
  /** Identidade de quem está na sala, para reconhecer o eco da própria mensagem. */
  meuLeadId: string | null;
}

export function useChatMessages(
  sessionAt: number,
  iniciais: MessageRow[],
  { meuLeadId }: Opcoes,
) {
  const [messages, setMessages] = useState<MessageRow[]>(iniciais);

  const adicionarLocal = useCallback((m: MessageRow) => {
    setMessages((prev) => [...prev, m]);
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
          const nova = payload.new as MessageRow;

          // M3 da auditoria: o eco era identificado por nome. Como o nome padrão
          // de quem entra sem cadastro é "Visitante", todos os visitantes ficavam
          // mutuamente invisíveis — e homônimos reais também. Agora compara a
          // identidade, que é única.
          if (meuLeadId && nova.lead_id === meuLeadId && !nova.is_host) return;

          setMessages((prev) => (prev.some((m) => m.id === nova.id) ? prev : [...prev, nova]));
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
  }, [sessionAt, meuLeadId]);

  const enviar = useCallback(
    async (texto: string) => {
      await enviarMensagem(sessionAt, texto);
    },
    [sessionAt],
  );

  return { messages, adicionarLocal, enviar };
}

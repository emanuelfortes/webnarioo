'use client';

import { useEffect, useState } from 'react';
import { realtime } from '@/core/db/browser';

/**
 * Contador de espectadores, via Presence do Supabase Realtime.
 *
 * É a única parte da sala que o navegador resolve sozinho — e a razão pela qual
 * o Supabase continua no projeto: função serverless não segura uma conexão
 * aberta pelos 75 minutos de uma sessão.
 */
export function usePresence(sessionAt: number, chave: string, nome: string): number {
  const [viewers, setViewers] = useState(1);

  useEffect(() => {
    const canal = realtime.channel('presence_' + sessionAt, {
      config: { presence: { key: chave } },
    });

    canal.on('presence', { event: 'sync' }, () => {
      setViewers(Object.keys(canal.presenceState()).length);
    });

    canal.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await canal.track({ n: nome });
    });

    return () => {
      realtime.removeChannel(canal);
    };
  }, [sessionAt, chave, nome]);

  return viewers;
}

import { useCallback, useEffect, useState } from 'react';
import { sb } from '../lib/supabase';
import type { MessageRow } from '../lib/types';

interface UseChatMessagesOptions {
  limit?: number;
  /** Retorna true para ignorar uma mensagem recebida via realtime (ex: eco da própria mensagem já exibida localmente). */
  skipEcho?: (incoming: MessageRow) => boolean;
}

export function useChatMessages(sessionAt: number | null, opts?: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const limit = opts?.limit ?? 300;
  const skipEcho = opts?.skipEcho;

  const addMessage = useCallback((m: MessageRow) => setMessages((prev) => [...prev, m]), []);

  useEffect(() => {
    if (!sessionAt) return;
    let active = true;

    sb.from('messages').select('*').eq('session_at', sessionAt).order('id', { ascending: true }).limit(limit)
      .then(({ data }) => { if (active) setMessages(data ?? []); });

    const channel = sb.channel('chat_' + sessionAt)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'session_at=eq.' + sessionAt },
        (payload) => {
          const incoming = payload.new as MessageRow;
          if (skipEcho?.(incoming)) return;
          setMessages((prev) => [...prev, incoming]);
        })
      .subscribe();

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionAt, limit]);

  const sendMessage = useCallback(async (payload: { name: string; text: string; is_host?: boolean }) => {
    await sb.from('messages').insert({ session_at: sessionAt, ...payload });
  }, [sessionAt]);

  const deleteMessage = useCallback(async (id: number) => {
    await sb.from('messages').delete().eq('id', id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { messages, addMessage, sendMessage, deleteMessage };
}

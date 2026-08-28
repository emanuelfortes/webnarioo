'use client';

import { useEffect, useRef, useState } from 'react';
import type { MessageRow } from '@/core/types';

interface ChatPanelProps {
  messages: MessageRow[];
  onSend: (texto: string) => void;
}

export function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [texto, setTexto] = useState('');
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const v = texto.trim();
    if (!v) return;
    setTexto('');
    onSend(v);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listaRef} className="flex-1 overflow-y-auto p-3.5">
        {messages.map((m, i) => (
          <div key={`${m.id}-${i}`} className="mb-3.5">
            <div className="mb-0.5 text-[.8rem] text-[#6b7280]">
              <b className={'mr-1.5 text-[.86rem] ' + (m.is_host ? 'text-[#c2570b]' : 'text-[#111827]')}>
                {m.name}
              </b>
              <span>
                {new Date(m.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div
              className={
                'break-words rounded-lg px-2.5 py-2 text-[.9rem] text-[#111827] ' +
                (m.is_host ? 'border-l-[3px] border-[#c2570b] bg-[#fff7ed]' : 'bg-[#f3f4f6]')
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={enviar} className="flex flex-shrink-0 gap-2 border-t border-[#e5e7eb] p-3">
        <label htmlFor="chat-texto" className="sr-only">
          Sua mensagem
        </label>
        <input
          id="chat-texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva sua mensagem…"
          maxLength={500}
          autoComplete="off"
          className="flex-1 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.92rem]"
        />
        <button type="submit" className="rounded-lg bg-[#111827] px-4 font-bold text-white">
          Enviar
        </button>
      </form>
    </div>
  );
}

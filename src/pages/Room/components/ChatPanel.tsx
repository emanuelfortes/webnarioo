import { useEffect, useRef, useState } from 'react';
import type { MessageRow } from '../../../lib/types';

interface ChatPanelProps {
  messages: MessageRow[];
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setText('');
    onSend(v);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto p-3.5">
        {messages.map((m, i) => (
          <div key={m.id + '-' + i} className="mb-3.5">
            <div className="mb-0.5 text-[.8rem] text-[#6b7280]">
              <b className={'mr-1.5 text-[.86rem] ' + (m.is_host ? 'text-[#c2570b]' : 'text-[#111827]')}>{m.name}</b>
              <span>{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className={'break-words rounded-lg px-2.5 py-2 text-[.9rem] text-[#111827] ' + (m.is_host ? 'border-l-[3px] border-[#c2570b] bg-[#fff7ed]' : 'bg-[#f3f4f6]')}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-shrink-0 gap-2 border-t border-[#e5e7eb] p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva sua mensagem…"
          maxLength={500}
          autoComplete="off"
          className="flex-1 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.92rem]"
        />
        <button type="submit" className="rounded-lg bg-[#111827] px-4.5 font-bold text-white">Enviar</button>
      </form>
    </div>
  );
}

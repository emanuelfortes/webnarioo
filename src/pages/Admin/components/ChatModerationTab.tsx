import { useEffect, useState } from 'react';
import { sb } from '../../../lib/supabase';
import { fmtSession } from '../../../lib/format';
import { useChatMessages } from '../../../hooks/useChatMessages';

export function ChatModerationTab() {
  const [sessions, setSessions] = useState<number[]>([]);
  const [sessionAt, setSessionAt] = useState<number | null>(null);
  const [hostMsg, setHostMsg] = useState('');

  const loadSessions = async () => {
    const { data } = await sb.from('leads').select('session_at').order('session_at', { ascending: false }).limit(1000);
    const unique = [...new Set((data ?? []).map((l) => l.session_at as number))].sort((a, b) => b - a);
    setSessions(unique);
    setSessionAt((current) => (current && unique.includes(current) ? current : unique[0] ?? null));
  };

  useEffect(() => { loadSessions(); }, []);

  const { messages, sendMessage, deleteMessage } = useChatMessages(sessionAt, { limit: 500 });

  const sendHost = async () => {
    const text = hostMsg.trim();
    if (!text || !sessionAt) return;
    setHostMsg('');
    await sendMessage({ name: 'ACEV', text, is_host: true });
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-2.5">Moderação ao vivo</h3>
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={sessionAt ?? ''}
          onChange={(e) => setSessionAt(parseInt(e.target.value, 10))}
          className="rounded-lg border border-[#d1d5db] p-2.5"
        >
          {sessions.map((s) => <option key={s} value={s}>{fmtSession(s)}</option>)}
        </select>
        <button onClick={loadSessions} className="rounded-lg bg-[#111827] px-3 py-1.5 text-[.8rem] font-bold text-white">↻ Atualizar sessões</button>
      </div>

      <div className="my-4 flex gap-2">
        <input
          value={hostMsg}
          onChange={(e) => setHostMsg(e.target.value)}
          placeholder="Responder no chat como apresentador…"
          className="flex-1 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]"
        />
        <button onClick={sendHost} className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-[.8rem] font-bold text-white">Enviar</button>
      </div>

      <table className="w-full border-collapse text-[.88rem]">
        <thead>
          <tr>
            {['Hora', 'Nome', 'Mensagem', ''].map((h) => (
              <th key={h} className="border-b border-[#e5e7eb] px-2 py-2.5 text-left text-[.78rem] uppercase text-[#6b7280]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => (
            <tr key={m.id}>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                {m.name}{m.is_host && <span className="ml-1 rounded bg-[#fff7ed] px-1.5 py-0.5 text-[.7rem] font-extrabold text-[#c2570b]">HOST</span>}
              </td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{m.text}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                {!m.is_host && (
                  <button onClick={() => deleteMessage(m.id)} className="rounded-lg bg-[#dc2626] px-3 py-1.5 text-[.8rem] font-bold text-white">✕</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

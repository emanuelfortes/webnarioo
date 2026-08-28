'use client';

import { useEffect, useState } from 'react';
import { realtime } from '@/core/db/browser';
import { fmtSession } from '@/core/format';
import type { MessageRow } from '@/core/types';
import { apagarMensagem, carregarMensagens, enviarComoApresentador } from '../actions';

/** Mensagens sempre acompanhadas da sessão a que pertencem. */
interface Carga {
  sessao: number;
  itens: MessageRow[];
}

export function ChatModerationTab({ sessoes }: { sessoes: number[] }) {
  const [sessionAt, setSessionAt] = useState<number | null>(sessoes[0] ?? null);
  const [carga, setCarga] = useState<Carga | null>(null);
  const [texto, setTexto] = useState('');

  // Estado de carregamento é derivado: a carga atual ainda não é da sessão
  // escolhida. Guardar os dois juntos evita mostrar o chat de outra sessão
  // durante a troca.
  const carregando = sessionAt !== null && carga?.sessao !== sessionAt;
  const mensagens = carga?.sessao === sessionAt ? carga.itens : [];

  useEffect(() => {
    if (sessionAt === null) return;
    let ativo = true;

    void (async () => {
      const itens = await carregarMensagens(sessionAt);
      if (ativo) setCarga({ sessao: sessionAt, itens });
    })();

    return () => {
      ativo = false;
    };
  }, [sessionAt]);

  // Mesma assinatura da sala: INSERT e DELETE. O admin vê o chat exatamente
  // como o espectador vê, inclusive as remoções feitas de outra aba.
  useEffect(() => {
    if (sessionAt === null) return;

    const canal = realtime
      .channel('mod_' + sessionAt)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'session_at=eq.' + sessionAt },
        (payload) => {
          const nova = payload.new as MessageRow;
          setCarga((prev) =>
            !prev || prev.sessao !== sessionAt || prev.itens.some((m) => m.id === nova.id)
              ? prev
              : { ...prev, itens: [...prev.itens, nova] },
          );
        },
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const removida = payload.old as { id?: number };
        if (removida?.id == null) return;
        setCarga((prev) =>
          prev ? { ...prev, itens: prev.itens.filter((m) => m.id !== removida.id) } : prev,
        );
      })
      .subscribe();

    return () => {
      realtime.removeChannel(canal);
    };
  }, [sessionAt]);

  const enviar = async () => {
    const limpo = texto.trim();
    if (!limpo || sessionAt === null) return;
    setTexto('');
    await enviarComoApresentador(sessionAt, limpo);
  };

  const apagar = async (id: number) => {
    // O realtime devolve o DELETE e remove da lista — aqui e na sala.
    await apagarMensagem(id);
  };

  if (sessoes.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h3 className="mb-1.5">Moderação ao vivo</h3>
        <p className="text-[.9rem] text-[#6b7280]">
          Nenhuma sessão ainda. Assim que houver o primeiro cadastro, ela aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-2.5">Moderação ao vivo</h3>

      <label htmlFor="mod-sessao" className="mb-1 block text-[.82rem] font-semibold text-[#6b7280]">
        Sessão
      </label>
      <select
        id="mod-sessao"
        value={sessionAt ?? ''}
        onChange={(e) => setSessionAt(Number.parseInt(e.target.value, 10))}
        className="rounded-lg border border-[#d1d5db] p-2.5"
      >
        {sessoes.map((s) => (
          <option key={s} value={s}>
            {fmtSession(s)}
          </option>
        ))}
      </select>

      <div className="my-4 flex gap-2">
        <label htmlFor="mod-texto" className="sr-only">
          Mensagem como apresentador
        </label>
        <input
          id="mod-texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void enviar();
          }}
          placeholder="Responder no chat como apresentador…"
          maxLength={500}
          className="flex-1 rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]"
        />
        <button
          onClick={() => void enviar()}
          className="rounded-lg bg-[#16a34a] px-4 py-1.5 text-[.8rem] font-bold text-white"
        >
          Enviar
        </button>
      </div>

      {carregando ? (
        <p className="text-[.88rem] text-[#6b7280]">Carregando mensagens…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[.88rem]">
            <thead>
              <tr>
                {['Hora', 'Nome', 'Mensagem', ''].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[#e5e7eb] px-2 py-2.5 text-left text-[.78rem] uppercase text-[#6b7280]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mensagens.map((m) => (
                <tr key={m.id}>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                    {new Date(m.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                    {m.name}
                    {m.is_host && (
                      <span className="ml-1 rounded bg-[#fff7ed] px-1.5 py-0.5 text-[.7rem] font-extrabold text-[#c2570b]">
                        HOST
                      </span>
                    )}
                  </td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{m.text}</td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                    {!m.is_host && (
                      <button
                        onClick={() => void apagar(m.id)}
                        aria-label={`Apagar mensagem de ${m.name}`}
                        className="rounded-lg bg-[#dc2626] px-3 py-1.5 text-[.8rem] font-bold text-white"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

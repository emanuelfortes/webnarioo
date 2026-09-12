'use client';

import { useState } from 'react';
import type { ScheduledMessage } from '@/core/types';
import { paraMMSS } from '../tempo';
import { CampoTempo } from './CampoTempo';

interface Linha extends ScheduledMessage {
  _k: number;
}

interface MessagesEditorProps {
  inicial: ScheduledMessage[];
  /** Para avisar quando um comentário está marcado depois do fim do vídeo. */
  durationSec: number;
}

const inputClass = 'w-full rounded-lg border border-[#d1d5db] px-2.5 py-2 text-[.9rem]';

/**
 * Editor dos comentários programados.
 *
 * Substitui o textarea de JSON cru que existia aqui: sincronizar fala com vídeo
 * exige mexer nisso dezenas de vezes, e uma vírgula perdida invalidava o
 * arquivo inteiro sem dizer onde.
 */
export function MessagesEditor({ inicial, durationSec }: MessagesEditorProps) {
  // Chave estável por linha, para o React não remontar os inputs a cada edição.
  // Fica em estado, e não em ref: ler `ref.current` durante o render (que é
  // onde o inicializador do useState roda) é proibido pelo compilador.
  const [linhas, setLinhas] = useState<Linha[]>(() =>
    inicial.map((m, i) => ({ ...m, host: m.host === true, _k: i })),
  );
  const [proximaChave, setProximaChave] = useState(inicial.length);

  const alterar = (k: number, mudanca: Partial<ScheduledMessage>) =>
    setLinhas((prev) => prev.map((l) => (l._k === k ? { ...l, ...mudanca } : l)));

  const remover = (k: number) => setLinhas((prev) => prev.filter((l) => l._k !== k));

  const acrescentar = () => {
    setLinhas((prev) => [
      ...prev,
      {
        // Começa 30s depois do último, que é quase sempre o que se quer.
        at: prev.length ? prev[prev.length - 1].at + 30 : 60,
        name: '',
        text: '',
        host: false,
        _k: proximaChave,
      },
    ]);
    setProximaChave((k) => k + 1);
  };

  const ordenar = () => setLinhas((prev) => [...prev].sort((a, b) => a.at - b.at));

  const foraDoVideo = linhas.filter((l) => durationSec > 0 && l.at > durationSec).length;

  return (
    <div>
      {/* O servidor lê daqui. As linhas são ordenadas por tempo ao salvar. */}
      <input
        type="hidden"
        name="scheduled_messages"
        value={JSON.stringify(
          linhas.map(({ at, name, text, host }) => ({ at, name, text, host })),
        )}
      />

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="text-[.82rem] text-[#6b7280]">
          {linhas.length} comentário{linhas.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={ordenar}
          className="rounded-lg bg-[#e5e7eb] px-3 py-1.5 text-[.78rem] font-semibold"
        >
          ↕ Ordenar por tempo
        </button>
      </div>

      {foraDoVideo > 0 && (
        <p role="alert" className="mb-2 text-[.8rem] text-[#b45309]">
          {foraDoVideo} comentário{foraDoVideo === 1 ? ' está marcado' : 's estão marcados'} depois
          do fim do vídeo ({paraMMSS(durationSec)}) — nunca {foraDoVideo === 1 ? 'vai' : 'vão'}{' '}
          aparecer.
        </p>
      )}

      {linhas.length === 0 ? (
        <p className="mb-3 text-[.88rem] text-[#6b7280]">
          Nenhum comentário ainda. O chat vai ter só as mensagens reais dos participantes.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[.88rem]">
            <thead>
              <tr>
                {['Tempo', 'Nome', 'Comentário', 'Apresentador', ''].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[#e5e7eb] px-2 py-2 text-left text-[.72rem] uppercase tracking-wide text-[#6b7280]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l._k}>
                  <td className="border-b border-[#f3f4f6] px-2 py-1.5 align-middle">
                    <CampoTempo
                      segundos={l.at}
                      onChange={(at) => alterar(l._k, { at })}
                      invalido={durationSec > 0 && l.at > durationSec}
                      aria-label="Tempo do comentário em minutos e segundos"
                    />
                  </td>
                  <td className="w-[22%] border-b border-[#f3f4f6] px-2 py-1.5">
                    <input
                      value={l.name}
                      onChange={(e) => alterar(l._k, { name: e.target.value })}
                      placeholder="Dra. Marina L."
                      maxLength={80}
                      aria-label="Nome de quem comenta"
                      className={inputClass}
                    />
                  </td>
                  <td className="border-b border-[#f3f4f6] px-2 py-1.5">
                    <input
                      value={l.text}
                      onChange={(e) => alterar(l._k, { text: e.target.value })}
                      placeholder="Estou acompanhando de Fortaleza!"
                      maxLength={500}
                      aria-label="Texto do comentário"
                      className={inputClass}
                    />
                  </td>
                  <td className="border-b border-[#f3f4f6] px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={l.host === true}
                      onChange={(e) => alterar(l._k, { host: e.target.checked })}
                      aria-label="Marcar como mensagem do apresentador"
                      className="h-4 w-4 accent-[#c2570b]"
                    />
                  </td>
                  <td className="border-b border-[#f3f4f6] px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => remover(l._k)}
                      aria-label={`Remover o comentário de ${l.name || 'sem nome'}`}
                      className="rounded-lg bg-[#fee2e2] px-2.5 py-1.5 text-[.78rem] font-bold text-[#b91c1c]"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={acrescentar}
        className="mt-3 rounded-lg bg-[#111827] px-4 py-2 text-[.85rem] font-bold text-white"
      >
        + Adicionar comentário
      </button>
    </div>
  );
}

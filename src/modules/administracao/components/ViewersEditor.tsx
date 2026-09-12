'use client';

import { useState } from 'react';
import type { ViewerPoint } from '@/core/types';
import { paraMMSS } from '../tempo';
import { CampoTempo } from './CampoTempo';

interface Linha extends ViewerPoint {
  _k: number;
}

interface ViewersEditorProps {
  inicial: ViewerPoint[];
  durationSec: number;
}

/** Desenha a curva para dar noção do formato — sobe, tem pico, cai. */
function Silhueta({ pontos, durationSec }: { pontos: ViewerPoint[]; durationSec: number }) {
  if (pontos.length < 2) return null;

  const ordenados = [...pontos].sort((a, b) => a.at - b.at);
  const maxAt = Math.max(durationSec || 0, ordenados[ordenados.length - 1].at, 1);
  const maxN = Math.max(...ordenados.map((p) => p.n), 1);

  const coords = ordenados
    .map((p) => `${(p.at / maxAt) * 100},${30 - (p.n / maxN) * 28}`)
    .join(' ');

  return (
    <div className="mb-3 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-[70px] w-full" role="img"
        aria-label={`Curva de espectadores, de ${ordenados[0].n} a ${ordenados[ordenados.length - 1].n} pessoas, com pico de ${maxN}`}>
        <polyline points={coords} fill="none" stroke="#2563eb" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[.72rem] tabular-nums text-[#6b7280]">
        <span>0:00</span>
        <span>pico: {maxN}</span>
        <span>{paraMMSS(maxAt)}</span>
      </div>
    </div>
  );
}

/**
 * Editor da curva de espectadores.
 *
 * O valor exibido na sala é esta curva **somada** à presença real — quem entra
 * de verdade continua sendo contado por cima disto.
 */
export function ViewersEditor({ inicial, durationSec }: ViewersEditorProps) {
  // Chave estável por linha. Em estado, e não em ref: ler `ref.current` durante
  // o render — que é onde o inicializador do useState roda — é proibido.
  const [linhas, setLinhas] = useState<Linha[]>(() =>
    inicial.map((p, i) => ({ ...p, _k: i })),
  );
  const [proximaChave, setProximaChave] = useState(inicial.length);

  const alterar = (k: number, mudanca: Partial<ViewerPoint>) =>
    setLinhas((prev) => prev.map((l) => (l._k === k ? { ...l, ...mudanca } : l)));

  const remover = (k: number) => setLinhas((prev) => prev.filter((l) => l._k !== k));

  const acrescentar = () => {
    setLinhas((prev) => [
      ...prev,
      {
        at: prev.length ? prev[prev.length - 1].at + 300 : 0,
        n: prev.length ? prev[prev.length - 1].n : 10,
        _k: proximaChave,
      },
    ]);
    setProximaChave((k) => k + 1);
  };

  const ordenar = () => setLinhas((prev) => [...prev].sort((a, b) => a.at - b.at));

  /** Preenche uma curva típica de webinar, para não começar do zero. */
  const sugerir = () => {
    const d = durationSec > 0 ? durationSec : 4500;
    const modelo: ViewerPoint[] = [
      { at: 0, n: 14 },
      { at: Math.round(d * 0.03), n: 68 },
      { at: Math.round(d * 0.15), n: 142 },
      { at: Math.round(d * 0.5), n: 118 },
      { at: Math.round(d * 0.8), n: 96 },
      { at: d, n: 74 },
    ];
    setLinhas(modelo.map((p, i) => ({ ...p, _k: proximaChave + i })));
    setProximaChave((k) => k + modelo.length);
  };

  return (
    <div>
      <input
        type="hidden"
        name="viewers_curve"
        value={JSON.stringify(linhas.map(({ at, n }) => ({ at, n })))}
      />

      <Silhueta pontos={linhas} durationSec={durationSec} />

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="text-[.82rem] text-[#6b7280]">
          {linhas.length} ponto{linhas.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={ordenar}
          className="rounded-lg bg-[#e5e7eb] px-3 py-1.5 text-[.78rem] font-semibold"
        >
          ↕ Ordenar por tempo
        </button>
        <button
          type="button"
          onClick={sugerir}
          className="rounded-lg bg-[#e5e7eb] px-3 py-1.5 text-[.78rem] font-semibold"
        >
          ✨ Preencher curva típica
        </button>
      </div>

      {linhas.length === 0 ? (
        <p className="mb-3 text-[.88rem] text-[#6b7280]">
          Sem pontos: a sala mostra apenas a quantidade real de pessoas conectadas.
        </p>
      ) : (
        <table className="w-full max-w-[420px] border-collapse text-[.88rem]">
          <thead>
            <tr>
              {['Tempo', 'Pessoas', ''].map((h) => (
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
                <td className="border-b border-[#f3f4f6] px-2 py-1.5">
                  <CampoTempo
                    segundos={l.at}
                    onChange={(at) => alterar(l._k, { at })}
                    aria-label="Momento da sessão em minutos e segundos"
                  />
                </td>
                <td className="border-b border-[#f3f4f6] px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    value={l.n}
                    onChange={(e) => alterar(l._k, { n: Math.max(0, Number(e.target.value) || 0) })}
                    aria-label="Quantidade de pessoas"
                    className="w-[92px] rounded-lg border border-[#d1d5db] px-2 py-2 text-[.9rem] tabular-nums"
                  />
                </td>
                <td className="border-b border-[#f3f4f6] px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => remover(l._k)}
                    aria-label={`Remover o ponto de ${paraMMSS(l.at)}`}
                    className="rounded-lg bg-[#fee2e2] px-2.5 py-1.5 text-[.78rem] font-bold text-[#b91c1c]"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        type="button"
        onClick={acrescentar}
        className="mt-3 rounded-lg bg-[#111827] px-4 py-2 text-[.85rem] font-bold text-white"
      >
        + Adicionar ponto
      </button>
    </div>
  );
}

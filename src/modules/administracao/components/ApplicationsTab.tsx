'use client';

import { downloadCsv } from '@/core/csv';
import { fmtSession } from '@/core/format';
import type { Application } from '@/core/types';
import type { Pagina } from '../queries';

const COLUNAS_CSV: (keyof Application)[] = [
  'created_at',
  'name',
  'area',
  'cidade',
  'tempo',
  'faturamento',
  'investimento',
  'dificuldade',
  'pronto',
  'whatsapp',
];

const COLUNAS = ['Data', 'Nome', 'Área', 'Cidade', 'Faturamento', 'Pronto p/ investir', 'WhatsApp', 'Sessão'];

export function ApplicationsTab({ pagina }: { pagina: Pagina<Application> }) {
  const { itens, total, limite } = pagina;

  const exportar = () =>
    downloadCsv('aplicacoes_webinar.csv', [
      [...COLUNAS_CSV, 'sessao'],
      ...itens.map((a) => [...COLUNAS_CSV.map((c) => a[c] ?? ''), fmtSession(a.session_at)]),
    ]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3>Aplicações ({total})</h3>
          {total > limite && (
            <p className="mt-0.5 text-[.78rem] text-[#b45309]">
              Mostrando as {limite} mais recentes. O CSV exporta apenas estas.
            </p>
          )}
        </div>
        <button
          onClick={exportar}
          className="rounded-lg bg-[#111827] px-3 py-1.5 text-[.8rem] font-bold text-white"
        >
          ⬇ Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[.88rem]">
          <thead>
            <tr>
              {COLUNAS.map((h) => (
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
            {itens.map((a) => (
              <tr key={a.id}>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                  {new Date(a.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.name ?? ''}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.area ?? ''}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.cidade ?? ''}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.faturamento ?? ''}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.pronto ?? ''}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.whatsapp ?? ''}</td>
                {/* B7 da auditoria: agora dá para saber de qual sessão veio. */}
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                  {fmtSession(a.session_at) || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

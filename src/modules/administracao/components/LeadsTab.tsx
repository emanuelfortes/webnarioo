'use client';

import { fmtSession } from '@/core/format';
import { downloadCsv } from '@/core/csv';
import type { Lead } from '@/core/types';
import type { Pagina } from '../queries';

const COLUNAS = ['Data', 'Nome', 'E-mail', 'WhatsApp', 'Sessão', 'Consentiu'];

export function LeadsTab({ pagina }: { pagina: Pagina<Lead> }) {
  const { itens, total, limite } = pagina;

  const exportar = () =>
    downloadCsv('leads_webinar.csv', [
      ['data', 'nome', 'email', 'whatsapp', 'sessao', 'consentimento'],
      ...itens.map((l) => [
        l.created_at,
        l.name,
        l.email,
        l.whatsapp ?? '',
        fmtSession(l.session_at),
        l.consent_at ?? '',
      ]),
    ]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3>Leads ({total})</h3>
          {total > limite && (
            <p className="mt-0.5 text-[.78rem] text-[#b45309]">
              Mostrando os {limite} mais recentes. O CSV exporta apenas estes.
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
            {itens.map((l) => (
              <tr key={l.id}>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                  {new Date(l.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{l.name}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{l.email}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{l.whatsapp ?? ''}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{fmtSession(l.session_at)}</td>
                <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">
                  {l.consent_at ? '✓' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { sb } from '../../../lib/supabase';
import { downloadCsv } from '../../../lib/csv';
import type { Application } from '../../../lib/types';

const CSV_COLS: (keyof Application)[] = ['created_at', 'name', 'area', 'cidade', 'tempo', 'faturamento', 'investimento', 'dificuldade', 'pronto', 'whatsapp'];

export function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    sb.from('applications').select('*').order('created_at', { ascending: false }).limit(2000).then(({ data }) => {
      setApps(data ?? []);
    });
  }, []);

  const exportCsv = () => {
    downloadCsv('aplicacoes_webinar.csv', [
      CSV_COLS,
      ...apps.map((a) => CSV_COLS.map((c) => a[c] ?? '')),
    ]);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h3>Aplicações ({apps.length})</h3>
        <button onClick={exportCsv} className="rounded-lg bg-[#111827] px-3 py-1.5 text-[.8rem] font-bold text-white">⬇ Exportar CSV</button>
      </div>
      <table className="w-full border-collapse text-[.88rem]">
        <thead>
          <tr>
            {['Data', 'Nome', 'Área', 'Cidade', 'Faturamento', 'Pronto p/ investir', 'WhatsApp'].map((h) => (
              <th key={h} className="border-b border-[#e5e7eb] px-2 py-2.5 text-left text-[.78rem] uppercase text-[#6b7280]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.id}>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{new Date(a.created_at).toLocaleString('pt-BR')}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.name ?? ''}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.area ?? ''}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.cidade ?? ''}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.faturamento ?? ''}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.pronto ?? ''}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{a.whatsapp ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

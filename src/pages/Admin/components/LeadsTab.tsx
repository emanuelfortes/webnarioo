import { useEffect, useState } from 'react';
import { sb } from '../../../lib/supabase';
import { fmtSession } from '../../../lib/format';
import { downloadCsv } from '../../../lib/csv';
import type { Lead } from '../../../lib/types';

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    sb.from('leads').select('*').order('created_at', { ascending: false }).limit(2000).then(({ data }) => {
      setLeads(data ?? []);
    });
  }, []);

  const exportCsv = () => {
    downloadCsv('leads_webinar.csv', [
      ['data', 'nome', 'email', 'whatsapp', 'sessao'],
      ...leads.map((l) => [l.created_at, l.name, l.email, l.whatsapp ?? '', fmtSession(l.session_at)]),
    ]);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h3>Leads ({leads.length})</h3>
        <button onClick={exportCsv} className="rounded-lg bg-[#111827] px-3 py-1.5 text-[.8rem] font-bold text-white">⬇ Exportar CSV</button>
      </div>
      <table className="w-full border-collapse text-[.88rem]">
        <thead>
          <tr>
            {['Data', 'Nome', 'E-mail', 'WhatsApp', 'Sessão'].map((h) => (
              <th key={h} className="border-b border-[#e5e7eb] px-2 py-2.5 text-left text-[.78rem] uppercase text-[#6b7280]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{l.name}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{l.email}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{l.whatsapp ?? ''}</td>
              <td className="border-b border-[#e5e7eb] px-2 py-2.5 align-top">{fmtSession(l.session_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

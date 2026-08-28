import { fmtSession, pct } from '@/core/format';
import type { SessionSummary } from '@/core/types';

const COLUNAS = ['Sessão', 'Entraram', 'Chegaram na oferta', 'Clicaram', 'Retenção até a oferta'];

export function SessionsTable({ sessions }: { sessions: SessionSummary[] }) {
  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Últimas sessões</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[.86rem]">
          <thead>
            <tr>
              {COLUNAS.map((h) => (
                <th
                  key={h}
                  className="border-b border-[#e5e7eb] px-2 py-2.5 text-left text-[.75rem] uppercase text-[#6b7280]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="border-b border-[#e5e7eb] px-2 py-2.5 text-[#9ca3af]">
                  Sem sessões ainda
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.s}>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5">{fmtSession(s.s)}</td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5">{s.entered}</td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5">{s.reached_offer}</td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5">{s.clicked}</td>
                  <td className="border-b border-[#e5e7eb] px-2 py-2.5">
                    {pct(s.reached_offer, s.entered)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

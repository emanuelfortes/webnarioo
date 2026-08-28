import type { DashboardStats, KeyCount } from '@/core/types';
import { StatBar } from './StatBar';

export function AppDistributions({ stats }: { stats: DashboardStats }) {
  const distribuicoes: [string, KeyCount[]][] = [
    ['Área de atuação', stats.apps_area],
    ['Faturamento', stats.apps_faturamento],
    ['Investe em marketing', stats.apps_investimento],
    ['Pronto para investir', stats.apps_pronto],
  ];

  const total = stats.apps_total || 1;

  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Respostas da aplicação</h3>
      {distribuicoes.map(([titulo, itens]) => (
        <div key={titulo}>
          <p className="mb-1.5 mt-3 text-[.8rem] uppercase text-[#6b7280]">{titulo}</p>
          {itens.length ? (
            itens.map((x) => (
              <StatBar
                key={x.k}
                label={x.k}
                value={x.n}
                max={total}
                color="#d1fae5"
                boldLabel={false}
                showPct={false}
              />
            ))
          ) : (
            <p className="text-[.85rem] text-[#9ca3af]">Sem aplicações ainda</p>
          )}
        </div>
      ))}
    </div>
  );
}

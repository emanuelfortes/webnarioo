import { StatBar } from '../../../components/StatBar';
import type { DashboardStats, KeyCount } from '../../../lib/types';

interface AppDistributionsProps {
  stats: DashboardStats;
}

export function AppDistributions({ stats }: AppDistributionsProps) {
  const dists: [string, KeyCount[]][] = [
    ['Área de atuação', stats.apps_area],
    ['Faturamento', stats.apps_faturamento],
    ['Investe em marketing', stats.apps_investimento],
    ['Pronto para investir', stats.apps_pronto],
  ];
  const total = stats.apps_total || 1;

  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Respostas da aplicação</h3>
      {dists.map(([title, arr]) => (
        <div key={title}>
          <p className="mb-1.5 mt-3 text-[.8rem] uppercase text-[#6b7280]">{title}</p>
          {arr.length ? (
            arr.map((x) => (
              <StatBar key={x.k} label={x.k} value={x.n} max={total} color="#d1fae5" boldLabel={false} showPct={false} />
            ))
          ) : (
            <p className="text-[.85rem] text-[#9ca3af]">Sem aplicações ainda</p>
          )}
        </div>
      ))}
    </div>
  );
}

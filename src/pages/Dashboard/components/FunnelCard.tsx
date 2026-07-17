import { StatBar } from '../../../components/StatBar';
import type { DashboardStats } from '../../../lib/types';

interface FunnelCardProps {
  stats: DashboardStats;
}

export function FunnelCard({ stats }: FunnelCardProps) {
  const reached = stats.offer_views || 0;
  const watchAt = (sec: number) => stats.watch.find((w) => w.sec === sec)?.n ?? 0;

  const rows: [string, number][] = [
    ['Cadastrados', stats.leads_total],
    ['Entraram na sala', stats.room_viewers],
    ['Assistiram 5 min', watchAt(300)],
    ['Assistiram 10 min', watchAt(600)],
    ['Chegaram na oferta', reached],
    ['Clicaram na oferta', stats.offer_clicks],
    ['Preencheram a aplicação', stats.apps_total],
  ];
  const max = rows[0][1] || 1;

  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Funil completo</h3>
      {rows.map(([label, value]) => (
        <StatBar key={label} label={label} value={value} max={max} />
      ))}
    </div>
  );
}

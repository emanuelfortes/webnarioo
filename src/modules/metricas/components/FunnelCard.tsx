import type { DashboardStats } from '@/core/types';
import { StatBar } from './StatBar';

export function FunnelCard({ stats }: { stats: DashboardStats }) {
  const assistiramAte = (sec: number) => stats.watch.find((w) => w.sec === sec)?.n ?? 0;

  const linhas: [string, number][] = [
    ['Cadastrados', stats.leads_total],
    ['Entraram na sala', stats.room_viewers],
    ['Assistiram 5 min', assistiramAte(300)],
    ['Assistiram 10 min', assistiramAte(600)],
    ['Chegaram na oferta', stats.offer_views],
    ['Clicaram na oferta', stats.offer_clicks],
    ['Preencheram a aplicação', stats.apps_total],
  ];

  const max = linhas[0][1] || 1;

  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Funil completo</h3>
      {linhas.map(([label, valor]) => (
        <StatBar key={label} label={label} value={valor} max={max} />
      ))}
    </div>
  );
}

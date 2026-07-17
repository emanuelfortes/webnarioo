import '../../../lib/chartSetup';
import { Line } from 'react-chartjs-2';
import type { LeadsByDay } from '../../../lib/types';

interface LeadsChartProps {
  leadsByDay: LeadsByDay[];
}

export function LeadsChart({ leadsByDay }: LeadsChartProps) {
  const data = {
    labels: leadsByDay.map((x) => x.d.slice(5)),
    datasets: [{ label: 'Leads', data: leadsByDay.map((x) => x.n), borderColor: '#16a34a', backgroundColor: '#16a34a', tension: 0.3 }],
  };

  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Leads por dia (14 dias)</h3>
      <div className="max-h-[260px]">
        <Line data={data} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
      </div>
    </div>
  );
}

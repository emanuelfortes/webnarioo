'use client';

import './chartSetup';
import { Bar } from 'react-chartjs-2';
import type { WatchPoint } from '@/core/types';

const ROTULOS: Record<number, string> = {
  60: '1 min',
  300: '5 min',
  600: '10 min',
  900: '15 min',
  1200: '20 min',
  1800: '30 min',
  2700: '45 min',
};

interface RetentionChartProps {
  roomViewers: number;
  watch: WatchPoint[];
}

export function RetentionChart({ roomViewers, watch }: RetentionChartProps) {
  const pontos = [...watch].sort((a, b) => a.sec - b.sec);

  const data = {
    labels: ['Entraram', ...pontos.map((x) => ROTULOS[x.sec] || Math.round(x.sec / 60) + ' min')],
    datasets: [
      {
        label: 'Espectadores',
        data: [roomViewers, ...pontos.map((x) => x.n)],
        backgroundColor: '#2563eb',
      },
    ],
  };

  return (
    <div className="rounded-xl bg-white p-[22px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <h3 className="mb-3.5 text-[1.02rem]">Retenção por minutagem (quantos ainda assistiam)</h3>
      <div className="max-h-[260px]">
        <Bar
          data={data}
          options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          }}
        />
      </div>
    </div>
  );
}

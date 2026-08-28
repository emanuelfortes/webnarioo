import type { Metadata } from 'next';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { ehAdmin } from '@/core/auth/session';
import { LoginForm } from '@/core/auth/LoginForm';
import { pct } from '@/core/format';
import { dashboardStats } from '@/modules/metricas/queries';
import { MetricCard } from '@/modules/metricas/components/MetricCard';
import { FunnelCard } from '@/modules/metricas/components/FunnelCard';
import { RetentionChart } from '@/modules/metricas/components/RetentionChart';
import { LeadsChart } from '@/modules/metricas/components/LeadsChart';
import { AppDistributions } from '@/modules/metricas/components/AppDistributions';
import { SessionsTable } from '@/modules/metricas/components/SessionsTable';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const autorizado = await ehAdmin();

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
      <div className="flex items-center justify-between bg-[#111827] px-[22px] py-3.5 text-white">
        <b className="text-[1.05rem]">📊 Dashboard do Webinar · ACEV</b>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[.85rem] text-[#93c5fd] no-underline">
            ⚙️ Admin
          </Link>
          {autorizado && (
            <form
              action={async () => {
                'use server';
                revalidatePath('/dashboard');
              }}
            >
              <button className="rounded-lg bg-[#374151] px-3.5 py-2 text-white">↻ Atualizar</button>
            </form>
          )}
        </div>
      </div>

      {autorizado ? <Metricas /> : <LoginForm />}
    </div>
  );
}

async function Metricas() {
  let stats;
  try {
    stats = await dashboardStats();
  } catch (e) {
    return (
      <p className="container mx-auto max-w-[1150px] whitespace-pre-wrap px-4 py-6 text-[#dc2626]">
        {(e as Error).message}
      </p>
    );
  }

  return (
    <div className="container mx-auto max-w-[1150px] px-4 py-6">
      <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
        <MetricCard label="Leads cadastrados" value={stats.leads_total} />
        <MetricCard
          label="Entraram na sala"
          value={stats.room_viewers}
          sub={`${pct(stats.room_viewers, stats.leads_total)} dos leads`}
        />
        <MetricCard
          label="Chegaram na oferta"
          value={stats.offer_views}
          sub={`${pct(stats.offer_views, stats.room_viewers)} de quem entrou`}
        />
        <MetricCard
          label="Clicaram no botão"
          value={stats.offer_clicks}
          sub={`${pct(stats.offer_clicks, stats.offer_views)} de quem viu a oferta`}
        />
        <MetricCard
          label="Aplicações"
          value={stats.apps_total}
          sub={`${pct(stats.apps_total, stats.offer_clicks)} de quem clicou`}
        />
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-[18px] max-[820px]:grid-cols-1">
        <FunnelCard stats={stats} />
        <RetentionChart roomViewers={stats.room_viewers} watch={stats.watch} />
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-[18px] max-[820px]:grid-cols-1">
        <LeadsChart leadsByDay={stats.leads_by_day} />
        <AppDistributions stats={stats} />
      </div>

      <SessionsTable sessions={stats.sessions} />
    </div>
  );
}

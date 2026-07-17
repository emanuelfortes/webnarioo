import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from '../../components/auth/LoginForm';
import { pct } from '../../lib/format';
import type { DashboardStats } from '../../lib/types';
import { MetricCard } from './components/MetricCard';
import { FunnelCard } from './components/FunnelCard';
import { RetentionChart } from './components/RetentionChart';
import { LeadsChart } from './components/LeadsChart';
import { AppDistributions } from './components/AppDistributions';
import { SessionsTable } from './components/SessionsTable';

export function DashboardPage() {
  const { isAuthenticated, checking, error, login } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => { document.title = 'Dashboard | Webinar ACEV'; }, []);

  const load = async () => {
    const { data, error: rpcError } = await sb.rpc('dashboard_stats');
    if (rpcError) {
      setLoadError('Erro ao carregar métricas: ' + rpcError.message + '\nRodou a versão nova do setup.sql?');
      return;
    }
    setLoadError('');
    setStats(data as DashboardStats);
  };

  useEffect(() => {
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
      <div className="flex items-center justify-between bg-[#111827] px-[22px] py-3.5 text-white">
        <b className="text-[1.05rem]">📊 Dashboard do Webinar · ACEV</b>
        <div>
          <Link to="/admin" className="mr-4 text-[.85rem] text-[#93c5fd] no-underline">⚙️ Admin</Link>
          {isAuthenticated && (
            <button onClick={load} className="rounded-lg bg-[#374151] px-3.5 py-2 text-white">↻ Atualizar</button>
          )}
        </div>
      </div>

      {checking ? null : !isAuthenticated ? (
        <LoginForm onLogin={login} error={error} />
      ) : (
        <div className="container mx-auto max-w-[1150px] px-4 py-6">
          {loadError && <p className="mb-4 whitespace-pre-wrap text-[#dc2626]">{loadError}</p>}
          {stats && (
            <>
              <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
                <MetricCard label="Leads cadastrados" value={stats.leads_total} />
                <MetricCard label="Entraram na sala" value={stats.room_viewers} sub={`${pct(stats.room_viewers, stats.leads_total)} dos leads`} />
                <MetricCard label="Chegaram na oferta" value={stats.offer_views} sub={`${pct(stats.offer_views, stats.room_viewers)} de quem entrou`} />
                <MetricCard label="Clicaram no botão" value={stats.offer_clicks} sub={`${pct(stats.offer_clicks, stats.offer_views)} de quem viu a oferta`} />
                <MetricCard label="Aplicações" value={stats.apps_total} sub={`${pct(stats.apps_total, stats.offer_clicks)} de quem clicou`} />
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

import 'server-only';
import { db } from '@/core/db/server';
import { exigirAdmin } from '@/core/auth/session';
import type { DashboardStats } from '@/core/types';

/**
 * Métricas agregadas do funil.
 *
 * A função `dashboard_stats` teve o EXECUTE revogado de anon e authenticated no
 * schema — só a service_role chama, e só depois de `exigirAdmin`.
 */
export async function dashboardStats(): Promise<DashboardStats> {
  await exigirAdmin();

  const { data, error } = await db().rpc('dashboard_stats');

  if (error) {
    throw new Error(
      `Erro ao carregar métricas: ${error.message}. Confira se supabase/schema.sql foi aplicado.`,
    );
  }

  return data as DashboardStats;
}

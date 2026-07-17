export const pct = (a: number, b: number): string => (b ? Math.round((a / b) * 100) + '%' : '0%');

export const fmtSession = (ms: number | string | null | undefined): string =>
  ms ? new Date(parseInt(String(ms), 10)).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }) : '';

const LEGACY_ROUTES: Record<string, string> = {
  'index.html': '/',
  'sala.html': '/sala',
  'aplicacao.html': '/aplicacao',
  'dashboard.html': '/dashboard',
  'admin.html': '/admin',
};

/** Normaliza links legados salvos no Supabase (ex: "aplicacao.html") para as novas rotas SPA. */
export const toRoute = (url: string): string => LEGACY_ROUTES[url] ?? url;

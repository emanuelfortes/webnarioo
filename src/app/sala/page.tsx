import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getConfig } from '@/core/config';
import { visitante } from '@/core/identity';
import { mensagensDaSessao } from '@/modules/sala/queries';
import { RoomClient } from '@/modules/sala/components/RoomClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getConfig();
  // A sala não deve ser indexada: é conteúdo de sessão, não página pública.
  return { title: cfg.title, robots: { index: false, follow: false } };
}

export default async function SalaPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const sessionAt = Number.parseInt(s ?? '', 10);

  // B5 da auditoria: `?s=` entrava sem validação nenhuma.
  if (!Number.isFinite(sessionAt) || sessionAt <= 0) redirect('/');

  const [cfg, eu, mensagensIniciais] = await Promise.all([
    getConfig(),
    visitante(),
    mensagensDaSessao(sessionAt),
  ]);

  return <RoomClient sessionAt={sessionAt} cfg={cfg} eu={eu} mensagensIniciais={mensagensIniciais} />;
}

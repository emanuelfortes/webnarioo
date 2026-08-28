import type { Metadata } from 'next';
import Link from 'next/link';
import { ehAdmin } from '@/core/auth/session';
import { sair } from '@/core/auth/actions';
import { LoginForm } from '@/core/auth/LoginForm';
import { getConfig } from '@/core/config';
import { listarAplicacoes, listarLeads, listarSessoes } from '@/modules/administracao/queries';
import { AdminShell } from '@/modules/administracao/components/AdminShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const autorizado = await ehAdmin();

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
      <div className="flex items-center justify-between bg-[#111827] px-[22px] py-3.5 text-white">
        <b className="text-[1.05rem]">⚙️ Painel do Webinar · ACEV</b>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[.85rem] text-[#93c5fd] no-underline">
            📊 Dashboard
          </Link>
          {autorizado && (
            <form action={sair}>
              <button className="rounded-lg bg-[#374151] px-3.5 py-2 text-white">Sair</button>
            </form>
          )}
        </div>
      </div>

      {autorizado ? (
        <Painel />
      ) : (
        <LoginForm hint="Use o e-mail e a senha definidos em ADMIN_EMAIL e ADMIN_PASSWORD_HASH." />
      )}
    </div>
  );
}

async function Painel() {
  const [cfg, leads, aplicacoes, sessoes] = await Promise.all([
    getConfig(),
    listarLeads(),
    listarAplicacoes(),
    listarSessoes(),
  ]);

  return <AdminShell cfg={cfg} leads={leads} aplicacoes={aplicacoes} sessoes={sessoes} />;
}

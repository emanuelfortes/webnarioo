import type { Metadata } from 'next';
import { getConfig } from '@/core/config';
import { AuthorCard } from '@/modules/captacao/components/AuthorCard';
import { RegisterForm } from '@/modules/captacao/components/RegisterForm';

/**
 * M9 da auditoria: esta página era `lazy` com `Suspense fallback={null}` e
 * pintava branco até o chunk chegar — numa landing que recebe tráfego pago.
 * Agora é Server Component: o HTML chega pronto na primeira resposta.
 *
 * Todo o texto visível vem da configuração, não do código: quem escreve a copy
 * não deveria precisar de deploy para trocar uma headline.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getConfig();
  return {
    title: cfg.title,
    description: cfg.landing_subtitle,
    openGraph: { title: cfg.title, description: cfg.landing_subtitle },
  };
}

export default async function LandingPage() {
  const cfg = await getConfig();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a] p-6 text-[#f9fafb]">
      <div className="w-full max-w-[560px]">
        <div className="rounded-2xl bg-[#111827] p-10 px-8 shadow-[0_20px_60px_rgba(0,0,0,.5)]">
          <h1 className="mb-3 text-center text-[1.9rem] leading-[1.25]">{cfg.title}</h1>

          {cfg.landing_subtitle && (
            <p className="mb-7 whitespace-pre-line text-center text-[1.02rem] text-[#9ca3af]">
              {cfg.landing_subtitle}
            </p>
          )}

          <AuthorCard name={cfg.author_name} bio={cfg.author_bio} />
          <RegisterForm ctaLabel={cfg.register_cta_label} consentText={cfg.consent_text} />
        </div>

        <footer className="mt-5 text-center text-[.75rem] text-[#4b5563]">
          © {new Date().getFullYear()} {cfg.footer_text}
        </footer>
      </div>
    </div>
  );
}

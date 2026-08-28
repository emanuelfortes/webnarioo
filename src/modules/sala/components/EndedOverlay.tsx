'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isInternal, toRoute } from '@/core/format';

interface EndedOverlayProps {
  ctaLabel: string;
  ctaUrl: string;
  /** A2 da auditoria: registra o clique antes de sair da página. */
  onCtaClick: () => Promise<void>;
}

export function EndedOverlay({ ctaLabel, ctaUrl, onCtaClick }: EndedOverlayProps) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  const irParaOferta = async () => {
    setSaindo(true);
    // Aguarda o registro: navegar antes aborta a requisição da Server Action.
    await onCtaClick();

    const destino = toRoute(ctaUrl);
    if (isInternal(ctaUrl)) router.push(destino);
    else window.location.href = destino;
  };

  return (
    <>
      <div className="mb-2.5 text-[1.6rem] font-extrabold">Esta sessão já foi encerrada.</div>
      <p className="mb-[18px] text-[#d1d5db]">Mas você ainda pode dar o próximo passo:</p>
      <button
        onClick={irParaOferta}
        disabled={saindo}
        className="rounded-[10px] border-0 bg-[#dc2626] px-7 py-3.5 text-[1.05rem] font-bold text-white disabled:opacity-70"
      >
        {saindo ? 'Abrindo…' : ctaLabel || 'QUERO IMPLEMENTAR'}
      </button>
      <p className="mt-4">
        <Link href="/" className="text-[#93c5fd]">
          ou registre-se na próxima sessão
        </Link>
      </p>
    </>
  );
}

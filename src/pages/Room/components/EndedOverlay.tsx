import { Link, useNavigate } from 'react-router-dom';
import { toRoute } from '../../../lib/format';

interface EndedOverlayProps {
  ctaLabel: string;
  ctaUrl: string;
}

export function EndedOverlay({ ctaLabel, ctaUrl }: EndedOverlayProps) {
  const navigate = useNavigate();

  const goToCta = () => {
    const route = toRoute(ctaUrl);
    if (route.startsWith('/')) navigate(route);
    else window.location.href = ctaUrl;
  };

  return (
    <>
      <div className="mb-2.5 text-[1.6rem] font-extrabold">Esta sessão já foi encerrada.</div>
      <p className="mb-[18px] text-[#d1d5db]">Mas você ainda pode dar o próximo passo:</p>
      <button
        onClick={goToCta}
        className="rounded-[10px] border-0 bg-[#dc2626] px-7 py-3.5 text-[1.05rem] font-bold text-white"
      >
        {ctaLabel || 'QUERO IMPLEMENTAR'}
      </button>
      <p className="mt-4">
        <Link to="/" className="text-[#93c5fd]">ou registre-se na próxima sessão</Link>
      </p>
    </>
  );
}

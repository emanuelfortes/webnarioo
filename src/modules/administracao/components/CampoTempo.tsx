'use client';

import { useState } from 'react';
import { deMMSS, paraMMSS } from '../tempo';

interface CampoTempoProps {
  segundos: number;
  onChange: (segundos: number) => void;
  'aria-label': string;
  invalido?: boolean;
}

/**
 * Campo de tempo em `mm:ss`.
 *
 * O texto exibido é derivado, não sincronizado: enquanto há um rascunho ele
 * vence; sem rascunho, vale o valor formatado que vem de fora. Sem isso,
 * normalizar a cada tecla impediria de digitar "1" antes de "12:30" — o valor
 * seria reescrito como "0:01" no meio da digitação.
 */
export function CampoTempo({
  segundos,
  onChange,
  invalido,
  'aria-label': ariaLabel,
}: CampoTempoProps) {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const texto = rascunho ?? paraMMSS(segundos);

  const digitar = (v: string) => {
    setRascunho(v);
    const n = deMMSS(v);
    if (n !== null) onChange(n);
  };

  return (
    <input
      value={texto}
      aria-label={ariaLabel}
      inputMode="numeric"
      placeholder="12:30"
      onChange={(e) => digitar(e.target.value)}
      // Ao sair, o rascunho é descartado e o campo volta a mostrar o valor
      // canônico — que corrige de uma vez "90" para "1:30".
      onBlur={() => setRascunho(null)}
      className={
        'w-[76px] rounded-lg border px-2 py-2 text-center text-[.9rem] tabular-nums ' +
        (invalido ? 'border-[#dc2626] bg-[#fef2f2]' : 'border-[#d1d5db]')
      }
    />
  );
}

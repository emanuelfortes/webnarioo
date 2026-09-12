'use client';

import { useEffect, useState } from 'react';
import type { ViewerPoint } from '@/core/types';
import { espectadoresFake } from '../viewers';

/** De quanto em quanto tempo o contador é recalculado. */
const INTERVALO_MS = 5000;

/**
 * Acompanha a curva de espectadores configurada em /admin.
 *
 * O número que a sala exibe é este **somado** à presença real do Supabase, e
 * não no lugar dela: quem entra de verdade continua sendo contado.
 */
export function useFakeViewers(
  curva: ViewerPoint[],
  sessionAt: number,
  elapsedSec: () => number,
): number {
  const [n, setN] = useState(() => espectadoresFake(curva, elapsedSec(), sessionAt));

  useEffect(() => {
    const recalcular = () => setN(espectadoresFake(curva, elapsedSec(), sessionAt));

    recalcular();
    const iv = setInterval(recalcular, INTERVALO_MS);

    return () => clearInterval(iv);
  }, [curva, sessionAt, elapsedSec]);

  return n;
}

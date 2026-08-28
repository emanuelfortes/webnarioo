'use client';

import { useCallback, useEffect, useState } from 'react';

export type SessionPhase = 'waiting' | 'live' | 'ended';

/**
 * O relógio é a fonte da verdade da sala: define a fase e a posição do vídeo.
 * Não guarda estado derivado do vídeo — só do horário da sessão.
 */
export function useSessionClock(sessionAt: number, durationSec: number) {
  const [phase, setPhase] = useState<SessionPhase>(() => {
    const decorrido = (Date.now() - sessionAt) / 1000;
    if (decorrido < 0) return 'waiting';
    return decorrido >= durationSec ? 'ended' : 'live';
  });

  const elapsedSec = useCallback(() => (Date.now() - sessionAt) / 1000, [sessionAt]);

  useEffect(() => {
    const iv = setInterval(() => {
      const decorrido = elapsedSec();
      if (decorrido < 0) setPhase('waiting');
      else if (decorrido >= durationSec) setPhase('ended');
      else setPhase((p) => (p === 'ended' ? p : 'live'));
    }, 500);

    return () => clearInterval(iv);
  }, [elapsedSec, durationSec]);

  return { phase, elapsedSec };
}

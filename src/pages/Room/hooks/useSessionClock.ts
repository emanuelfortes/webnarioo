import { useCallback, useEffect, useState } from 'react';

export type SessionPhase = 'waiting' | 'live' | 'ended';

export function useSessionClock(sessionAt: number, durationSec: number | undefined) {
  const [phase, setPhase] = useState<SessionPhase>(() => (Date.now() < sessionAt ? 'waiting' : 'live'));

  const elapsedSec = useCallback(() => (Date.now() - sessionAt) / 1000, [sessionAt]);

  useEffect(() => {
    if (durationSec == null) return;
    const iv = setInterval(() => {
      const el = elapsedSec();
      if (el < 0) setPhase('waiting');
      else if (el >= durationSec) setPhase('ended');
      else setPhase((p) => (p === 'ended' ? p : 'live'));
    }, 500);
    return () => clearInterval(iv);
  }, [elapsedSec, durationSec]);

  return { phase, elapsedSec };
}

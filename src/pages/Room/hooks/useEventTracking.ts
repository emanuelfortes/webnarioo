import { useCallback, useEffect, useRef } from 'react';
import { sb } from '../../../lib/supabase';

const MILESTONES = [60, 300, 600, 900, 1200, 1800, 2700];

export function useEventTracking(sessionAt: number | null, myLead: string) {
  const sentRef = useRef<Set<string>>(new Set());
  const evKeyRef = useRef('');

  useEffect(() => {
    if (!sessionAt) return;
    const evKey = 'wb_ev_' + sessionAt;
    evKeyRef.current = evKey;
    const stored = new Set<string>(JSON.parse(localStorage.getItem(evKey) || '[]'));
    // marcos anteriores à entrada não contam (quem chega no min 50 não "assistiu" o min 5)
    const elapsed = (Date.now() - sessionAt) / 1000;
    MILESTONES.forEach((m) => { if (elapsed > m) stored.add('watch' + m); });
    sentRef.current = stored;
  }, [sessionAt]);

  const track = useCallback((type: string, value?: number) => {
    if (!sessionAt) return;
    const tag = type + (value ?? '');
    if (sentRef.current.has(tag)) return;
    sentRef.current.add(tag);
    localStorage.setItem(evKeyRef.current, JSON.stringify([...sentRef.current]));
    sb.from('events').insert({ lead_id: myLead, session_at: sessionAt, type, value: value ?? null }).then(() => {});
  }, [sessionAt, myLead]);

  const trackMilestones = useCallback((t: number) => {
    MILESTONES.forEach((m) => { if (t >= m) track('watch', m); });
  }, [track]);

  return { track, trackMilestones };
}

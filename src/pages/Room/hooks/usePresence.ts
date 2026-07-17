import { useEffect, useState } from 'react';
import { sb } from '../../../lib/supabase';

export function usePresence(sessionAt: number | null, myLead: string, myName: string): number {
  const [viewers, setViewers] = useState(1);

  useEffect(() => {
    if (!sessionAt) return;
    const channel = sb.channel('presence_' + sessionAt, { config: { presence: { key: myLead } } });
    channel.on('presence', { event: 'sync' }, () => {
      setViewers(Object.keys(channel.presenceState()).length);
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ n: myName });
    });
    return () => { sb.removeChannel(channel); };
  }, [sessionAt, myLead, myName]);

  return viewers;
}

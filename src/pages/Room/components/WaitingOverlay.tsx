import { useEffect, useState } from 'react';

interface WaitingOverlayProps {
  targetMs: number;
}

function formatDiff(diffMs: number): string {
  const m = Math.floor(diffMs / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);
  return String(Math.max(0, m)).padStart(2, '0') + ':' + String(Math.max(0, s)).padStart(2, '0');
}

export function WaitingOverlay({ targetMs }: WaitingOverlayProps) {
  const [label, setLabel] = useState(() => formatDiff(targetMs - Date.now()));

  useEffect(() => {
    const iv = setInterval(() => setLabel(formatDiff(targetMs - Date.now())), 500);
    return () => clearInterval(iv);
  }, [targetMs]);

  return (
    <>
      <div className="mb-2.5 text-[1.6rem] font-extrabold">Sua sessão começa em</div>
      <div className="my-3 text-[2.6rem] font-black tracking-[3px]">{label}</div>
      <div>Não feche esta página.</div>
    </>
  );
}

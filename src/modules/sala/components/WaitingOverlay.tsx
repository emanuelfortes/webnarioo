'use client';

import { useEffect, useState } from 'react';

function formatar(diffMs: number): string {
  const m = Math.floor(Math.max(0, diffMs) / 60000);
  const s = Math.floor((Math.max(0, diffMs) % 60000) / 1000);
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function WaitingOverlay({ targetMs }: { targetMs: number }) {
  const [label, setLabel] = useState(() => formatar(targetMs - Date.now()));

  useEffect(() => {
    const iv = setInterval(() => setLabel(formatar(targetMs - Date.now())), 500);
    return () => clearInterval(iv);
  }, [targetMs]);

  return (
    <>
      <div className="mb-2.5 text-[1.6rem] font-extrabold">Sua sessão começa em</div>
      <div className="my-3 text-[2.6rem] font-black tracking-[3px] tabular-nums">{label}</div>
      <div>Não feche esta página.</div>
    </>
  );
}

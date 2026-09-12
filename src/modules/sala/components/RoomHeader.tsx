'use client';

interface RoomHeaderProps {
  viewers: number;
  live: boolean;
}

/**
 * O título saiu daqui e passou a ficar logo acima do vídeo, onde o olho já
 * está. Este cabeçalho ficou com o que é estado da sessão: se está no ar e
 * quantas pessoas assistem.
 */
export function RoomHeader({ viewers, live }: RoomHeaderProps) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between bg-[#0d1117] px-[18px] py-2.5 text-white">
      <span
        className={
          'rounded-full px-2.5 py-1 text-[.75rem] font-bold ' +
          (live
            ? "bg-[#dcfce7] text-[#15803d] before:text-[#22c55e] before:content-['●_']"
            : 'bg-[#1f2937] text-[#9ca3af]')
        }
      >
        {live ? 'SESSÃO EM ANDAMENTO' : 'AGUARDANDO INÍCIO'}
      </span>

      <span className="rounded-full bg-[#1f2937] px-2.5 py-1 text-[.75rem] font-bold text-[#e5e7eb] tabular-nums">
        <span aria-hidden="true">👁</span> {viewers}
        <span className="sr-only"> espectadores</span>
      </span>
    </header>
  );
}

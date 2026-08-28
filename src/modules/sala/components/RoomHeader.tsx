'use client';

interface RoomHeaderProps {
  title: string;
  viewers: number;
  live: boolean;
}

export function RoomHeader({ title, viewers, live }: RoomHeaderProps) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between bg-[#0d1117] px-[18px] py-2.5 text-white">
      <h1 className="text-[.95rem] font-bold">{title}</h1>
      <div className="flex items-center gap-2.5">
        {live && (
          <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[.75rem] font-bold text-[#15803d] before:text-[#22c55e] before:content-['●_']">
            SESSÃO EM ANDAMENTO
          </span>
        )}
        <span className="rounded-full bg-[#1f2937] px-2.5 py-1 text-[.75rem] font-bold text-[#e5e7eb]">
          <span aria-hidden="true">👁</span> {viewers}
          <span className="sr-only"> espectadores</span>
        </span>
      </div>
    </header>
  );
}

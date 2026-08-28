export function ProgressBar({ percent }: { percent: number }) {
  return (
    <>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da aplicação"
        className="mx-auto h-2.5 max-w-[280px] flex-1 overflow-hidden rounded-full bg-[#1a2236]"
      >
        <i
          className="block h-full rounded-full bg-[#3b82f6] transition-[width] duration-[.4s]"
          style={{ width: percent + '%' }}
        />
      </div>
      <span className="min-w-[36px] text-[.8rem] tabular-nums text-[#8b95ab]">{percent}%</span>
    </>
  );
}

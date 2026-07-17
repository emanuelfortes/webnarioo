interface ProgressBarProps {
  percent: number;
}

export function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <>
      <div className="mx-auto h-2.5 max-w-[280px] flex-1 overflow-hidden rounded-full bg-[#1a2236]">
        <i className="block h-full rounded-full bg-[#3b82f6] transition-[width] duration-[.4s]" style={{ width: percent + '%' }} />
      </div>
      <span className="min-w-[36px] text-[.8rem] text-[#8b95ab]">{percent}%</span>
    </>
  );
}

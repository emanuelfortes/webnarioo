import { pct } from '@/core/format';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  boldLabel?: boolean;
  showPct?: boolean;
}

export function StatBar({
  label,
  value,
  max,
  color = '#c7d7fe',
  boldLabel = true,
  showPct = true,
}: StatBarProps) {
  const largura = max ? Math.round((value / max) * 100) : 0;

  return (
    <div className="relative mb-2 h-[26px] overflow-hidden rounded-md bg-[#eef2ff]">
      <i className="absolute inset-0 block rounded-md" style={{ width: largura + '%', background: color }} />
      <span className="relative z-10 flex h-full items-center justify-between px-2.5 text-[.8rem]">
        {boldLabel ? <b>{label}</b> : label}
        <b className="tabular-nums">
          {value}
          {showPct ? ` (${pct(value, max)})` : ''}
        </b>
      </span>
    </div>
  );
}

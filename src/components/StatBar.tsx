import { pct } from '../lib/format';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  boldLabel?: boolean;
  showPct?: boolean;
}

export function StatBar({ label, value, max, color = '#c7d7fe', boldLabel = true, showPct = true }: StatBarProps) {
  const width = max ? Math.round((value / max) * 100) : 0;
  const labelEl = boldLabel ? <b>{label}</b> : label;
  return (
    <div className="relative mb-2 h-[26px] overflow-hidden rounded-md bg-[#eef2ff]">
      <i className="absolute inset-0 block rounded-md" style={{ width: width + '%', background: color }} />
      <span className="relative z-10 flex h-full items-center justify-between px-2.5 text-[.8rem]">
        {labelEl}
        <b>{value}{showPct ? ` (${pct(value, max)})` : ''}</b>
      </span>
    </div>
  );
}

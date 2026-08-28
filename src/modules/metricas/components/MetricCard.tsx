interface MetricCardProps {
  label: string;
  value: number | string;
  sub?: string;
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="rounded-xl bg-white p-[18px] shadow-[0_1px_4px_rgba(0,0,0,.08)]">
      <div className="text-[.78rem] uppercase tracking-[.5px] text-[#6b7280]">{label}</div>
      <div className="mt-1 text-[1.9rem] font-extrabold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-[.78rem] text-[#6b7280]">{sub}</div>}
    </div>
  );
}

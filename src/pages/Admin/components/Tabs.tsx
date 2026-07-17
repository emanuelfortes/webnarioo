export type AdminTab = 'cfg' | 'leads' | 'apps' | 'chat';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'cfg', label: 'Configuração' },
  { key: 'leads', label: 'Leads' },
  { key: 'apps', label: 'Aplicações' },
  { key: 'chat', label: 'Chat / Moderação' },
];

interface TabsProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="mb-[18px] flex flex-wrap gap-2">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-lg px-5 py-2.5 font-semibold ${active === t.key ? 'bg-[#111827] text-white' : 'bg-[#e5e7eb]'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

interface OptionsStepInputProps {
  options: string[];
  onAnswer: (value: string) => void;
}

export function OptionsStepInput({ options, onAnswer }: OptionsStepInputProps) {
  return (
    <div className="mx-auto max-w-[760px]">
      <label className="mb-2 block text-[.75rem] uppercase tracking-[1px] text-[#8b95ab]">Escolha uma opção</label>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onAnswer(o)}
            className="rounded-xl border border-[#2a3348] bg-[#111827] px-[18px] py-3 text-[.95rem] text-[#f1f5f9] transition-[.15s] hover:border-[#3b82f6] hover:bg-[#152036]"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

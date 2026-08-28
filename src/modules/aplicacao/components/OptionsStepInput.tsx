'use client';

interface OptionsStepInputProps {
  label: string;
  options: string[];
  onAnswer: (valor: string) => void;
}

export function OptionsStepInput({ label, options, onAnswer }: OptionsStepInputProps) {
  return (
    <fieldset className="mx-auto max-w-[760px]">
      <legend className="mb-2 block text-[.75rem] uppercase tracking-[1px] text-[#8b95ab]">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onAnswer(o)}
            className="rounded-xl border border-[#2a3348] bg-[#111827] px-[18px] py-3 text-[.95rem] text-[#f1f5f9] transition hover:border-[#3b82f6] hover:bg-[#152036]"
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

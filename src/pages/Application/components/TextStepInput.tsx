import { useEffect, useRef, useState } from 'react';

interface TextStepInputProps {
  label: string;
  placeholder?: string;
  onAnswer: (value: string) => void;
}

export function TextStepInput({ label, placeholder, onAnswer }: TextStepInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onAnswer(v);
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <label className="mb-2 block text-[.75rem] uppercase tracking-[1px] text-[#8b95ab]">{label}</label>
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={200}
          autoComplete="off"
          className="flex-1 rounded-full border border-[#2a3348] bg-[#111827] px-4 py-3.5 text-base text-[#f1f5f9] focus:border-transparent focus:outline focus:outline-2 focus:outline-[#3b82f6]"
        />
        <button type="submit" className="rounded-full bg-[#3b82f6] px-[26px] text-base font-bold text-white">➤</button>
      </form>
    </div>
  );
}

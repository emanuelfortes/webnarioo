'use client';

import { useEffect, useRef, useState } from 'react';

interface TextStepInputProps {
  id: string;
  label: string;
  placeholder?: string;
  onAnswer: (valor: string) => void;
}

export function TextStepInput({ id, label, placeholder, onAnswer }: TextStepInputProps) {
  const [valor, setValor] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const v = valor.trim();
    if (!v) return;
    onAnswer(v);
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <label htmlFor={id} className="mb-2 block text-[.75rem] uppercase tracking-[1px] text-[#8b95ab]">
        {label}
      </label>
      <form onSubmit={enviar} className="flex gap-2.5">
        <input
          id={id}
          ref={inputRef}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={placeholder}
          maxLength={200}
          autoComplete="off"
          className="flex-1 rounded-full border border-[#2a3348] bg-[#111827] px-4 py-3.5 text-base text-[#f1f5f9] focus:border-transparent focus:outline focus:outline-2 focus:outline-[#3b82f6]"
        />
        <button
          type="submit"
          aria-label="Responder"
          className="rounded-full bg-[#3b82f6] px-[26px] text-base font-bold text-white"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

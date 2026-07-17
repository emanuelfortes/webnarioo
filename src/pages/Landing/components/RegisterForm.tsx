import { useState } from 'react';

interface RegisterFormProps {
  onRegister: (name: string, email: string, whats: string) => Promise<boolean>;
}

const IDLE_LABEL = '🔴 Garantir minha vaga na próxima sessão';

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whats, setWhats] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onRegister(name.trim(), email.trim(), whats.trim());
    if (!ok) {
      alert('Erro ao registrar. Tente novamente.');
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-[10px] border border-[#2a3348] bg-[#0d1322] px-3.5 py-3 text-base text-[#f9fafb] focus:border-transparent focus:outline focus:outline-2 focus:outline-[#e11d48]";
  const labelClass = "mt-3.5 mb-1.5 block text-[.82rem] text-[#9ca3af]";

  return (
    <form onSubmit={handleSubmit}>
      <label className={labelClass}>Seu nome</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text"
        placeholder="Ex: Dr. João da Silva, OAB/SP"
        required
        maxLength={60}
        className={inputClass}
      />
      <label className={labelClass}>E-mail</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="seu@email.com.br"
        required
        className={inputClass}
      />
      <label className={labelClass}>WhatsApp</label>
      <input
        value={whats}
        onChange={(e) => setWhats(e.target.value)}
        type="tel"
        placeholder="(11) 99999-9999"
        required
        className={inputClass}
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-[22px] w-full rounded-[10px] bg-[#dc2626] py-4 text-[1.08rem] font-bold text-white transition hover:brightness-[1.12] disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? 'Reservando sua vaga…' : IDLE_LABEL}
      </button>
    </form>
  );
}

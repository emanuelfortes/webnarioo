import { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  error: string;
  hint?: string;
}

export function LoginForm({ onLogin, error, hint }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onLogin(email.trim(), password);
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto max-w-[1100px] px-4">
      <div className="mx-auto mt-20 max-w-[400px] rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h2 className="mb-1.5 text-xl">Entrar</h2>
        {hint && <p className="mt-1.5 text-[.82rem] text-[#6b7280]">{hint}</p>}
        <form onSubmit={handleSubmit}>
          <label className="mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]"
          />
          <label className="mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-4.5 rounded-lg bg-[#111827] px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            Entrar
          </button>
          {error && <p className="mt-2.5 text-[.85rem] text-[#dc2626]">{error}</p>}
        </form>
      </div>
    </div>
  );
}

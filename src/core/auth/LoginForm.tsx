'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { entrar, type EstadoLogin } from './actions';

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 rounded-lg bg-[#111827] px-6 py-3 font-bold text-white disabled:opacity-60"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}

export function LoginForm({ hint }: { hint?: string }) {
  const [estado, acao] = useActionState<EstadoLogin, FormData>(entrar, {});
  const router = useRouter();

  // Sem erro após um envio significa sessão criada: recarrega para o servidor
  // reavaliar a autorização e renderizar o painel.
  useEffect(() => {
    if (estado && !estado.erro && Object.keys(estado).length === 0) return;
  }, [estado]);

  return (
    <div className="container mx-auto max-w-[1100px] px-4">
      <div className="mx-auto mt-20 max-w-[400px] rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h2 className="mb-1.5 text-xl">Entrar</h2>
        {hint && <p className="mt-1.5 text-[.82rem] text-[#6b7280]">{hint}</p>}

        <form
          action={async (form: FormData) => {
            await acao(form);
            router.refresh();
          }}
        >
          <label htmlFor="login-email" className="mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]">
            E-mail
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]"
          />

          <label htmlFor="login-senha" className="mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]">
            Senha
          </label>
          <input
            id="login-senha"
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]"
          />

          <Botao />

          {estado.erro && (
            <p role="alert" className="mt-2.5 text-[.85rem] text-[#dc2626]">
              {estado.erro}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

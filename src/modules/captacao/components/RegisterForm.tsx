'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { cadastrar, type EstadoCadastro } from '../actions';

const inputClass =
  'w-full rounded-[10px] border border-[#2a3348] bg-[#0d1322] px-3.5 py-3 text-base text-[#f9fafb] focus:border-transparent focus:outline focus:outline-2 focus:outline-[#e11d48]';
const labelClass = 'mt-3.5 mb-1.5 block text-[.82rem] text-[#9ca3af]';

function Botao({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-[22px] w-full rounded-[10px] bg-[#dc2626] py-4 text-[1.08rem] font-bold text-white transition hover:brightness-[1.12] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? 'Reservando sua vaga…' : label}
    </button>
  );
}

interface RegisterFormProps {
  ctaLabel: string;
  consentText: string;
}

export function RegisterForm({ ctaLabel, consentText }: RegisterFormProps) {
  const [estado, acao] = useActionState<EstadoCadastro, FormData>(cadastrar, {});

  return (
    <form action={acao}>
      {/* M11 da auditoria: label e input ligados por id, em todos os campos. */}
      <label className={labelClass} htmlFor="cad-nome">
        Seu nome
      </label>
      <input
        id="cad-nome"
        name="nome"
        type="text"
        placeholder="Ex: Dr. João da Silva, OAB/SP"
        required
        maxLength={60}
        autoComplete="name"
        className={inputClass}
      />

      <label className={labelClass} htmlFor="cad-email">
        E-mail
      </label>
      <input
        id="cad-email"
        name="email"
        type="email"
        placeholder="seu@email.com.br"
        required
        autoComplete="email"
        className={inputClass}
      />

      <label className={labelClass} htmlFor="cad-whats">
        WhatsApp
      </label>
      <input
        id="cad-whats"
        name="whatsapp"
        type="tel"
        placeholder="(11) 99999-9999"
        required
        autoComplete="tel"
        className={inputClass}
      />

      {/* A4 da auditoria: consentimento explícito, com a finalidade declarada. */}
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[.8rem] leading-[1.45] text-[#9ca3af]">
        <input
          type="checkbox"
          name="consentimento"
          required
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#dc2626]"
        />
        <span>
          {consentText}{' '}
          {/*
            O link da política é acrescentado aqui, e não no texto configurável:
            é exigência legal, e não pode sumir porque alguém reescreveu a frase
            no painel.
          */}
          Leia a{' '}
          <a href="/privacidade" className="text-[#93c5fd] underline">
            política de privacidade
          </a>
          .
        </span>
      </label>

      <Botao label={ctaLabel} />

      {estado.erro && (
        <p role="alert" className="mt-3 text-center text-[.85rem] text-[#fca5a5]">
          {estado.erro}
        </p>
      )}
    </form>
  );
}

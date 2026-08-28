'use server';

import { redirect } from 'next/navigation';
import { serverEnv } from '../env';
import { criarSessao, encerrarSessao, senhaConfere } from './session';

export interface EstadoLogin {
  erro?: string;
}

export async function entrar(_anterior: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const senha = String(form.get('senha') ?? '');

  if (!email || !senha) {
    return { erro: 'Preencha e-mail e senha.' };
  }

  const emailConfere = email === serverEnv.adminEmail.trim().toLowerCase();
  const senhaValida = await senhaConfere(senha, serverEnv.adminPasswordHash);

  // Mensagem única para não revelar qual dos dois campos errou.
  if (!emailConfere || !senhaValida) {
    return { erro: 'E-mail ou senha incorretos.' };
  }

  await criarSessao(email);
  return {};
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect('/admin');
}

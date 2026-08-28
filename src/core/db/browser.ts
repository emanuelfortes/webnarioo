'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente do navegador. Carrega a anon key, cujo único poder no RLS é
 * `select` em `messages` — o suficiente para a assinatura de realtime do chat.
 *
 * Nenhuma escrita passa por aqui. Toda mutação é Server Action.
 *
 * A criação é preguiçosa: se fosse no topo do módulo, faltar uma variável
 * quebraria o build em vez de quebrar em quem realmente usa o realtime.
 */
let cliente: SupabaseClient | null = null;

function conectar(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias para o chat.',
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Proxy que só conecta na primeira chamada de verdade. */
export const realtime = new Proxy({} as SupabaseClient, {
  get(_alvo, prop) {
    cliente ??= conectar();
    const valor = Reflect.get(cliente, prop);
    return typeof valor === 'function' ? valor.bind(cliente) : valor;
  },
});

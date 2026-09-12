import 'server-only';
import { cache } from 'react';
import { db } from './db/server';
import type { ScheduledMessage, ViewerPoint, WebinarConfig } from './types';

/**
 * Valores usados quando a coluna ainda não existe no banco.
 *
 * Sem isto, subir o código antes de rodar a migração deixaria a landing com
 * campos vazios e derrubaria a sala (a curva viria `undefined`). Com isto, a
 * ordem entre deploy e migração deixa de importar: o site segue igual até as
 * colunas aparecerem.
 */
const PADROES = {
  landing_subtitle:
    'Encha a agenda de consultas do seu escritório com clientes vindos do Google, sem depender de indicação e sem risco com a OAB.',
  author_name: 'ACEV',
  author_bio:
    'Especialistas em captação de clientes pelo Google para escritórios de advocacia: Ads, SEO e presença local',
  register_cta_label: '🔴 Garantir minha vaga na próxima sessão',
  consent_text:
    'Autorizo a ACEV a usar meus dados para me dar acesso a esta sessão e entrar em contato sobre os serviços apresentados. Posso pedir a exclusão a qualquer momento.',
  footer_text: 'ACEV · Todos os direitos reservados',
} as const;

const texto = (v: unknown, padrao: string): string =>
  typeof v === 'string' && v.trim() ? v : padrao;

function normalizar(linha: Record<string, unknown>): WebinarConfig {
  return {
    ...(linha as unknown as WebinarConfig),

    landing_subtitle: texto(linha.landing_subtitle, PADROES.landing_subtitle),
    author_name: texto(linha.author_name, PADROES.author_name),
    author_bio: texto(linha.author_bio, PADROES.author_bio),
    register_cta_label: texto(linha.register_cta_label, PADROES.register_cta_label),
    consent_text: texto(linha.consent_text, PADROES.consent_text),
    footer_text: texto(linha.footer_text, PADROES.footer_text),

    scheduled_messages: Array.isArray(linha.scheduled_messages)
      ? (linha.scheduled_messages as ScheduledMessage[])
      : [],
    viewers_curve: Array.isArray(linha.viewers_curve)
      ? (linha.viewers_curve as ViewerPoint[])
      : [],
  };
}

/**
 * Configuração única do webinar (linha id=1). O `cache` do React desduplica a
 * consulta dentro de uma mesma renderização, então cada módulo chama à vontade.
 */
export const getConfig = cache(async (): Promise<WebinarConfig> => {
  const { data, error } = await db().from('webinar_config').select('*').eq('id', 1).single();

  if (error || !data) {
    throw new Error(
      'Configuração do webinar não encontrada. Rode supabase/schema.sql no seu projeto. ' +
        (error?.message ?? ''),
    );
  }

  return normalizar(data as Record<string, unknown>);
});

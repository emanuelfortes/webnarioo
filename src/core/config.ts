import 'server-only';
import { cache } from 'react';
import { db } from './db/server';
import type { WebinarConfig } from './types';

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

  return data as WebinarConfig;
});

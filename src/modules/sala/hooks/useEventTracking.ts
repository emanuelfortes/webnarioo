'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { EventType } from '@/core/types';
import { registrarEvento } from '../actions';

const MARCOS = [60, 300, 600, 900, 1200, 1800, 2700];

/**
 * Telemetria da sala. O `localStorage` evita chamadas repetidas entre recargas;
 * a garantia real de contagem única é o índice `events_dedup` no banco.
 */
export function useEventTracking(sessionAt: number, temIdentidade: boolean) {
  const enviados = useRef<Set<string>>(new Set());
  const chaveRef = useRef('');

  useEffect(() => {
    const chave = 'wb_ev_' + sessionAt;
    chaveRef.current = chave;

    let guardados: string[] = [];
    try {
      guardados = JSON.parse(localStorage.getItem(chave) || '[]');
    } catch {
      guardados = [];
    }
    const conjunto = new Set(guardados);

    // Marcos anteriores à entrada não contam: quem chega no minuto 50 não
    // "assistiu" o minuto 5.
    const decorrido = (Date.now() - sessionAt) / 1000;
    MARCOS.forEach((m) => {
      if (decorrido > m) conjunto.add('watch' + m);
    });

    enviados.current = conjunto;
  }, [sessionAt]);

  const track = useCallback(
    async (type: EventType, value?: number) => {
      if (!temIdentidade) return;

      const tag = type + (value ?? '');
      if (enviados.current.has(tag)) return;
      enviados.current.add(tag);

      try {
        localStorage.setItem(chaveRef.current, JSON.stringify([...enviados.current]));
      } catch {
        // Modo privado ou storage cheio: o índice do banco continua protegendo.
      }

      await registrarEvento(sessionAt, type, value);
    },
    [sessionAt, temIdentidade],
  );

  const trackMarcos = useCallback(
    (segundos: number) => {
      MARCOS.forEach((m) => {
        if (segundos >= m) void track('watch', m);
      });
    },
    [track],
  );

  return { track, trackMarcos };
}

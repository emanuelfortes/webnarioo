import type { ViewerPoint } from '@/core/types';

/**
 * Ruído determinístico em [0, 1), a partir de duas sementes inteiras.
 *
 * Determinístico de propósito: todo mundo na mesma sessão vê o mesmo número no
 * mesmo instante. Se dois participantes compararem a tela, os contadores batem
 * — que é justamente o tipo de detalhe que denuncia um número inventado.
 */
function ruido(a: number, b: number): number {
  let x = (a ^ Math.imul(b, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/** Quanto tempo cada valor sorteado permanece, em segundos. */
const BALDE_SEG = 20;

/** Amplitude da variação, como fração do valor da curva. */
const VARIACAO = 0.035;

/**
 * Valor da curva no segundo pedido, interpolado linearmente entre os pontos
 * vizinhos e com uma pequena variação para o número não ficar parado.
 *
 * Antes do primeiro ponto vale o primeiro; depois do último vale o último.
 * Curva vazia devolve zero — aí a sala mostra apenas a presença real.
 */
export function espectadoresFake(
  curva: ViewerPoint[],
  segundos: number,
  semente: number,
): number {
  if (!curva.length) return 0;

  const pontos = [...curva].sort((x, y) => x.at - y.at);

  let base: number;

  if (segundos <= pontos[0].at) {
    base = pontos[0].n;
  } else if (segundos >= pontos[pontos.length - 1].at) {
    base = pontos[pontos.length - 1].n;
  } else {
    const i = pontos.findIndex((p) => p.at > segundos);
    const anterior = pontos[i - 1];
    const proximo = pontos[i];
    const intervalo = proximo.at - anterior.at;
    const fracao = intervalo > 0 ? (segundos - anterior.at) / intervalo : 0;
    base = anterior.n + (proximo.n - anterior.n) * fracao;
  }

  const balde = Math.floor(Math.max(0, segundos) / BALDE_SEG);
  const amplitude = Math.max(1, Math.round(base * VARIACAO));
  const desvio = Math.round((ruido(semente, balde) * 2 - 1) * amplitude);

  return Math.max(0, Math.round(base) + desvio);
}

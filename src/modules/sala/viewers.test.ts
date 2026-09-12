import { test } from 'node:test';
import assert from 'node:assert/strict';
import { espectadoresFake } from './viewers.ts';

/**
 * A variação é intencional, então as asserções trabalham com tolerância. O
 * limite usado aqui é maior que a amplitude configurada (3,5%), e menor do que
 * qualquer erro real de interpolação apareceria.
 */
const perto = (valor: number, esperado: number, folga = 8) =>
  assert.ok(
    Math.abs(valor - esperado) <= folga,
    `esperava ~${esperado}, recebeu ${valor} (folga ${folga})`,
  );

const CURVA = [
  { at: 0, n: 20 },
  { at: 600, n: 200 },
  { at: 3600, n: 100 },
];

const SESSAO = 1789000000000;

test('curva vazia devolve zero — a sala mostra só a presença real', () => {
  assert.equal(espectadoresFake([], 100, SESSAO), 0);
});

test('antes do primeiro ponto vale o primeiro valor', () => {
  perto(espectadoresFake(CURVA, -120, SESSAO), 20);
});

test('depois do último ponto vale o último valor', () => {
  perto(espectadoresFake(CURVA, 99999, SESSAO), 100);
});

test('interpola linearmente entre dois pontos', () => {
  // Metade do caminho entre (0s, 20) e (600s, 200).
  perto(espectadoresFake(CURVA, 300, SESSAO), 110);
});

test('um único ponto vira valor constante', () => {
  perto(espectadoresFake([{ at: 0, n: 50 }], 1234, SESSAO), 50);
});

test('pontos fora de ordem são ordenados antes de interpolar', () => {
  const bagunçada = [
    { at: 3600, n: 100 },
    { at: 0, n: 20 },
    { at: 600, n: 200 },
  ];
  perto(espectadoresFake(bagunçada, 300, SESSAO), 110);
});

test('é determinístico: todos na mesma sessão veem o mesmo número', () => {
  assert.equal(espectadoresFake(CURVA, 742, SESSAO), espectadoresFake(CURVA, 742, SESSAO));
});

test('sessões diferentes não variam em sincronia', () => {
  assert.notEqual(
    espectadoresFake(CURVA, 742, SESSAO),
    espectadoresFake(CURVA, 742, SESSAO + 99999),
  );
});

test('o número se mexe ao longo da sessão', () => {
  const amostras = new Set<number>();
  for (let t = 0; t <= 600; t += 20) amostras.add(espectadoresFake(CURVA, t, SESSAO));
  assert.ok(amostras.size > 10, `só ${amostras.size} valores distintos em 31 amostras`);
});

test('nunca devolve negativo, mesmo com curva zerada', () => {
  for (let i = 0; i < 200; i++) {
    assert.ok(espectadoresFake([{ at: 0, n: 0 }], i * 10, SESSAO) >= 0);
  }
});

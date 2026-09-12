import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deMMSS, paraMMSS } from './tempo.ts';

/**
 * Erro aqui desloca um comentário no tempo — e um comentário fora de hora é
 * pior do que comentário nenhum, porque denuncia o roteiro.
 */

test('formata segundos como mm:ss', () => {
  assert.equal(paraMMSS(0), '0:00');
  assert.equal(paraMMSS(9), '0:09');
  assert.equal(paraMMSS(60), '1:00');
  assert.equal(paraMMSS(90), '1:30');
  assert.equal(paraMMSS(2700), '45:00');
  assert.equal(paraMMSS(4500), '75:00');
});

test('formata negativo como zero em vez de quebrar', () => {
  assert.equal(paraMMSS(-30), '0:00');
});

test('arredonda fração de segundo', () => {
  assert.equal(paraMMSS(89.6), '1:30');
});

test('lê mm:ss', () => {
  assert.equal(deMMSS('0:00'), 0);
  assert.equal(deMMSS('1:30'), 90);
  assert.equal(deMMSS('45:00'), 2700);
  assert.equal(deMMSS('75:00'), 4500);
});

test('lê hh:mm:ss', () => {
  assert.equal(deMMSS('1:15:00'), 4500);
});

test('número solto é lido como segundos', () => {
  assert.equal(deMMSS('90'), 90);
  assert.equal(deMMSS('2700'), 2700);
});

test('tolera espaços', () => {
  assert.equal(deMMSS('  2 : 30 '), 150);
});

test('devolve null no que não dá para entender', () => {
  assert.equal(deMMSS(''), null);
  assert.equal(deMMSS('abc'), null);
  assert.equal(deMMSS('1:2:3:4'), null);
  assert.equal(deMMSS('-5'), null);
  assert.equal(deMMSS('1:-30'), null);
});

test('ida e volta preserva o valor', () => {
  for (const s of [0, 7, 60, 61, 599, 2700, 4500]) {
    assert.equal(deMMSS(paraMMSS(s)), s, `falhou em ${s}`);
  }
});

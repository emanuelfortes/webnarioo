#!/usr/bin/env node
// Gera o valor de ADMIN_PASSWORD_HASH.
// Uso: npm run gerar-senha -- "sua-senha-aqui"

import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const senha = process.argv[2];

if (!senha) {
  console.error('Uso: npm run gerar-senha -- "sua-senha-aqui"');
  process.exit(1);
}

if (senha.length < 10) {
  console.error('Use ao menos 10 caracteres.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await scryptAsync(senha, salt, 64);

console.log('\nCopie a linha abaixo para o seu .env.local:\n');
console.log(`ADMIN_PASSWORD_HASH=${salt.toString('hex')}:${hash.toString('hex')}\n`);

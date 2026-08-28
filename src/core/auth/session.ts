import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { serverEnv } from '../env';

const scryptAsync = promisify(scrypt) as (
  senha: string,
  salt: Buffer,
  tamanho: number,
) => Promise<Buffer>;

const COOKIE = 'wb_admin';
const DURACAO_HORAS = 12;

const chave = () => new TextEncoder().encode(serverEnv.sessionSecret);

/**
 * Confere a senha contra o hash scrypt guardado em ADMIN_PASSWORD_HASH,
 * no formato `salt:hash` (hex). Comparação em tempo constante.
 */
export async function senhaConfere(senha: string, armazenado: string): Promise<boolean> {
  const [saltHex, hashHex] = armazenado.split(':');
  if (!saltHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = await scryptAsync(senha, Buffer.from(saltHex, 'hex'), esperado.length);

  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

export async function criarSessao(email: string): Promise<void> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_HORAS}h`)
    .sign(chave());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACAO_HORAS * 3600,
  });
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/**
 * Verdadeiro só com um cookie assinado e válido. Diferente do modelo anterior,
 * em que o login era condicional de renderização no React e podia ser ignorado
 * chamando a API direto (A1 da auditoria).
 */
export async function ehAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, chave());
    return true;
  } catch {
    return false;
  }
}

/** Porta de entrada de toda Server Action e query do Dashboard e do Admin. */
export async function exigirAdmin(): Promise<void> {
  if (!(await ehAdmin())) {
    throw new Error('Não autorizado.');
  }
}

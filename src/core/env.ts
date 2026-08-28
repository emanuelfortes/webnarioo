import 'server-only';

/**
 * M10 da auditoria: antes, uma variável ausente derrubava o app inteiro com uma
 * tela branca sem pista nenhuma. Agora a falha é explícita e diz o que falta.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ausente: ${name}. ` +
        'Copie .env.example para .env.local e preencha antes de subir o servidor.',
    );
  }
  return value;
}

export const serverEnv = {
  get supabaseUrl() {
    return required('NEXT_PUBLIC_SUPABASE_URL');
  },
  get serviceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },
  get adminEmail() {
    return required('ADMIN_EMAIL');
  },
  get adminPasswordHash() {
    return required('ADMIN_PASSWORD_HASH');
  },
  get sessionSecret() {
    return required('SESSION_SECRET');
  },
};

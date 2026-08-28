import next from 'eslint-config-next';

const config = [
  { ignores: ['.next/**', 'dist/**', 'node_modules/**', 'scripts/**', 'auditoria-webnario.html'] },
  ...next,
];

export default config;

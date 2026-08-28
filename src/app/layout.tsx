import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sessão Exclusiva | ACEV',
    template: '%s | ACEV',
  },
  description:
    'Como encher a agenda de consultas do seu escritório de advocacia com clientes vindos do Google — sem depender de indicação e sem risco com a OAB.',
  // B4 da auditoria: sem estas tags, o link compartilhado no WhatsApp saía cru.
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'ACEV',
    title: 'Sessão Exclusiva | ACEV',
    description:
      'Como encher a agenda de consultas do seu escritório com clientes vindos do Google.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

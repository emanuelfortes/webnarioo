import type { Metadata } from 'next';
import { getConfig } from '@/core/config';
import { ApplicationClient } from '@/modules/aplicacao/components/ApplicationClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aplicação · Diagnóstico gratuito',
  robots: { index: false, follow: false },
};

export default async function AplicacaoPage() {
  const cfg = await getConfig();
  return <ApplicationClient bookingUrl={cfg.booking_url} />;
}

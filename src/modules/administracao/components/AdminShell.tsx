'use client';

import { useState } from 'react';
import type { Application, Lead, WebinarConfig } from '@/core/types';
import type { Pagina } from '../queries';
import { Tabs, type AdminTab } from './Tabs';
import { ConfigTab } from './ConfigTab';
import { LeadsTab } from './LeadsTab';
import { ApplicationsTab } from './ApplicationsTab';
import { ChatModerationTab } from './ChatModerationTab';

interface AdminShellProps {
  cfg: WebinarConfig;
  leads: Pagina<Lead>;
  aplicacoes: Pagina<Application>;
  sessoes: number[];
}

export function AdminShell({ cfg, leads, aplicacoes, sessoes }: AdminShellProps) {
  const [aba, setAba] = useState<AdminTab>('cfg');

  return (
    <div className="container mx-auto max-w-[1100px] px-4 py-6">
      <Tabs active={aba} onChange={setAba} />
      {aba === 'cfg' && <ConfigTab cfg={cfg} />}
      {aba === 'leads' && <LeadsTab pagina={leads} />}
      {aba === 'apps' && <ApplicationsTab pagina={aplicacoes} />}
      {aba === 'chat' && <ChatModerationTab sessoes={sessoes} />}
    </div>
  );
}

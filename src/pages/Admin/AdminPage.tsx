import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from '../../components/auth/LoginForm';
import { Tabs, type AdminTab } from './components/Tabs';
import { ConfigTab } from './components/ConfigTab';
import { LeadsTab } from './components/LeadsTab';
import { ApplicationsTab } from './components/ApplicationsTab';
import { ChatModerationTab } from './components/ChatModerationTab';

export function AdminPage() {
  const { isAuthenticated, checking, error, login, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>('cfg');

  useEffect(() => { document.title = 'Admin | Webinar ACEV'; }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
      <div className="flex items-center justify-between bg-[#111827] px-[22px] py-3.5 text-white">
        <b className="text-[1.05rem]">⚙️ Painel do Webinar · ACEV</b>
        <div>
          <Link to="/dashboard" className="mr-4 text-[.85rem] text-[#93c5fd] no-underline">📊 Dashboard</Link>
          {isAuthenticated && (
            <button onClick={logout} className="rounded-lg bg-[#374151] px-3.5 py-2 text-white">Sair</button>
          )}
        </div>
      </div>

      {checking ? null : !isAuthenticated ? (
        <LoginForm onLogin={login} error={error} hint="Use o usuário criado em Authentication > Users no Supabase." />
      ) : (
        <div className="container mx-auto max-w-[1100px] px-4 py-6">
          <Tabs active={tab} onChange={setTab} />
          {tab === 'cfg' && <ConfigTab />}
          {tab === 'leads' && <LeadsTab />}
          {tab === 'apps' && <ApplicationsTab />}
          {tab === 'chat' && <ChatModerationTab />}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sb } from '../../lib/supabase';
import { AuthorCard } from './components/AuthorCard';
import { RegisterForm } from './components/RegisterForm';

function nextSession(intervalMin: number): number {
  const ms = intervalMin * 60000;
  return Math.ceil((Date.now() + 60000) / ms) * ms; // mínimo 1 min de antecedência
}

export function LandingPage() {
  const [title, setTitle] = useState('Carregando…');
  const [intervalMin, setIntervalMin] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sessão Exclusiva | ACEV';
  }, []);

  useEffect(() => {
    sb.from('webinar_config').select('title, interval_min').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setTitle(data.title);
        setIntervalMin(data.interval_min || 15);
      }
    });
  }, []);

  const handleRegister = async (name: string, email: string, whats: string): Promise<boolean> => {
    const session_at = nextSession(intervalMin);
    const leadId = crypto.randomUUID();
    const { error } = await sb.from('leads').insert({
      id: leadId, name, email, whatsapp: whats, session_at,
    });
    if (error) return false;
    localStorage.setItem('wb_name', name);
    localStorage.setItem('wb_lead', leadId);
    navigate('/sala?s=' + session_at);
    return true;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a] p-6 text-[#f9fafb]">
      <div className="w-full max-w-[560px]">
        <div className="rounded-2xl bg-[#111827] p-10 px-8 shadow-[0_20px_60px_rgba(0,0,0,.5)]">
          <h1 className="mb-3 text-center text-[1.9rem] leading-[1.25]">{title}</h1>
          <p className="mb-7 text-center text-[1.02rem] text-[#9ca3af]">
            Encha a agenda de consultas do seu escritório com clientes vindos do Google, sem depender de indicação e sem risco com a OAB.
          </p>
          <AuthorCard />
          <RegisterForm onRegister={handleRegister} />
          <p className="mt-3 text-center text-[.78rem] text-[#9ca3af]">Seus dados estão seguros. Sem spam.</p>
        </div>
        <footer className="mt-5 text-center text-[.75rem] text-[#4b5563]">
          © {new Date().getFullYear()} ACEV · Todos os direitos reservados
        </footer>
      </div>
    </div>
  );
}

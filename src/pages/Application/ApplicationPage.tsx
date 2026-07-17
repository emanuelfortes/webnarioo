import { useEffect, useRef, useState } from 'react';
import { sb } from '../../lib/supabase';
import { steps } from './steps';
import { ChatBubble } from './components/ChatBubble';
import { ProgressBar } from './components/ProgressBar';
import { TextStepInput } from './components/TextStepInput';
import { OptionsStepInput } from './components/OptionsStepInput';
import { FinalCta } from './components/FinalCta';

interface ChatItem {
  text: string;
  me: boolean;
}

export function ApplicationPage() {
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bookingUrl, setBookingUrl] = useState('');
  const [showInputFor, setShowInputFor] = useState(-1);
  const [showFinal, setShowFinal] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => { document.title = 'Aplicação | Diagnóstico Gratuito'; }, []);

  useEffect(() => {
    sb.from('webinar_config').select('booking_url').eq('id', 1).single().then(({ data }) => {
      if (data) setBookingUrl(data.booking_url || '');
    });
    setMessages([{ text: 'Olá! 👋 Você está a 2 minutos do diagnóstico gratuito do seu escritório. São só 9 perguntas rápidas.', me: false }]);
  }, []);

  useEffect(() => {
    const delay = idx === 0 ? 500 : 350;
    const timer = setTimeout(() => {
      if (idx >= steps.length) {
        finish();
      } else {
        setMessages((prev) => [...prev, { text: steps[idx].label, me: false }]);
        setShowInputFor(idx);
      }
    }, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [messages, showFinal]);

  async function finish() {
    setShowInputFor(-1);
    const first = (answersRef.current.name || '').split(' ')[0];
    setMessages((prev) => [...prev, { text: `Perfeito, ${first}! Sua aplicação foi recebida. 🎉`, me: false }]);
    await sb.from('applications').insert(answersRef.current);
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        text: 'Último passo: escolha o melhor horário para o seu diagnóstico gratuito de 20 minutos. É nessa conversa que analisamos as buscas da sua cidade e mostramos exatamente onde o seu escritório está perdendo clientes.',
        me: false,
      }]);
      setShowFinal(true);
    }, 600);
  }

  const handleAnswer = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setMessages((prev) => [...prev, { text: value, me: true }]);
    setShowInputFor(-1);
    setIdx((i) => i + 1);
  };

  const percent = Math.round((idx / steps.length) * 100);
  const activeStep = showInputFor >= 0 ? steps[showInputFor] : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e1a] text-[#f1f5f9]">
      <header className="flex items-center gap-5 px-[22px] py-4">
        <b className="text-[1.15rem] tracking-[1px]">ACEV</b>
        <ProgressBar percent={percent} />
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 overflow-y-auto px-[18px] pb-[180px] pt-5">
        {messages.map((m, i) => <ChatBubble key={i} text={m.text} me={m.me} />)}
        {showFinal && <FinalCta bookingUrl={bookingUrl} />}
      </main>

      {activeStep && (
        <div className="fixed inset-x-0 bottom-0 border-t border-[#1e293b] bg-[#0d1322] p-[18px]">
          {activeStep.type === 'text' ? (
            <TextStepInput
              label={activeStep.label}
              placeholder={activeStep.ph}
              onAnswer={(v) => handleAnswer(activeStep.key, v)}
            />
          ) : (
            <OptionsStepInput
              options={activeStep.opts ?? []}
              onAnswer={(v) => handleAnswer(activeStep.key, v)}
            />
          )}
        </div>
      )}
    </div>
  );
}

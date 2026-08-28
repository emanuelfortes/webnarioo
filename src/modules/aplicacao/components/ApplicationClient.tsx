'use client';

import { useEffect, useRef, useState } from 'react';
import { steps } from '../steps';
import { enviarAplicacao } from '../actions';
import { ChatBubble } from './ChatBubble';
import { ProgressBar } from './ProgressBar';
import { TextStepInput } from './TextStepInput';
import { OptionsStepInput } from './OptionsStepInput';
import { FinalCta } from './FinalCta';

interface Fala {
  text: string;
  me: boolean;
}

const SAUDACAO =
  'Olá! 👋 Você está a 2 minutos do diagnóstico gratuito do seu escritório. São só 9 perguntas rápidas.';

export function ApplicationClient({ bookingUrl }: { bookingUrl: string }) {
  const [falas, setFalas] = useState<Fala[]>([{ text: SAUDACAO, me: false }]);
  const [idx, setIdx] = useState(0);
  const [passoVisivel, setPassoVisivel] = useState(-1);
  const [mostrarFinal, setMostrarFinal] = useState(false);
  const [erro, setErro] = useState('');

  // As respostas precisam estar acessíveis dentro do efeito sem reiniciá-lo.
  const respostasRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const atraso = idx === 0 ? 500 : 350;

    const timer = setTimeout(async () => {
      if (idx < steps.length) {
        setFalas((prev) => [...prev, { text: steps[idx].label, me: false }]);
        setPassoVisivel(idx);
        return;
      }

      // Fim do questionário.
      setPassoVisivel(-1);
      const primeiroNome = (respostasRef.current.name || '').split(' ')[0];
      setFalas((prev) => [
        ...prev,
        { text: `Perfeito, ${primeiroNome}! Sua aplicação foi recebida. 🎉`, me: false },
      ]);

      const resultado = await enviarAplicacao(respostasRef.current);
      if (!resultado.ok) {
        setErro(resultado.erro ?? 'Não conseguimos salvar sua aplicação.');
        return;
      }

      setFalas((prev) => [
        ...prev,
        {
          text: 'Último passo: escolha o melhor horário para o seu diagnóstico gratuito de 20 minutos. É nessa conversa que analisamos as buscas da sua cidade e mostramos exatamente onde o seu escritório está perdendo clientes.',
          me: false,
        },
      ]);
      setMostrarFinal(true);
    }, atraso);

    return () => clearTimeout(timer);
  }, [idx]);

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [falas, mostrarFinal]);

  const responder = (chave: string, valor: string) => {
    respostasRef.current = { ...respostasRef.current, [chave]: valor };
    setFalas((prev) => [...prev, { text: valor, me: true }]);
    setPassoVisivel(-1);
    setIdx((i) => i + 1);
  };

  const percentual = Math.round((idx / steps.length) * 100);
  const passo = passoVisivel >= 0 ? steps[passoVisivel] : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e1a] text-[#f1f5f9]">
      <header className="flex items-center gap-5 px-[22px] py-4">
        <b className="text-[1.15rem] tracking-[1px]">ACEV</b>
        <ProgressBar percent={percentual} />
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 overflow-y-auto px-[18px] pb-[180px] pt-5">
        {falas.map((f, i) => (
          <ChatBubble key={i} text={f.text} me={f.me} />
        ))}

        {erro && (
          <p role="alert" className="mt-4 text-center text-[.9rem] text-[#fca5a5]">
            {erro}
          </p>
        )}

        {mostrarFinal && <FinalCta bookingUrl={bookingUrl} />}
      </main>

      {passo && (
        <div className="fixed inset-x-0 bottom-0 border-t border-[#1e293b] bg-[#0d1322] p-[18px]">
          {passo.type === 'text' ? (
            <TextStepInput
              id={`passo-${passo.key}`}
              label={passo.label}
              placeholder={passo.ph}
              onAnswer={(v) => responder(passo.key, v)}
            />
          ) : (
            <OptionsStepInput
              label={passo.label}
              options={passo.opts ?? []}
              onAnswer={(v) => responder(passo.key, v)}
            />
          )}
        </div>
      )}
    </div>
  );
}

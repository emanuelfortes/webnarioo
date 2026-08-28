'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { WebinarConfig } from '@/core/types';
import { salvarConfig, type EstadoConfig } from '../actions';

const labelClass = 'mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]';
const inputClass = 'w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]';
const cardClass = 'mb-[18px] rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]';

interface CampoProps {
  nome: string;
  label: string;
  padrao: string | number;
  type?: string;
  placeholder?: string;
}

function Campo({ nome, label, padrao, type = 'text', placeholder }: CampoProps) {
  return (
    <div>
      <label htmlFor={`cfg-${nome}`} className={labelClass}>
        {label}
      </label>
      <input
        id={`cfg-${nome}`}
        name={nome}
        type={type}
        defaultValue={padrao}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-[18px] rounded-lg bg-[#16a34a] px-[26px] py-3 font-bold text-white disabled:opacity-60"
    >
      {pending ? 'Salvando…' : '💾 Salvar tudo'}
    </button>
  );
}

export function ConfigTab({ cfg }: { cfg: WebinarConfig }) {
  const [estado, acao] = useActionState<EstadoConfig, FormData>(salvarConfig, {});

  return (
    <form action={acao}>
      <div className={cardClass}>
        <h3>Webinar</h3>
        <Campo nome="title" label="Título" padrao={cfg.title} />
        <Campo
          nome="video_url"
          label="URL do vídeo (MP4 no Cloudflare R2)"
          padrao={cfg.video_url}
          placeholder="https://pub-xxxx.r2.dev/webinar.mp4"
        />
        <div className="grid grid-cols-3 gap-3.5 max-[640px]:grid-cols-1">
          <Campo nome="duration_sec" label="Duração do vídeo (segundos)" padrao={cfg.duration_sec} type="number" />
          <Campo nome="interval_min" label="Sessões a cada (minutos)" padrao={cfg.interval_min} type="number" />
          <Campo nome="offer_show_at_sec" label="Oferta aparece no segundo" padrao={cfg.offer_show_at_sec} type="number" />
        </div>
        <p className="mt-1.5 text-[.8rem] text-[#6b7280]">
          Ex: vídeo de 75 min = 4500 segundos. Oferta no minuto 45 = 2700.
        </p>
      </div>

      <div className={cardClass}>
        <h3>Aba Oferta</h3>
        <Campo nome="offer_title" label="Selo (ex: OFERTA ESPECIAL)" padrao={cfg.offer_title} />
        <Campo nome="offer_headline" label="Headline" padrao={cfg.offer_headline} />
        <Campo nome="offer_text" label="Texto" padrao={cfg.offer_text} />
        <div className="grid grid-cols-[1fr_2fr] gap-3.5 max-[640px]:grid-cols-1">
          <Campo nome="cta_label" label="Texto do botão" padrao={cfg.cta_label} />
          <Campo nome="cta_url" label="Link do botão (página de aplicação)" padrao={cfg.cta_url} />
        </div>
        <Campo
          nome="booking_url"
          label="Link da agenda (Cal.com/Calendly, usado no final da aplicação)"
          padrao={cfg.booking_url}
          placeholder="https://cal.com/seu-usuario/diagnostico"
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h3>Mensagens programadas do apresentador</h3>
        <p className="mt-1.5 text-[.8rem] text-[#6b7280]">
          Lista JSON de {'{'}&quot;at&quot;: segundos, &quot;name&quot;: &quot;quem&quot;,
          &quot;text&quot;: &quot;mensagem&quot;{'}'}. Aparecem no chat quando o vídeo atinge o
          segundo indicado. Quem entra depois desse ponto não recebe a mensagem — ela já passou.
        </p>
        <label htmlFor="cfg-sched" className="sr-only">
          Mensagens programadas em JSON
        </label>
        <textarea
          id="cfg-sched"
          name="scheduled_messages"
          defaultValue={JSON.stringify(cfg.scheduled_messages ?? [], null, 2)}
          className="mt-3.5 min-h-[160px] w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 font-mono text-[.85rem]"
        />

        <div className="flex items-center gap-3">
          <BotaoSalvar />
          {estado.ok && <span className="font-bold text-[#16a34a]">✓ Salvo!</span>}
          {estado.erro && (
            <span role="alert" className="text-[.9rem] font-bold text-[#dc2626]">
              {estado.erro}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

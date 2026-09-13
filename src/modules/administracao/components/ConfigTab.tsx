'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { WebinarConfig } from '@/core/types';
import { salvarConfig, type EstadoConfig } from '../actions';
import { paraMMSS } from '../tempo';
import { MessagesEditor } from './MessagesEditor';
import { ViewersEditor } from './ViewersEditor';
import { VideoUploader } from './VideoUploader';

const labelClass = 'mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]';
const inputClass = 'w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]';
const cardClass = 'mb-[18px] rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]';
const tituloClass = 'text-[1.02rem] font-bold';
const ajudaClass = 'mt-1.5 text-[.8rem] text-[#6b7280]';

interface CampoProps {
  nome: string;
  label: string;
  padrao: string | number;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (v: string) => void;
}

function Campo({ nome, label, padrao, type = 'text', placeholder, value, onChange }: CampoProps) {
  const controlado = value !== undefined;

  return (
    <div>
      <label htmlFor={`cfg-${nome}`} className={labelClass}>
        {label}
      </label>
      <input
        id={`cfg-${nome}`}
        name={nome}
        type={type}
        placeholder={placeholder}
        className={inputClass}
        {...(controlado
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: padrao })}
      />
    </div>
  );
}

function Area({
  nome,
  label,
  padrao,
  ajuda,
  linhas = 3,
}: {
  nome: string;
  label: string;
  padrao: string;
  ajuda?: string;
  linhas?: number;
}) {
  return (
    <div>
      <label htmlFor={`cfg-${nome}`} className={labelClass}>
        {label}
      </label>
      <textarea
        id={`cfg-${nome}`}
        name={nome}
        rows={linhas}
        defaultValue={padrao}
        className={inputClass + ' resize-y leading-relaxed'}
      />
      {ajuda && <p className={ajudaClass}>{ajuda}</p>}
    </div>
  );
}

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#16a34a] px-[26px] py-3 font-bold text-white disabled:opacity-60"
    >
      {pending ? 'Salvando…' : '💾 Salvar tudo'}
    </button>
  );
}

export function ConfigTab({ cfg }: { cfg: WebinarConfig }) {
  const [estado, acao] = useActionState<EstadoConfig, FormData>(salvarConfig, {});

  // A duração é estado porque os dois editores dependem dela: mudar aqui deve
  // atualizar na hora o aviso de "comentário depois do fim do vídeo".
  const [duracao, setDuracao] = useState(String(cfg.duration_sec));
  const duracaoSeg = Number.parseInt(duracao, 10) || 0;

  // A URL do vídeo é estado para o uploader poder preenchê-la — e continua
  // editável à mão, que é como se aponta para o R2 quando o volume crescer.
  const [videoUrl, setVideoUrl] = useState(cfg.video_url);

  return (
    <form action={acao}>
      {/* ---------------------------------------------------------------- */}
      <div className={cardClass}>
        <h3 className={tituloClass}>Webinar</h3>
        <Campo nome="title" label="Título (aparece na landing e acima do vídeo)" padrao={cfg.title} />
        <Campo
          nome="video_url"
          label="URL do vídeo (MP4)"
          padrao={cfg.video_url}
          placeholder="https://pub-xxxx.r2.dev/webinar.mp4"
          value={videoUrl}
          onChange={setVideoUrl}
        />
        <VideoUploader
          onUploaded={({ url, duracaoSeg: d }) => {
            setVideoUrl(url);
            if (d > 0) setDuracao(String(d));
          }}
        />
        <div className="grid grid-cols-3 gap-3.5 max-[640px]:grid-cols-1">
          <Campo
            nome="duration_sec"
            label="Duração do vídeo (segundos)"
            padrao={cfg.duration_sec}
            type="number"
            value={duracao}
            onChange={setDuracao}
          />
          <Campo nome="interval_min" label="Sessões a cada (minutos)" padrao={cfg.interval_min} type="number" />
          <Campo nome="offer_show_at_sec" label="Oferta aparece no segundo" padrao={cfg.offer_show_at_sec} type="number" />
        </div>
        <p className={ajudaClass}>
          {duracaoSeg > 0
            ? `${duracaoSeg} segundos = ${paraMMSS(duracaoSeg)} de vídeo. `
            : ''}
          A duração precisa bater com o arquivo real, senão a sessão encerra antes do fim.
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className={cardClass}>
        <h3 className={tituloClass}>Página de captação</h3>
        <p className={ajudaClass}>
          Todo o texto da landing. O título vem do campo acima, em “Webinar”.
        </p>

        <Area
          nome="landing_subtitle"
          label="Subtítulo (abaixo do título)"
          padrao={cfg.landing_subtitle}
          ajuda="Quebras de linha são preservadas."
        />

        <div className="grid grid-cols-[1fr_2fr] gap-3.5 max-[640px]:grid-cols-1">
          <Campo nome="author_name" label="Nome no bloco de autoridade" padrao={cfg.author_name} />
          <Campo nome="author_bio" label="Descrição no bloco de autoridade" padrao={cfg.author_bio} />
        </div>

        <Campo
          nome="register_cta_label"
          label="Texto do botão de cadastro"
          padrao={cfg.register_cta_label}
        />

        <Area
          nome="consent_text"
          label="Texto do consentimento (LGPD)"
          padrao={cfg.consent_text}
          linhas={2}
          ajuda="O link para a política de privacidade é acrescentado automaticamente ao final — não precisa escrevê-lo, e ele não pode ser removido."
        />

        <Campo nome="footer_text" label="Rodapé (o © e o ano entram sozinhos)" padrao={cfg.footer_text} />
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className={cardClass}>
        <h3 className={tituloClass}>Aba Oferta</h3>
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

      {/* ---------------------------------------------------------------- */}
      <div className={cardClass}>
        <h3 className={tituloClass}>Espectadores ao vivo</h3>
        <p className="mb-3.5 mt-1.5 text-[.8rem] text-[#6b7280]">
          A curva define quantas pessoas o contador mostra ao longo da sessão, interpolando entre os
          pontos. Esse número é <b>somado</b> a quem está realmente conectado, então quem entra de
          verdade continua sendo contado por cima.
        </p>
        <ViewersEditor inicial={cfg.viewers_curve ?? []} durationSec={duracaoSeg} />
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className={cardClass}>
        <h3 className={tituloClass}>Comentários programados</h3>
        <p className="mb-3.5 mt-1.5 text-[.8rem] text-[#6b7280]">
          Cada comentário entra no chat quando o vídeo chega no tempo indicado, carimbado com o
          relógio de quem está assistindo. Quem entra depois daquele ponto não recebe — já passou.
          Deixe <b>Apresentador</b> desmarcado para a fala parecer de um participante comum; marcado,
          ela ganha o destaque laranja de quem está conduzindo.
        </p>
        <MessagesEditor inicial={cfg.scheduled_messages ?? []} durationSec={duracaoSeg} />
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className="sticky bottom-0 flex items-center gap-3 rounded-xl bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,.08)]">
        <BotaoSalvar />
        {estado.ok && <span className="font-bold text-[#16a34a]">✓ Salvo!</span>}
        {estado.erro && (
          <span role="alert" className="text-[.9rem] font-bold text-[#dc2626]">
            {estado.erro}
          </span>
        )}
      </div>
    </form>
  );
}

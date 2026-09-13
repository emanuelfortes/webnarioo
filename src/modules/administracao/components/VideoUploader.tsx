'use client';

import { useState } from 'react';

export interface ResultadoUpload {
  url: string;
  duracaoSeg: number;
  bytes: number;
}

interface VideoUploaderProps {
  onUploaded: (r: ResultadoUpload) => void;
}

/**
 * Tipos mínimos do widget da Cloudinary. A biblioteca é carregada por script
 * externo e não traz tipos, então declaramos só o que usamos.
 */
interface WidgetCloudinary {
  open: () => void;
}

interface RespostaWidget {
  event?: string;
  info?: { secure_url?: string; duration?: number; bytes?: number };
}

interface CloudinaryGlobal {
  createUploadWidget: (
    opcoes: Record<string, unknown>,
    callback: (erro: unknown, resultado?: RespostaWidget) => void,
  ) => WidgetCloudinary;
}

declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }
}

const SCRIPT = 'https://upload-widget.cloudinary.com/global/all.js';

/** Carrega o script uma vez e devolve o objeto global quando estiver pronto. */
function carregarWidget(): Promise<CloudinaryGlobal> {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) return resolve(window.cloudinary);

    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);

    const aoCarregar = () => {
      if (window.cloudinary) resolve(window.cloudinary);
      else reject(new Error('o script da Cloudinary carregou mas não expôs a API'));
    };

    if (existente) {
      existente.addEventListener('load', aoCarregar);
      existente.addEventListener('error', () => reject(new Error('falha ao carregar o script')));
      return;
    }

    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = aoCarregar;
    s.onerror = () => reject(new Error('falha ao carregar o script da Cloudinary'));
    document.head.appendChild(s);
  });
}

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1) + ' MB';

/**
 * Envio do vídeo sem sair do painel.
 *
 * O upload vai direto do navegador para a Cloudinary: não pode passar pelo
 * servidor porque a Vercel limita o corpo de uma requisição a 4,5 MB.
 *
 * O widget devolve a duração do arquivo, que é usada para preencher
 * `duration_sec` — o campo que mais dá problema quando preenchido à mão, porque
 * errar nele faz a sessão encerrar antes de o vídeo acabar.
 */
export function VideoUploader({ onUploaded }: VideoUploaderProps) {
  const [estado, setEstado] = useState<'parado' | 'abrindo' | 'enviando'>('parado');
  const [erro, setErro] = useState('');
  const [concluido, setConcluido] = useState<ResultadoUpload | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    return (
      <div className="mt-2 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] p-3.5 text-[.82rem] text-[#6b7280]">
        <b className="text-[#374151]">Upload pelo painel não está configurado.</b>
        <p className="mt-1">
          Para ligar, cadastre na Vercel as variáveis{' '}
          <code className="rounded bg-[#e5e7eb] px-1">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> e{' '}
          <code className="rounded bg-[#e5e7eb] px-1">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>{' '}
          (tipo <b>Config</b>, não Secret) e refaça o deploy. Enquanto isso, cole a URL do vídeo no
          campo acima.
        </p>
      </div>
    );
  }

  const abrir = async () => {
    setErro('');
    setEstado('abrindo');

    try {
      const cloudinary = await carregarWidget();

      const widget = cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset: preset,
          sources: ['local'],
          resourceType: 'video',
          multiple: false,
          maxFiles: 1,
          language: 'pt',
          text: { pt: { or: 'ou', menu: { files: 'Meus arquivos' } } },
        },
        (erroWidget, resultado) => {
          if (erroWidget) {
            setEstado('parado');
            setErro(
              'O upload falhou. No plano gratuito da Cloudinary há limite de tamanho por vídeo — ' +
                'se o arquivo for grande, use o R2 e cole a URL no campo acima.',
            );
            return;
          }

          if (resultado?.event === 'upload-added') setEstado('enviando');

          if (resultado?.event === 'success' && resultado.info?.secure_url) {
            const r: ResultadoUpload = {
              url: resultado.info.secure_url,
              duracaoSeg: Math.floor(resultado.info.duration ?? 0),
              bytes: resultado.info.bytes ?? 0,
            };
            setConcluido(r);
            setEstado('parado');
            onUploaded(r);
          }

          if (resultado?.event === 'close') setEstado('parado');
        },
      );

      widget.open();
    } catch (e) {
      setEstado('parado');
      setErro((e as Error).message);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => void abrir()}
        disabled={estado !== 'parado'}
        className="rounded-lg bg-[#2563eb] px-4 py-2 text-[.85rem] font-bold text-white disabled:opacity-60"
      >
        {estado === 'parado' && '⬆ Enviar vídeo pelo painel'}
        {estado === 'abrindo' && 'Abrindo…'}
        {estado === 'enviando' && 'Enviando…'}
      </button>

      {concluido && (
        <p className="mt-2 text-[.82rem] text-[#16a34a]">
          ✓ Vídeo enviado — {mb(concluido.bytes)}
          {concluido.duracaoSeg > 0 && (
            <>
              , {Math.floor(concluido.duracaoSeg / 60)}min{concluido.duracaoSeg % 60}s. A duração já
              foi preenchida acima.
            </>
          )}{' '}
          <b>Não esqueça de salvar.</b>
        </p>
      )}

      {erro && (
        <p role="alert" className="mt-2 text-[.82rem] text-[#dc2626]">
          {erro}
        </p>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageRow, Visitor, WebinarConfig } from '@/core/types';
import { useSessionClock } from '../hooks/useSessionClock';
import { usePresence } from '../hooks/usePresence';
import { useEventTracking } from '../hooks/useEventTracking';
import { useChatMessages } from '../hooks/useChatMessages';
import { RoomHeader } from './RoomHeader';
import { VideoPlayer } from './VideoPlayer';
import { WaitingOverlay } from './WaitingOverlay';
import { EndedOverlay } from './EndedOverlay';
import { ChatPanel } from './ChatPanel';
import { OfferPanel } from './OfferPanel';

type Overlay = 'waiting' | 'ended' | 'tocar' | 'som' | null;
type Aba = 'chat' | 'oferta';

interface RoomClientProps {
  sessionAt: number;
  cfg: WebinarConfig;
  eu: Visitor;
  mensagensIniciais: MessageRow[];
}

export function RoomClient({ sessionAt, cfg, eu, mensagensIniciais }: RoomClientProps) {
  const [chaveDePresenca] = useState(
    () => eu.leadId ?? 'anon-' + Math.random().toString(36).slice(2),
  );

  const [gateDoVideo, setGateDoVideo] = useState<'tocar' | 'som' | null>(null);
  const [aba, setAba] = useState<Aba>('chat');
  const [ofertaRevelada, setOfertaRevelada] = useState(false);
  const [pulso, setPulso] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ofertaRef = useRef(false);
  const disparadasRef = useRef<Set<number>>(new Set());
  const esteveAoVivoRef = useRef(false);

  const { phase, elapsedSec } = useSessionClock(sessionAt, cfg.duration_sec);
  const viewers = usePresence(sessionAt, chaveDePresenca, eu.name);
  const { track, trackMarcos } = useEventTracking(sessionAt, eu.leadId !== null);
  const chat = useChatMessages(sessionAt, mensagensIniciais);

  // O overlay tem duas origens: a fase da sessão e o portão de reprodução do
  // vídeo. Só a segunda é estado — a primeira é derivada, para não sincronizar
  // com um efeito aquilo que já dá para calcular na renderização.
  const overlay: Overlay =
    phase === 'waiting' ? 'waiting' : phase === 'ended' ? 'ended' : gateDoVideo;

  // ---------------------------------------------------------------------------
  // M1 da auditoria: o roteiro do apresentador disparava tudo com `at` no
  // passado no primeiro tick, então quem entrava no minuto 40 recebia quinze
  // mensagens de uma vez — justamente o que destrói a ilusão de "ao vivo".
  // Marcar o que já passou ANTES de começar a checar a linha do tempo.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const agora = elapsedSec();
    cfg.scheduled_messages.forEach((m, i) => {
      if (agora >= m.at) disparadasRef.current.add(i);
    });
    // Roda uma vez, na montagem: é o instante de entrada que define o corte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'live') esteveAoVivoRef.current = true;
  }, [phase]);

  // M2 da auditoria: quem abre o link com a sessão encerrada não "entrou na
  // sala" nem "chegou na oferta". Antes, os dois eventos eram gravados assim
  // mesmo e inflavam as duas taxas mais importantes do funil.
  useEffect(() => {
    if (phase === 'ended') return;
    void track('room_enter');
  }, [phase, track]);

  const revelarOferta = useCallback(
    async ({ rastrear, pulsar }: { rastrear: boolean; pulsar: boolean }) => {
      if (ofertaRef.current) return;
      ofertaRef.current = true;
      setOfertaRevelada(true);
      if (pulsar) setPulso(true);
      if (rastrear) await track('offer_view');
    },
    [track],
  );

  const checarLinhaDoTempo = useCallback(
    (t: number) => {
      trackMarcos(t);

      if (!ofertaRef.current && t >= cfg.offer_show_at_sec) {
        void revelarOferta({ rastrear: true, pulsar: true });
      }

      cfg.scheduled_messages.forEach((m, i) => {
        if (t >= m.at && !disparadasRef.current.has(i)) {
          disparadasRef.current.add(i);
          chat.adicionarLocal({
            id: -(Date.now() * 100 + i),
            created_at: new Date().toISOString(),
            session_at: sessionAt,
            lead_id: null,
            name: m.name || 'Apresentador',
            text: m.text,
            is_host: true,
          });
        }
      });
    },
    [cfg, sessionAt, chat, revelarOferta, trackMarcos],
  );

  // Inicia a reprodução sincronizada quando a sessão fica ao vivo.
  useEffect(() => {
    if (phase !== 'live') return;
    const video = videoRef.current;
    if (!video) return;

    if (!video.src) video.src = cfg.video_url;
    video.muted = true;
    video.currentTime = Math.max(0, elapsedSec());

    video
      .play()
      .then(() => setGateDoVideo(video.muted ? 'som' : null))
      .catch(() => setGateDoVideo('tocar'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cfg.video_url]);

  // Encerramento.
  useEffect(() => {
    if (phase !== 'ended') return;
    videoRef.current?.pause();
    void revelarOferta({ rastrear: esteveAoVivoRef.current, pulsar: false });
  }, [phase, revelarOferta]);

  // Trava de sincronia e linha do tempo.
  useEffect(() => {
    if (phase !== 'live') return;
    const iv = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || overlay) return;

      const esperado = elapsedSec();
      if (Math.abs(video.currentTime - esperado) > 4) video.currentTime = esperado;
      checarLinhaDoTempo(esperado);
    }, 3000);

    return () => clearInterval(iv);
  }, [phase, overlay, elapsedSec, checarLinhaDoTempo]);

  // Retoma sincronizado se o vídeo pausar sozinho (aba em segundo plano).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const aoPausar = () => {
      if (elapsedSec() < cfg.duration_sec && !overlay) {
        setTimeout(() => {
          video.currentTime = Math.max(0, elapsedSec());
          video.play().catch(() => {});
        }, 800);
      }
    };

    video.addEventListener('pause', aoPausar);
    return () => video.removeEventListener('pause', aoPausar);
  }, [cfg.duration_sec, overlay, elapsedSec]);

  const clicarOverlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (overlay === 'som') {
      video.muted = false;
      setGateDoVideo(null);
    } else if (overlay === 'tocar') {
      video.muted = false;
      video.currentTime = Math.max(0, elapsedSec());
      void video.play();
      setGateDoVideo(null);
    }
  };

  /** A2 da auditoria: o clique na oferta nunca era registrado. */
  const registrarCliqueNaOferta = useCallback(() => track('offer_click'), [track]);

  let conteudoOverlay = null;
  if (overlay === 'waiting') {
    conteudoOverlay = <WaitingOverlay targetMs={sessionAt} />;
  } else if (overlay === 'ended') {
    conteudoOverlay = (
      <EndedOverlay
        ctaLabel={cfg.cta_label}
        ctaUrl={cfg.cta_url}
        onCtaClick={registrarCliqueNaOferta}
      />
    );
  } else if (overlay === 'som') {
    conteudoOverlay = <div className="text-[1.6rem] font-extrabold">🔊 Toque para ativar o som</div>;
  } else if (overlay === 'tocar') {
    conteudoOverlay = (
      <>
        <div className="mb-2.5 text-[1.6rem] font-extrabold">A sessão já está acontecendo</div>
        <button className="rounded-[10px] border-0 bg-[#dc2626] px-7 py-3.5 text-[1.05rem] font-bold text-white">
          ▶ ENTRAR NA TRANSMISSÃO
        </button>
      </>
    );
  }

  const abaClasse = (ativa: boolean, pulsando = false) =>
    `flex-1 cursor-pointer border-b-[3px] bg-white py-3.5 text-center text-[.92rem] font-semibold ${
      ativa ? 'border-[#111] text-[#111827]' : 'border-transparent text-[#6b7280]'
    } ${pulsando ? 'animate-tabPulse' : ''}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      <RoomHeader title={cfg.title} viewers={viewers} live={phase === 'live'} />

      <main className="flex min-h-0 flex-1 max-[860px]:flex-col max-[860px]:overflow-y-auto">
        <VideoPlayer
          videoRef={videoRef}
          overlay={conteudoOverlay}
          onOverlayClick={clicarOverlay}
          clickable={overlay === 'som' || overlay === 'tocar'}
        />

        <aside className="flex w-[380px] flex-shrink-0 flex-col bg-white max-[860px]:w-full max-[860px]:flex-1">
          {/* M11 da auditoria: eram divs com onClick, sem foco nem semântica. */}
          <div role="tablist" aria-label="Chat e oferta" className="flex flex-shrink-0 border-b border-[#e5e7eb]">
            <button
              role="tab"
              aria-selected={aba === 'chat'}
              onClick={() => setAba('chat')}
              className={abaClasse(aba === 'chat')}
            >
              Chat
            </button>
            <button
              role="tab"
              aria-selected={aba === 'oferta'}
              onClick={() => {
                setAba('oferta');
                setPulso(false);
              }}
              className={abaClasse(aba === 'oferta', pulso)}
            >
              🎁 Oferta
            </button>
          </div>

          {aba === 'chat' ? (
            <ChatPanel messages={chat.messages} onSend={(t) => void chat.enviar(t)} />
          ) : (
            <OfferPanel
              revealed={ofertaRevelada}
              offerTitle={cfg.offer_title}
              offerHeadline={cfg.offer_headline}
              offerText={cfg.offer_text}
              ctaLabel={cfg.cta_label}
              ctaUrl={cfg.cta_url}
              onCtaClick={registrarCliqueNaOferta}
            />
          )}
        </aside>
      </main>
    </div>
  );
}

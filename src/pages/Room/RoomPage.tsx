import { useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { sb } from '../../lib/supabase';
import type { WebinarConfig } from '../../lib/types';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useSessionClock } from './hooks/useSessionClock';
import { usePresence } from './hooks/usePresence';
import { useEventTracking } from './hooks/useEventTracking';
import { RoomHeader } from './components/RoomHeader';
import { VideoPlayer } from './components/VideoPlayer';
import { WaitingOverlay } from './components/WaitingOverlay';
import { EndedOverlay } from './components/EndedOverlay';
import { ChatPanel } from './components/ChatPanel';
import { OfferPanel } from './components/OfferPanel';

type OverlayMode = 'waiting' | 'ended' | 'tap-enter' | 'tap-unmute' | null;
type ActiveTab = 'chat' | 'offer';

export function RoomPage() {
  const [params] = useSearchParams();
  const sessionAt = parseInt(params.get('s') || '0', 10);

  const [myName] = useState(() => localStorage.getItem('wb_name') || 'Visitante');
  const [myLead] = useState(() => localStorage.getItem('wb_lead') || crypto.randomUUID());

  const [cfg, setCfg] = useState<WebinarConfig | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [offerRevealed, setOfferRevealed] = useState(false);
  const [offerPulse, setOfferPulse] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const offerRevealedRef = useRef(false);
  const firedMsgsRef = useRef<Set<number>>(new Set());

  const { phase, elapsedSec } = useSessionClock(sessionAt, cfg?.duration_sec);
  const viewers = usePresence(sessionAt || null, myLead, myName);
  const { track, trackMilestones } = useEventTracking(sessionAt || null, myLead);
  const chat = useChatMessages(sessionAt || null, {
    skipEcho: (m) => m.name === myName && !m.is_host,
  });

  useEffect(() => {
    setOverlayMode(phase === 'waiting' ? 'waiting' : phase === 'ended' ? 'ended' : null);
  }, [phase]);

  useEffect(() => {
    if (!sessionAt) return;
    sb.from('webinar_config').select('*').eq('id', 1).single().then(({ data }) => {
      if (!data) return;
      setCfg(data);
      document.title = data.title;
      track('room_enter');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionAt]);

  const revealOffer = (pulse: boolean) => {
    if (offerRevealedRef.current) return;
    offerRevealedRef.current = true;
    setOfferRevealed(true);
    track('offer_view');
    if (pulse) setOfferPulse(true);
  };

  const checkTimeline = (t: number) => {
    if (!cfg) return;
    trackMilestones(t);
    if (!offerRevealedRef.current && t >= cfg.offer_show_at_sec) revealOffer(true);
    cfg.scheduled_messages.forEach((m, i) => {
      if (t >= m.at && !firedMsgsRef.current.has(i)) {
        firedMsgsRef.current.add(i);
        chat.addMessage({
          id: -(Date.now() * 100 + i),
          created_at: new Date().toISOString(),
          session_at: sessionAt,
          name: m.name || 'Apresentador',
          text: m.text,
          is_host: true,
        });
      }
    });
  };

  // Inicia/retoma a reprodução sincronizada quando a sessão fica ao vivo
  useEffect(() => {
    if (phase !== 'live' || !cfg) return;
    const video = videoRef.current;
    if (!video) return;
    if (!video.src) video.src = cfg.video_url;
    video.muted = true;
    video.currentTime = Math.max(0, elapsedSec());
    video.play().then(() => {
      setOverlayMode(video.muted ? 'tap-unmute' : null);
    }).catch(() => {
      setOverlayMode('tap-enter');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cfg]);

  // Encerramento
  useEffect(() => {
    if (phase !== 'ended') return;
    videoRef.current?.pause();
    revealOffer(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Trava de sincronia + linha do tempo (oferta + mensagens programadas)
  useEffect(() => {
    if (phase !== 'live') return;
    const iv = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || overlayMode) return;
      const expected = elapsedSec();
      if (Math.abs(video.currentTime - expected) > 4) video.currentTime = expected;
      checkTimeline(expected);
    }, 3000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, overlayMode, elapsedSec, cfg]);

  // Retoma sincronizado se o vídeo pausar sozinho (ex: aba em 2º plano)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !cfg) return;
    const onPause = () => {
      if (elapsedSec() < cfg.duration_sec && !overlayMode) {
        setTimeout(() => {
          video.currentTime = Math.max(0, elapsedSec());
          video.play().catch(() => {});
        }, 800);
      }
    };
    video.addEventListener('pause', onPause);
    return () => video.removeEventListener('pause', onPause);
  }, [cfg, overlayMode, elapsedSec]);

  if (!sessionAt || isNaN(sessionAt)) return <Navigate to="/" replace />;

  const handleSend = (text: string) => {
    chat.addMessage({
      id: -(Date.now() * 100 + 1),
      created_at: new Date().toISOString(),
      session_at: sessionAt,
      name: myName,
      text,
      is_host: false,
    });
    chat.sendMessage({ name: myName, text });
  };

  const handleOverlayClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (overlayMode === 'tap-unmute') {
      video.muted = false;
      setOverlayMode(null);
    } else if (overlayMode === 'tap-enter') {
      video.muted = false;
      video.currentTime = Math.max(0, elapsedSec());
      video.play();
      setOverlayMode(null);
    }
  };

  let overlayContent = null;
  if (overlayMode === 'waiting') overlayContent = <WaitingOverlay targetMs={sessionAt} />;
  else if (overlayMode === 'ended' && cfg) overlayContent = <EndedOverlay ctaLabel={cfg.cta_label} ctaUrl={cfg.cta_url} />;
  else if (overlayMode === 'tap-unmute') overlayContent = <div className="text-[1.6rem] font-extrabold">🔊 Toque para ativar o som</div>;
  else if (overlayMode === 'tap-enter') {
    overlayContent = (
      <>
        <div className="mb-2.5 text-[1.6rem] font-extrabold">A sessão já está acontecendo</div>
        <button className="rounded-[10px] border-0 bg-[#dc2626] px-7 py-3.5 text-[1.05rem] font-bold text-white">▶ ENTRAR NA TRANSMISSÃO</button>
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      <RoomHeader title={cfg?.title ?? 'Carregando…'} viewers={viewers} />
      <main className="flex min-h-0 flex-1 max-[860px]:flex-col max-[860px]:overflow-y-auto">
        <VideoPlayer
          videoRef={videoRef}
          overlay={overlayContent}
          onOverlayClick={handleOverlayClick}
          clickable={overlayMode !== 'ended'}
        />
        <aside className="flex w-[380px] flex-shrink-0 flex-col bg-white max-[860px]:w-full max-[860px]:flex-1">
          <div className="flex flex-shrink-0 border-b border-[#e5e7eb]">
            <div
              onClick={() => setActiveTab('chat')}
              className={`flex-1 cursor-pointer border-b-[3px] bg-white py-3.5 text-center text-[.92rem] font-semibold ${activeTab === 'chat' ? 'border-[#111] text-[#111827]' : 'border-transparent text-[#6b7280]'}`}
            >
              Chat
            </div>
            <div
              onClick={() => { setActiveTab('offer'); setOfferPulse(false); }}
              className={`flex-1 cursor-pointer border-b-[3px] bg-white py-3.5 text-center text-[.92rem] font-semibold ${activeTab === 'offer' ? 'border-[#111] text-[#111827]' : 'border-transparent text-[#6b7280]'} ${offerPulse ? 'animate-tabPulse' : ''}`}
            >
              🎁 Oferta
            </div>
          </div>
          {activeTab === 'chat' ? (
            <ChatPanel messages={chat.messages} onSend={handleSend} />
          ) : (
            <OfferPanel
              revealed={offerRevealed}
              offerTitle={cfg?.offer_title ?? ''}
              offerHeadline={cfg?.offer_headline ?? ''}
              offerText={cfg?.offer_text ?? ''}
              ctaLabel={cfg?.cta_label ?? ''}
              ctaUrl={cfg?.cta_url ?? '#'}
            />
          )}
        </aside>
      </main>
    </div>
  );
}

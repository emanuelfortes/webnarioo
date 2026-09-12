'use client';

import type { ReactNode, RefObject } from 'react';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  title: string;
  overlay: ReactNode | null;
  onOverlayClick?: () => void;
  clickable?: boolean;
}

export function VideoPlayer({
  videoRef,
  title,
  overlay,
  onOverlayClick,
  clickable = true,
}: VideoPlayerProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-black">
      {title && (
        <h1 className="flex-shrink-0 border-b border-[#1f2937] px-4 py-3 text-center text-[1.05rem] font-bold leading-snug text-white max-[860px]:text-[.95rem]">
          {title}
        </h1>
      )}

      {/* O overlay cobre só o vídeo: o título continua legível durante a
          contagem regressiva e depois do encerramento. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          preload="auto"
          className="h-full w-full bg-black object-contain"
        />
        {overlay && (
          <div
            onClick={clickable ? onOverlayClick : undefined}
            className={`absolute inset-0 z-[5] flex flex-col items-center justify-center bg-black/[.82] p-5 text-center text-white ${
              clickable ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            {overlay}
          </div>
        )}
      </div>
    </div>
  );
}

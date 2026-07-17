import type { ReactNode, RefObject } from 'react';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  overlay: ReactNode | null;
  onOverlayClick?: () => void;
  clickable?: boolean;
}

export function VideoPlayer({ videoRef, overlay, onOverlayClick, clickable = true }: VideoPlayerProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-black">
      <video ref={videoRef} playsInline preload="auto" className="h-full w-full bg-black object-contain" />
      {overlay && (
        <div
          onClick={onOverlayClick}
          className={`absolute inset-0 z-[5] flex flex-col items-center justify-center bg-black/[.82] p-5 text-center text-white ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {overlay}
        </div>
      )}
    </div>
  );
}

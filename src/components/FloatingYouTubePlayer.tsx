import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Play, Pause, ExternalLink, Move, Tv } from 'lucide-react';
import { YouTubeCardData } from '../types';

interface FloatingYouTubePlayerProps {
  video: YouTubeCardData | null;
  onClose: () => void;
}

export const FloatingYouTubePlayer: React.FC<FloatingYouTubePlayerProps> = ({ video, onClose }) => {
  if (!video) return null;

  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [position, setPosition] = useState({ x: 40, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 40,
    posY: 100,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Position defaults nicely on desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 440);
      const defaultY = Math.max(80, window.innerHeight - 340);
      setPosition({ x: defaultX, y: defaultY });
      dragStartRef.current.posX = defaultX;
      dragStartRef.current.posY = defaultY;
    }
  }, [video.videoId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const dx = clientX - dragStartRef.current.startX;
      const dy = clientY - dragStartRef.current.startY;
      const newX = Math.max(8, Math.min(window.innerWidth - 160, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const togglePlayPause = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    // Send postMessage to YouTube iframe API
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = next ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: action, args: '' }),
        '*'
      );
    }
  };

  // Dimensions based on state (responsive on smartphone/tablet/desktop)
  const widthClass = isMinimized
    ? 'w-64 max-w-[calc(100vw-24px)]'
    : isExpanded
    ? 'w-[92vw] max-w-2xl'
    : 'w-[90vw] sm:w-[380px] md:w-[420px] max-w-[calc(100vw-20px)]';

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-50 transition-shadow select-none shadow-2xl rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900/95 backdrop-blur-xl text-slate-100 ${widthClass}`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="cursor-move bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-700/60"
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <div className="p-1 rounded bg-red-600/20 text-red-400">
            <Tv className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold truncate text-slate-200">
            {video.title}
          </span>
          <Move className="w-3.5 h-3.5 text-slate-400 opacity-60 flex-shrink-0" />
        </div>

        {/* Window controls: Réduire / Agrandir / Play/Pause / Fermer */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={togglePlayPause}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMinimized(!isMinimized);
              if (isExpanded) setIsExpanded(false);
            }}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMinimized ? 'Restaurer' : 'Réduire'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          {!isMinimized && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isExpanded ? 'Taille normale' : 'Agrandir'}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      {!isMinimized && (
        <div>
          <div className="relative aspect-video bg-black">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&autoplay=1&origin=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.origin : ''
              )}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Info Footer */}
          <div className="px-3.5 py-2.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-medium text-emerald-400 block truncate">
                {video.channelName}
              </span>
              <span className="text-slate-400 text-[11px]">
                {video.viewsText}
              </span>
            </div>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-md"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Compact Mini Bar when minimized */}
      {isMinimized && (
        <div className="p-2.5 flex items-center justify-between text-xs bg-slate-950/90">
          <div className="flex items-center gap-2 truncate">
            <img
              src={video.thumbnailUrl}
              alt=""
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
            <div className="truncate">
              <p className="font-semibold truncate text-slate-200">{video.title}</p>
              <p className="text-[10px] text-emerald-400">{video.channelName}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded bg-emerald-500/10 ml-2"
          >
            Agrandir
          </button>
        </div>
      )}
    </div>
  );
};

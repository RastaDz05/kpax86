import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Radio,
  SkipBack,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Headphones,
  Sparkles,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { RadioStation } from '../types';

interface RadioPlayerBarProps {
  radios: RadioStation[];
  activeRadio: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSelectRadio: (radio: RadioStation) => void;
  onNextRadio: () => void;
  onPrevRadio: () => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onOpenModal: () => void;
  connectedChatListenersCount?: number;
  accentColor?: string;
}

export const RadioPlayerBar: React.FC<RadioPlayerBarProps> = ({
  radios,
  activeRadio,
  isPlaying,
  isLoading,
  hasError,
  volume,
  isMuted,
  onTogglePlay,
  onSelectRadio,
  onNextRadio,
  onPrevRadio,
  onVolumeChange,
  onToggleMute,
  onOpenModal,
  connectedChatListenersCount = 0,
  accentColor = '#10b981',
}) => {
  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  if (!activeRadio) return null;

  // Total listeners: base live listeners + chat listeners
  const totalListeners = activeRadio.listenersCount + (connectedChatListenersCount || 0);

  // Volume icon logic
  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4 text-red-400" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-4 h-4 text-emerald-400" />;
    }
    return <Volume2 className="w-4 h-4 text-emerald-400" />;
  };

  const volumePercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className="relative z-20 border-b border-emerald-500/20 bg-slate-900/95 backdrop-blur-md transition-all shadow-md">
      {/* Compact / Minimized Bar */}
      {isCompact ? (
        <div className="px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              {isPlaying && (
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: isPlaying ? accentColor : '#64748b' }}
              />
            </span>
            <span className="font-extrabold text-white truncate">{activeRadio.name}</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
              <Headphones className="w-3 h-3" />
              {totalListeners.toLocaleString('fr-FR')} auditeurs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-1 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-transform active:scale-90"
              title={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => setIsCompact(false)}
              className="text-slate-400 hover:text-white p-1"
              title="Agrandir le lecteur"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Persistent Player Bar */
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Station Identity, Live badge, Listeners count */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
            {/* Station Logo & Equalizer */}
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-xl bg-slate-800/90 border flex items-center justify-center text-xl shadow-inner transition-transform"
                style={{ borderColor: isPlaying ? `${accentColor}80` : '#334155' }}
              >
                {activeRadio.logo}
              </div>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-3 w-3"
                    style={{ backgroundColor: accentColor }}
                  />
                </span>
              )}
            </div>

            {/* Station details */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Station Name */}
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate tracking-tight font-[Cabinet_Grotesk]">
                  {activeRadio.name}
                </h3>

                {/* Algerian / Diaspora tag */}
                {activeRadio.isAlgerianTheme && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🇩🇿 Diaspora DZ
                  </span>
                )}

                {/* Live stream badge */}
                <span className="text-[10px] bg-red-600/90 text-white font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              </div>

              {/* Station Tagline & Real-time Listeners Count */}
              <div className="flex items-center gap-2 text-xs text-slate-300 truncate mt-0.5">
                <span className="text-slate-400 hidden md:inline truncate max-w-[240px]">
                  {activeRadio.tagline}
                </span>

                <span className="hidden md:inline text-slate-600">•</span>

                {/* Prominently displayed listener count */}
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs"
                  title={`${activeRadio.listenersCount.toLocaleString('fr-FR')} auditeurs de la radio + ${connectedChatListenersCount} membres connectés au tchat`}
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    <strong className="text-white font-black">{totalListeners.toLocaleString('fr-FR')}</strong> auditeurs
                  </span>
                  {connectedChatListenersCount > 0 && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1 rounded hidden sm:inline">
                      +{connectedChatListenersCount} tchat
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Audio Playback Controls (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Previous Station Button */}
            <button
              onClick={onPrevRadio}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
              title="Radio précédente"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Main Play / Pause Button with equalizer when playing */}
            <button
              onClick={onTogglePlay}
              className="relative px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all transform active:scale-95 text-xs sm:text-sm"
              title={isPlaying ? 'Mettre en pause' : 'Écouter en direct'}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span className="font-extrabold hidden xs:inline">Pause</span>
                  {/* Equalizer Wave in button */}
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-0.5 bg-slate-950 rounded animate-eq-1 h-3 inline-block" />
                    <span className="w-0.5 bg-slate-950 rounded animate-eq-2 h-2 inline-block" />
                    <span className="w-0.5 bg-slate-950 rounded animate-eq-3 h-3.5 inline-block" />
                  </div>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span className="font-extrabold hidden xs:inline">Écouter</span>
                </>
              )}
            </button>

            {/* Next Station Button */}
            <button
              onClick={onNextRadio}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
              title="Radio suivante"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Volume Controls + Station Selector Dropdown + Modal Opener */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Volume Control Box */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-inner">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-1 text-slate-300 hover:text-white transition-colors"
                title={isMuted ? 'Activer le son' : 'Couper le son (Mute)'}
              >
                {renderVolumeIcon()}
              </button>

              {/* Volume Slider */}
              <div className="relative flex items-center group">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                  title={`Volume : ${volumePercent}%`}
                />
              </div>

              {/* Volume percentage */}
              <span className="text-[11px] font-mono font-bold text-slate-300 w-8 text-right select-none">
                {volumePercent}%
              </span>
            </div>

            {/* Quick Switch Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
                title="Changer rapidement de station"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Changer</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Station Quick Selector Dropdown Menu */}
              {isStationDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-fade-in backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs font-extrabold text-slate-300 flex items-center justify-between">
                    <span>Sélection Rapide Webradios</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{radios.length} radios</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                    {radios.map((radio) => {
                      const isCurrent = radio.id === activeRadio.id;
                      return (
                        <button
                          key={radio.id}
                          onClick={() => {
                            onSelectRadio(radio);
                            setIsStationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{radio.logo}</span>
                            <div className="truncate">
                              <span className="block text-xs font-semibold truncate leading-tight">
                                {radio.name}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                {radio.location}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold flex-shrink-0">
                            🎧 {radio.listenersCount.toLocaleString('fr-FR')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsStationDropdownOpen(false);
                        onOpenModal();
                      }}
                      className="w-full text-center py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold transition-colors"
                    >
                      Ouvrir le studio webradios complet
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* "Toutes les radios" Modal button */}
            <button
              onClick={onOpenModal}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
              title="Voir toutes les webradios"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Studio Radios</span>
            </button>

            {/* Minimize / Fold button */}
            <button
              onClick={() => setIsCompact(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Réduire le lecteur de radio"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error notification banner if stream fails */}
      {hasError && (
        <div className="px-4 py-1.5 bg-red-950/80 border-t border-red-500/40 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Flux radio temporairement inaccessible ou restreint par le navigateur.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="font-bold underline text-red-300 hover:text-white"
            >
              Réessayer
            </button>
            <button
              onClick={onNextRadio}
              className="px-2 py-0.5 rounded bg-red-800 hover:bg-red-700 text-white font-semibold text-[11px]"
            >
              Passer à la radio suivante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

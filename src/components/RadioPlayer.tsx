import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Radio,
  X,
  Headphones,
  Sparkles,
  Search,
  ExternalLink,
  Sliders,
  Check,
  Flame,
} from 'lucide-react';
import { RadioStation } from '../types';

interface RadioPlayerProps {
  radios: RadioStation[];
  activeRadio: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  isMuted: boolean;
  onSelectRadio: (radio: RadioStation) => void;
  onTogglePlay: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  isOpen: boolean;
  onClose: () => void;
  connectedChatListenersCount?: number;
  accentColor?: string;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  radios,
  activeRadio,
  isPlaying,
  isLoading,
  hasError,
  volume,
  isMuted,
  onSelectRadio,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  isOpen,
  onClose,
  connectedChatListenersCount = 0,
  accentColor = '#10b981',
}) => {
  const [activeTab, setActiveTab] = useState<'algerie' | 'all' | 'rap'>('algerie');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stations based on tab and search
  const filteredRadios = radios.filter((radio) => {
    const matchesSearch =
      radio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      radio.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      radio.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      radio.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'algerie') {
      return radio.isAlgerianTheme || radio.countryCode === 'DZ';
    }
    if (activeTab === 'rap') {
      return (
        radio.genre.toLowerCase().includes('rap') ||
        radio.genre.toLowerCase().includes('urbain') ||
        radio.name.toLowerCase().includes('rap') ||
        radio.name.toLowerCase().includes('skyrock') ||
        radio.name.toLowerCase().includes('générations')
      );
    }
    return true;
  });

  const volumePercent = isMuted ? 0 : Math.round(volume * 100);

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-5 h-5 text-red-400" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-5 h-5 text-emerald-400" />;
    }
    return <Volume2 className="w-5 h-5 text-emerald-400" />;
  };

  // If not open, don't render modal markup (the audio element is maintained in App.tsx or parent)
  if (!isOpen) return null;

  const totalCurrentListeners =
    (activeRadio?.listenersCount || 0) + (connectedChatListenersCount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
              <Radio className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2 font-[Cabinet_Grotesk]">
                  Webradios Algérie & Diaspora
                </h3>
                <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Direct
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Écoutez les radios de la diaspora et d'Algérie en direct pendant le tchat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Playing Hero Card with Play/Pause and Volume Controls */}
        {activeRadio && (
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-950/90 to-slate-900/90 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Station Info */}
              <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-lg">
                  {activeRadio.logo}
                  {isPlaying && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-100 text-base sm:text-lg truncate">
                      {activeRadio.name}
                    </span>
                    {activeRadio.isAlgerianTheme && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🇩🇿 Algérie & Diaspora
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {activeRadio.tagline}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {/* Real-time Listeners Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{totalCurrentListeners.toLocaleString('fr-FR')} auditeurs en direct</span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {activeRadio.location} • {activeRadio.bitrate || '128 kbps'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls: Big Play/Pause & Volume Slider */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Play / Pause Toggle Button */}
                <button
                  onClick={onTogglePlay}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all transform active:scale-95 text-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pause</span>
                      <div className="flex items-end gap-0.5 h-3 ml-1">
                        <span className="w-0.5 bg-slate-950 rounded animate-eq-1 h-3 inline-block" />
                        <span className="w-0.5 bg-slate-950 rounded animate-eq-2 h-2 inline-block" />
                        <span className="w-0.5 bg-slate-950 rounded animate-eq-3 h-3.5 inline-block" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                      <span>Lancer le direct</span>
                    </>
                  )}
                </button>

                {/* Volume Slider & Mute inside active station banner */}
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-2 rounded-2xl">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="p-1 hover:text-white transition-colors"
                    title={isMuted ? 'Activer le son' : 'Couper le son'}
                  >
                    {renderVolumeIcon()}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    title={`Volume : ${volumePercent}%`}
                  />
                  <span className="text-xs font-mono font-bold text-slate-300 w-8 text-right">
                    {volumePercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs & Search Filter */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('algerie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'algerie'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🇩🇿 Algérie & Diaspora</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/30 text-current">
                4
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Toutes ({radios.length})
            </button>

            <button
              onClick={() => setActiveTab('rap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rap'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Rap & Hits
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une radio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Stations List with Each Station's Controls */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {filteredRadios.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Aucune radio trouvée pour cette recherche.
            </div>
          ) : (
            filteredRadios.map((radio) => {
              const isSelected = activeRadio?.id === radio.id;
              const isThisPlaying = isSelected && isPlaying;
              const listeners =
                radio.listenersCount + (isSelected ? connectedChatListenersCount : 0);

              return (
                <div
                  key={radio.id}
                  className={`group p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/40'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  {/* Left: Station details */}
                  <div
                    className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                    onClick={() => onSelectRadio(radio)}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-105 shadow-inner border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/40'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {radio.logo}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-100 text-sm truncate">
                          {radio.name}
                        </h4>

                        {radio.isAlgerianTheme && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🇩🇿 DZ
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {radio.location}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {radio.tagline}
                      </p>

                      {/* Station Specific Listener Count */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <Headphones className="w-3 h-3" />
                          {listeners.toLocaleString('fr-FR')} auditeurs
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400">
                          {radio.genre}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Individual Play / Pause & Status Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSelected ? (
                      <div className="flex items-center gap-2">
                        {/* Play / Pause toggle for this active radio */}
                        <button
                          onClick={onTogglePlay}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
                          title={isPlaying ? 'Pause' : 'Reprendre la lecture'}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <div className="flex items-end gap-0.5 h-2.5">
                                <span className="w-0.5 bg-slate-950 rounded animate-eq-1 h-2 inline-block" />
                                <span className="w-0.5 bg-slate-950 rounded animate-eq-2 h-1 inline-block" />
                                <span className="w-0.5 bg-slate-950 rounded animate-eq-3 h-2.5 inline-block" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              <span>En pause</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* Click to select and play this station directly */
                      <button
                        type="button"
                        onClick={() => onSelectRadio(radio)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-emerald-500 transition-all text-xs font-bold flex items-center gap-1.5 active:scale-95 group/btn"
                        title={`Écouter ${radio.name}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5 group-hover/btn:scale-110 transition-transform" />
                        <span>Écouter</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Volume Summary & Close Button */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-400 text-xs flex-1">
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1.5 hover:text-white rounded-lg transition-colors"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {renderVolumeIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full max-w-xs accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-slate-300 font-bold min-w-8">
              {volumePercent}%
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95"
          >
            Continuer le tchat
          </button>
        </div>
      </div>
    </div>
  );
};

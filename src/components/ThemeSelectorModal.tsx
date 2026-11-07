import React from 'react';
import {
  X,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Eye,
  Check,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { LIGHT_WALLPAPERS, DARK_WALLPAPERS, WallpaperTheme } from '../data/wallpapers';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  currentLightId: string;
  currentDarkId: string;
  onSelectLightWallpaper: (id: string) => void;
  onSelectDarkWallpaper: (id: string) => void;
  onZapWallpaper: () => void;
  overlayOpacity: number;
  onChangeOverlayOpacity: (opacity: number) => void;
  backdropBlur: number;
  onChangeBackdropBlur: (blur: number) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onToggleTheme,
  currentLightId,
  currentDarkId,
  onSelectLightWallpaper,
  onSelectDarkWallpaper,
  onZapWallpaper,
  overlayOpacity,
  onChangeOverlayOpacity,
  backdropBlur,
  onChangeBackdropBlur,
}) => {
  if (!isOpen) return null;

  const activeWallpapers = isDarkTheme ? DARK_WALLPAPERS : LIGHT_WALLPAPERS;
  const currentActiveId = isDarkTheme ? currentDarkId : currentLightId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ImageIcon className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Fonds & Thèmes Visuels Algerie.cool
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-semibold">
                  Haute Définition
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personnalisez le décor en mode clair ou nocturne tout en garantissant une lisibilité optimale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Quick Zap Bar & Mode Switcher */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  isDarkTheme
                    ? 'bg-slate-800 border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                }`}
              >
                {isDarkTheme ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{isDarkTheme ? 'Mode Nocturne Actif' : 'Mode Clair Actif'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onZapWallpaper}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold transition-transform hover:scale-105 active:scale-95 shadow-md"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Zapper de fond maintenant ⚡</span>
            </button>
          </div>

          {/* Mode Clair Wallpapers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Thèmes Mode Clair (Plage / Sahara / Alger)
              </label>
              {!isDarkTheme && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Mode actuellement affiché
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LIGHT_WALLPAPERS.map((wp) => {
                const isSelected = currentLightId === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => onSelectLightWallpaper(wp.id)}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="aspect-[16/10] w-full bg-slate-950 relative overflow-hidden">
                      <img
                        src={wp.imageUrl}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <span className="absolute top-2 left-2 text-sm bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {wp.icon}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 bg-slate-900 border-t border-slate-800">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-slate-100 text-xs truncate">
                          {wp.name}
                        </h4>
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
                          style={{ backgroundColor: wp.accentColor }}
                          title={`Couleur IA : ${wp.paletteName}`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {wp.subtitle}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60 truncate">
                          ✨ IA : {wp.paletteName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mode Nocturne Wallpapers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-400" />
                Thèmes Mode Nocturne (Tour Eiffel / Galaxie Lune / Alger la Nuit)
              </label>
              {isDarkTheme && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Mode actuellement affiché
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DARK_WALLPAPERS.map((wp) => {
                const isSelected = currentDarkId === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => onSelectDarkWallpaper(wp.id)}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-600 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="aspect-[16/10] w-full bg-slate-950 relative overflow-hidden">
                      <img
                        src={wp.imageUrl}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <span className="absolute top-2 left-2 text-sm bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {wp.icon}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 bg-slate-900 border-t border-slate-800">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-slate-100 text-xs truncate">
                          {wp.name}
                        </h4>
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
                          style={{ backgroundColor: wp.accentColor }}
                          title={`Couleur IA : ${wp.paletteName}`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {wp.subtitle}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60 truncate">
                          ✨ IA : {wp.paletteName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anti-Sabotage Legibility Controls */}
          <div className="p-4 bg-slate-950/90 rounded-xl border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sliders className="w-4 h-4" />
              <span>Ajustement de la lisibilité & transparence (Anti-sabotage du texte)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Réglez l'intensité du voile de protection pour garantir un confort de lecture parfait pour les messages et pseudos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Opacity slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>Voile protecteur de contraste :</span>
                  <span className="font-bold text-emerald-400">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.95"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => onChangeOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Image plus vive</span>
                  <span>Texte ultra-lisible</span>
                </div>
              </div>

              {/* Blur slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                  <span>Flou d'arrière-plan (Bokeh) :</span>
                  <span className="font-bold text-emerald-400">{backdropBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={backdropBlur}
                  onChange={(e) => onChangeBackdropBlur(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Net</span>
                  <span>Effet velouté doux</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Vos préférences de fond sont sauvegardées automatiquement.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-colors"
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Radio,
  Hash,
  Users,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Crown,
  Star,
  CheckCircle2,
  Menu,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { RadioStation, Room, UserProfile } from '../types';
import { GENDER_CONFIG, ROLE_CONFIG } from '../data/initialData';
import { WallpaperTheme } from '../data/wallpapers';

interface NavbarProps {
  activeRoom: Room;
  totalUsersCount: number;
  activeRadio: RadioStation | null;
  isPlayingRadio: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenRooms: () => void;
  onOpenRadios: () => void;
  onToggleUserList: () => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenThemes: () => void;
  onZapWallpaper: () => void;
  currentWallpaperName: string;
  activeTheme?: WallpaperTheme;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRoom,
  totalUsersCount,
  activeRadio,
  isPlayingRadio,
  soundEnabled,
  onToggleSound,
  isDarkTheme,
  onToggleTheme,
  onOpenRooms,
  onOpenRadios,
  onToggleUserList,
  currentUser,
  onOpenAuth,
  onOpenThemes,
  onZapWallpaper,
  currentWallpaperName,
  activeTheme,
}) => {
  const genderCfg = GENDER_CONFIG[currentUser.gender] || GENDER_CONFIG.neutre;
  const roleCfg = ROLE_CONFIG[currentUser.role] || ROLE_CONFIG.user;

  return (
    <header className="h-16 bg-slate-900/95 border-b border-emerald-500/20 px-3 md:px-5 flex items-center justify-between gap-2 select-none relative z-30 backdrop-blur-md">
      {/* Brand & Algerian Identity */}
      <div className="flex items-center gap-3">
        <a
          href="https://www.algerie.cool/"
          title="www.algerie.cool - Site officiel"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          {/* Algerian Emblem */}
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-emerald-500/40 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden relative">
            <svg
              className="w-full h-full rounded"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="16" height="32" fill="#006233" />
              <rect x="16" width="16" height="32" fill="#ffffff" />
              <path
                d="M18 10a7 7 0 1 0 0 12 6 6 0 1 1 0-12z"
                fill="#d21034"
              />
              <polygon
                points="18,13.5 19.3,15.2 21.5,14.8 20.2,16.5 21.5,18.2 19.3,17.8 18,19.5 18.2,17.3 16.5,16.5 18.2,15.7"
                fill="#d21034"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-white font-[Cabinet_Grotesk]">
                algerie<span style={{ color: activeTheme?.accentColor || '#34d399' }} className="transition-colors duration-500">.cool</span>
              </span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                DZ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              www.algerie.cool • Tchat & Webradios
            </p>
          </div>
        </a>
      </div>

      {/* Center Quick Navigation: Salons & Webradios buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Salons list button */}
        <button
          onClick={onOpenRooms}
          style={{ borderColor: activeTheme?.accentColor ? `${activeTheme.accentColor}44` : undefined }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all text-xs font-semibold shadow-sm group active:scale-95"
          title="Choisir un salon de discussion"
        >
          <Hash
            className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform flex-shrink-0"
            style={{ color: activeTheme?.accentColor || '#34d399' }}
          />
          <span className="hidden md:inline">Salons :</span>
          <span
            className="font-bold truncate max-w-[70px] sm:max-w-[100px] md:max-w-none text-xs"
            style={{ color: activeTheme?.accentColor || '#6ee7b7' }}
          >
            {activeRoom.name}
          </span>
          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full hidden xs:inline">
            {activeRoom.userCount}
          </span>
        </button>

        {/* Webradios button with equalizer */}
        <button
          onClick={onOpenRadios}
          style={{
            borderColor: isPlayingRadio && activeTheme?.accentColor ? `${activeTheme.accentColor}88` : undefined,
          }}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold shadow-sm active:scale-95 ${
            isPlayingRadio
              ? 'bg-slate-900/90 text-white ring-1 shadow-md'
              : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
          }`}
          title="Écouter les Webradios en direct"
        >
          <Radio
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: isPlayingRadio && activeTheme?.accentColor ? activeTheme.accentColor : '#94a3b8' }}
          />
          <span className="hidden lg:inline">Radio :</span>
          <span className="truncate max-w-[65px] sm:max-w-[90px] md:max-w-[120px] text-xs">
            {activeRadio ? activeRadio.name : 'Radio'}
          </span>
          {activeRadio && (
            <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
              🎧 {activeRadio.listenersCount > 1000 ? `${(activeRadio.listenersCount / 1000).toFixed(1)}k` : activeRadio.listenersCount}
            </span>
          )}
          {isPlayingRadio && (
            <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
              <span
                className="w-0.5 rounded animate-eq-1 h-3 inline-block"
                style={{ backgroundColor: activeTheme?.accentColor || '#34d399' }}
              />
              <span
                className="w-0.5 rounded animate-eq-2 h-2 inline-block"
                style={{ backgroundColor: activeTheme?.accentColor || '#34d399' }}
              />
              <span
                className="w-0.5 rounded animate-eq-3 h-3.5 inline-block"
                style={{ backgroundColor: activeTheme?.accentColor || '#34d399' }}
              />
            </div>
          )}
        </button>
      </div>

      {/* Right Controls: Sound, Theme, UserList toggle, Profile */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Sound bip toggle (hidden on very small screens, visible on sm) */}
        <button
          onClick={onToggleSound}
          className={`hidden sm:flex p-2 rounded-xl transition-colors border ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Sons de connexion & alertes activés' : 'Sons coupés'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Quick Wallpaper Zapper button */}
        <button
          onClick={onZapWallpaper}
          className={`flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r ${
            activeTheme
              ? `${activeTheme.primaryGradient} ${activeTheme.primaryTextColor} ${activeTheme.glowShadow}`
              : 'from-emerald-600 to-amber-500 text-slate-950 font-bold'
          } border border-white/20 transition-all text-xs hover:scale-105 active:scale-95 shadow-md`}
          title={`Zapper de fond d'écran (${currentWallpaperName})`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span className="hidden md:inline text-[11px] font-extrabold tracking-wide">Zapper</span>
        </button>

        {/* Wallpaper & Theme Selector button */}
        <button
          onClick={onOpenThemes}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          style={{
            borderColor: activeTheme?.accentColor ? `${activeTheme.accentColor}55` : undefined,
          }}
          title={`Choisir le thème & fond d'écran (${currentWallpaperName})`}
        >
          <ImageIcon className="w-4 h-4" style={{ color: activeTheme?.accentColor }} />
        </button>

        {/* Dark/Light theme */}
        <button
          onClick={onToggleTheme}
          className="hidden sm:flex p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
          title={isDarkTheme ? 'Passer en thème clair' : 'Passer en thème sombre'}
        >
          {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Toggle User List button for mobile/tablet/desktop */}
        <button
          onClick={onToggleUserList}
          className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-sm"
          title="Afficher / Réduire les connectés"
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-extrabold">{totalUsersCount}</span>
        </button>

        {/* User Profile / Access & Registration Settings pill */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all text-xs group active:scale-95 shadow-sm"
          title="Paramètres d'accès, changer de pseudo ou protéger par mot de passe"
        >
          <div className="relative">
            <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs">
              {currentUser.countryCode === 'DZ' ? '🇩🇿' : currentUser.countryCode === 'FR' ? '🇫🇷' : 'ⵣ'}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="text-left hidden sm:block">
            <span className={`block font-extrabold truncate max-w-[95px] leading-tight ${genderCfg.textClass}`}>
              {currentUser.pseudo}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              {currentUser.isRegistered ? (
                <span className="text-emerald-400 font-bold">✨ Protégé</span>
              ) : (
                <span className="text-slate-400">⚙️ Accès / Invité</span>
              )}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};

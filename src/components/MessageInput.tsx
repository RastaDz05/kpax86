import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Palette,
  Terminal,
  HelpCircle,
  Sparkles,
  Youtube,
  X,
  Volume2,
} from 'lucide-react';
import { CHAT_COLORS, POPULAR_SMILEYS } from '../data/initialData';
import { WallpaperTheme } from '../data/wallpapers';

interface MessageInputProps {
  onSendMessage: (text: string, color: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  roomName: string;
  isMuted?: boolean;
  activeTheme?: WallpaperTheme;
}

const COMMAND_HINTS = [
  { cmd: '/clear', desc: 'Effacer tous les messages du salon actif' },
  { cmd: '/kick <pseudo>', desc: 'Éjecter un utilisateur du salon' },
  { cmd: '/ban <pseudo>', desc: 'Bannir un utilisateur du tchat' },
  { cmd: '/mute <pseudo>', desc: 'Réduire au silence un utilisateur' },
  { cmd: '/warn <pseudo> [raison]', desc: 'Avertir un utilisateur avec un motif' },
  { cmd: '/admin <pseudo>', desc: 'Nommer Administrateur (👑)' },
  { cmd: '/op <pseudo>', desc: 'Nommer Opérateur (🛡️)' },
  { cmd: '/modo <pseudo>', desc: 'Nommer Modérateur (⭐)' },
  { cmd: '/topic <nouveau topic>', desc: 'Changer le topic du salon actif' },
  { cmd: '/help', desc: 'Afficher la liste des commandes et astuces' },
];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  selectedColor,
  onSelectColor,
  roomName,
  isMuted,
  activeTheme,
}) => {
  const [text, setText] = useState('');
  const [showSmileys, setShowSmileys] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    if (isMuted) {
      alert('Vous êtes actuellement réduit au silence par la modération.');
      return;
    }

    onSendMessage(text.trim(), selectedColor);
    setText('');
    setShowSmileys(false);
    setShowColors(false);
    setShowCommands(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertSmiley = (smiley: string) => {
    setText((prev) => prev + smiley);
    setShowSmileys(false);
    inputRef.current?.focus();
  };

  const insertCommand = (cmdPrefix: string) => {
    setText(cmdPrefix + ' ');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  // Detect when typing `/`
  useEffect(() => {
    if (text.startsWith('/')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  }, [text]);

  const activeColorObj = CHAT_COLORS.find((c) => c.hex === selectedColor) || CHAT_COLORS[0];

  return (
    <div className="p-2 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-900/95 border-t border-slate-800 relative z-10 backdrop-blur-md">
      {/* Quick emoji touch strip for smartphone / fast access */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 sm:pb-2 text-sm select-none">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline mr-1">
          Rapide :
        </span>
        {['🇩🇿', '❤️', '🔥', '😂', '😍', 'ⵣ', '☕', '⚽', '🌹', '✨', '👏'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => insertSmiley(s)}
            className="px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-sm transition-transform active:scale-125 hover:scale-110 flex-shrink-0"
            title={`Ajouter ${s}`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => insertCommand('/')}
          className="px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex-shrink-0"
          title="Commandes IRC"
        >
          /cmd
        </button>
      </div>

      {/* Autocomplete commands dropdown */}
      {showCommands && (
        <div className="absolute bottom-full left-2 right-2 sm:left-4 sm:right-4 mb-2 bg-slate-900/95 border border-emerald-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md max-h-56 overflow-y-auto z-40">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Commandes IRC & Modération
            </span>
            <button
              onClick={() => setShowCommands(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {COMMAND_HINTS.filter((h) => h.cmd.toLowerCase().startsWith(text.toLowerCase()) || text === '/').map((h) => (
              <button
                key={h.cmd}
                onClick={() => insertCommand(h.cmd.split(' ')[0])}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs transition-colors group"
              >
                <code className="text-emerald-400 font-bold group-hover:text-emerald-300">
                  {h.cmd}
                </code>
                <span className="text-slate-400 text-[11px]">{h.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet for Smileys */}
      {showSmileys && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:hidden"
          onClick={() => setShowSmileys(false)}
        >
          <div
            className="w-full bg-slate-900 border-t border-emerald-500/40 rounded-t-3xl p-4 shadow-2xl max-h-[75vh] flex flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-400" />
                Smileys & Drapeaux DZ
              </span>
              <button
                onClick={() => setShowSmileys(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold"
              >
                ✕ Fermer
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2.5 text-2xl p-2 overflow-y-auto flex-1">
              {POPULAR_SMILEYS.map((smiley, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertSmiley(smiley)}
                  className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center active:scale-125 transition-transform"
                >
                  {smiley}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Smiley Picker Popup */}
      {showSmileys && (
        <div className="hidden sm:block absolute bottom-full left-2 mb-2 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-40 w-72">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              Smileys & Drapeaux
            </span>
            <button
              onClick={() => setShowSmileys(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2 text-xl p-1 max-h-48 overflow-y-auto">
            {POPULAR_SMILEYS.map((smiley, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertSmiley(smiley)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-transform hover:scale-125"
              >
                {smiley}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet for Colors */}
      {showColors && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:hidden"
          onClick={() => setShowColors(false)}
        >
          <div
            className="w-full bg-slate-900 border-t border-emerald-500/40 rounded-t-3xl p-4 shadow-2xl max-h-[75vh] flex flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-400" />
                Couleur de mon texte
              </span>
              <button
                onClick={() => setShowColors(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold"
              >
                ✕ Fermer
              </button>
            </div>

            {/* AI Adaptive Theme Color Quick Pick */}
            {activeTheme && (
              <button
                type="button"
                onClick={() => {
                  onSelectColor(activeTheme.suggestedChatColor);
                  setShowColors(false);
                }}
                className="w-full mb-3 p-3 rounded-2xl bg-slate-800 border border-emerald-500/40 flex items-center justify-between gap-3 text-left active:scale-95 transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-6 h-6 rounded-full border border-white/40 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: activeTheme.suggestedChatColor }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      Couleur IA du Thème Actif
                    </span>
                    <span className="text-[11px] text-emerald-400 truncate block">
                      {activeTheme.paletteName}
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              </button>
            )}

            <div className="grid grid-cols-4 gap-2.5 p-1 overflow-y-auto">
              {CHAT_COLORS.map((c) => {
                const isSelected = selectedColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      onSelectColor(c.hex);
                      setShowColors(false);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500'
                        : 'border-slate-800 bg-slate-950'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] text-slate-300 font-bold truncate max-w-full">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Color Picker Popup */}
      {showColors && (
        <div className="hidden sm:block absolute bottom-full left-12 mb-2 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-40 w-72">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              Couleur de mon texte
            </span>
            <button
              onClick={() => setShowColors(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Adaptive Theme Color Quick Pick */}
          {activeTheme && (
            <button
              type="button"
              onClick={() => {
                onSelectColor(activeTheme.suggestedChatColor);
                setShowColors(false);
              }}
              className="w-full mb-2.5 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-between gap-2 text-left transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-4 h-4 rounded-full border border-white/40 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: activeTheme.suggestedChatColor }}
                />
                <div className="truncate">
                  <span className="text-[11px] font-bold text-slate-200 block truncate">
                    Couleur IA du Thème
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {activeTheme.paletteName}
                  </span>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            </button>
          )}

          <div className="grid grid-cols-4 gap-2">
            {CHAT_COLORS.map((c) => {
              const isSelected = selectedColor === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    onSelectColor(c.hex);
                    setShowColors(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                      : 'border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] text-slate-300 font-medium truncate max-w-full">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
        {/* Buttons for Smileys & Colors (bottom-left) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowSmileys(!showSmileys);
              setShowColors(false);
            }}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
              showSmileys
                ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Smileys & Emojis"
            aria-label="Smileys et Emojis"
          >
            <Smile className="w-5 h-5 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowColors(!showColors);
              setShowSmileys(false);
            }}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-lg flex items-center justify-center transition-all relative active:scale-95 ${
              showColors
                ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={`Couleur du texte : ${activeColorObj.name}`}
            aria-label="Couleur de texte"
          >
            <Palette className="w-5 h-5 text-emerald-400" />
            <span
              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
          </button>
        </div>

        {/* Text Input (text-base on mobile prevents iOS Safari unwanted auto-zoom) */}
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isMuted}
            style={{ color: selectedColor }}
            placeholder={
              isMuted
                ? 'Vous êtes en mode muet...'
                : `Message #${roomName}...`
            }
            className={`w-full bg-slate-950 text-base sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-800 focus:outline-none transition-all placeholder:text-slate-500 font-medium ${
              activeTheme ? `focus:${activeTheme.borderAccent}` : 'focus:border-emerald-500/60'
            }`}
          />
          {text.includes('youtube.com') || text.includes('youtu.be') ? (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-red-400 font-semibold bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800/60 flex items-center gap-1">
              <Youtube className="w-3 h-3" />
              <span className="hidden sm:inline">Vidéo</span>
            </span>
          ) : null}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isMuted}
          className={`min-h-[40px] min-w-[40px] p-2.5 sm:p-2.5 rounded-xl bg-gradient-to-r flex-shrink-0 ${
            activeTheme
              ? `${activeTheme.primaryGradient} ${activeTheme.primaryTextColor} ${activeTheme.glowShadow}`
              : 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold shadow-md'
          } transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center`}
          title="Envoyer (Entrée)"
          aria-label="Envoyer"
        >
          <Send className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </form>
    </div>
  );
};

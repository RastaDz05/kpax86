import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  Tv,
  ExternalLink,
  Shield,
  Crown,
  Star,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  Trash2,
  Radio,
  Eye,
  Play,
  Flame,
  Smile,
  Plus,
} from 'lucide-react';
import { ChatMessage, Room, UserProfile, UserRole, YouTubeCardData } from '../types';
import { GENDER_CONFIG, POPULAR_SMILEYS } from '../data/initialData';
import { WallpaperTheme } from '../data/wallpapers';

interface ChatRoomProps {
  room: Room;
  messages: ChatMessage[];
  currentUserId: string;
  onOpenPV: (user: UserProfile) => void;
  onSelectUser: (user: UserProfile) => void;
  onPlayYouTube: (video: YouTubeCardData) => void;
  blockedUserIds: string[];
  onChangeTopicClick?: () => void;
  canEditTopic?: boolean;
  activeTheme?: WallpaperTheme;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  room,
  messages,
  currentUserId,
  onOpenPV,
  onSelectUser,
  onPlayYouTube,
  blockedUserIds,
  onChangeTopicClick,
  canEditTopic,
  activeTheme,
  onToggleReaction,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openPickerMessageId, setOpenPickerMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMachineIcon = (machine?: string) => {
    switch (machine) {
      case 'smartphone':
        return (
          <span title="Smartphone">
            <Smartphone className="w-3 h-3 text-slate-400" />
          </span>
        );
      case 'tablette':
        return (
          <span title="Tablette">
            <Tablet className="w-3 h-3 text-slate-400" />
          </span>
        );
      default:
        return (
          <span title="PC">
            <Monitor className="w-3 h-3 text-slate-400" />
          </span>
        );
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    if (role === 'admin') {
      return (
        <span title="Admin">
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
        </span>
      );
    }
    if (role === 'op') {
      return (
        <span title="OP">
          <Shield className="w-3 h-3 text-emerald-400" />
        </span>
      );
    }
    if (role === 'modo') {
      return (
        <span title="Modo">
          <Star className="w-3 h-3 text-cyan-400" />
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 relative">
      {/* Attractive Welcome Topic Banner */}
      <div
        style={{
          borderColor: activeTheme?.accentColor ? `${activeTheme.accentColor}33` : undefined,
        }}
        className="px-4 py-3 bg-slate-900/90 border-b backdrop-blur-md flex items-center justify-between gap-3 shadow-md"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{
              borderColor: activeTheme?.accentColor ? `${activeTheme.accentColor}55` : undefined,
              backgroundColor: activeTheme?.accentColor ? `${activeTheme.accentColor}20` : undefined,
            }}
            className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" style={{ color: activeTheme?.accentColor || '#6ee7b7' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide">
                {room.name}
              </span>
              <span
                style={{
                  color: activeTheme?.accentColor || '#34d399',
                  borderColor: activeTheme?.accentColor ? `${activeTheme.accentColor}33` : undefined,
                  backgroundColor: activeTheme?.accentColor ? `${activeTheme.accentColor}15` : undefined,
                }}
                className="text-[11px] font-semibold px-2 py-0.2 rounded-full border"
              >
                {room.userCount} connectés
              </span>
              {activeTheme && (
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  • {activeTheme.paletteName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              {room.topic}
            </p>
          </div>
        </div>

        {canEditTopic && onChangeTopicClick && (
          <button
            onClick={onChangeTopicClick}
            style={{
              color: activeTheme?.accentColor || '#34d399',
              borderColor: activeTheme?.accentColor ? `${activeTheme.accentColor}44` : undefined,
            }}
            className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 border transition-colors flex-shrink-0"
          >
            Modifier topic
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth"
      >
        {/* Welcome message in room */}
        <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900/70 to-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 text-center max-w-xl mx-auto my-3 shadow-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-2xl mb-2">
            🇩🇿
          </div>
          <h2 className="text-base font-extrabold text-white">
            Bienvenue sur le salon {room.name} d'Algerie.cool !
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            Partagez, discutez et écoutez les meilleures webradios en direct. Double-cliquez sur n'importe quel pseudo pour démarrer une conversation privée (PV).
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap text-[11px] text-emerald-300">
            <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ⚡ Zéro lag
            </span>
            <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              📻 Webradios intégrées
            </span>
            <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              🎥 Vidéos YouTube PiP
            </span>
          </div>
        </div>

        {messages.map((msg) => {
          // If sender is blocked, hide message
          if (blockedUserIds.includes(msg.sender.id)) {
            return (
              <div key={msg.id} className="text-xs text-slate-500 italic py-0.5">
                (Message masqué - utilisateur bloqué)
              </div>
            );
          }

          // System notification (kick, ban, clear, topic, join)
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="flex items-center justify-center my-2 text-xs"
              >
                <div className="bg-slate-900/90 border border-slate-800 text-slate-300 px-3.5 py-1 rounded-full shadow-sm flex items-center gap-2">
                  <span className="text-amber-400 font-semibold">•</span>
                  <span>{msg.content}</span>
                  <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          }

          const isMe = msg.sender.id === currentUserId;
          const genderCfg = GENDER_CONFIG[msg.sender.gender] || GENDER_CONFIG.neutre;

          return (
            <div
              key={msg.id}
              className={`group relative flex items-start gap-3 text-xs transition-all rounded-2xl p-2.5 bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/70 backdrop-blur-md shadow-sm`}
            >
              {/* Floating Quick Reaction Toolbar */}
              <div className="absolute right-3 -top-2.5 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 bg-slate-800/95 border border-slate-700/80 rounded-full px-2 py-0.5 shadow-lg z-10 backdrop-blur-md">
                {['❤️', '🇩🇿', '😂', '🔥', '👏'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onToggleReaction?.(msg.id, emoji)}
                    className="hover:scale-125 transition-transform text-xs"
                    title={`Réagir avec ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setOpenPickerMessageId(openPickerMessageId === msg.id ? null : msg.id)}
                  className="text-slate-400 hover:text-emerald-400 p-0.5 ml-0.5 transition-colors"
                  title="Plus de réactions..."
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Avatar / Country Flag */}
              <div
                onClick={() => onSelectUser(msg.sender)}
                className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-sm flex-shrink-0 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                title={`${msg.sender.pseudo} (${msg.sender.location})`}
              >
                {msg.sender.countryCode === 'DZ' ? '🇩🇿' : msg.sender.countryCode === 'FR' ? '🇫🇷' : 'ⵣ'}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {/* Header: Pseudo + Role + Machine + Location + Time */}
                <div className="flex items-center gap-1.5 flex-wrap leading-tight mb-1">
                  <span
                    onDoubleClick={() => !isMe && onOpenPV(msg.sender)}
                    onClick={() => onSelectUser(msg.sender)}
                    className={`font-bold cursor-pointer hover:underline text-xs ${genderCfg.textClass}`}
                    title="Double-clic pour ouvrir un PV, clic simple pour le profil"
                  >
                    {msg.sender.pseudo}
                  </span>

                  {getRoleIcon(msg.sender.role)}
                  {getMachineIcon(msg.sender.machine)}

                  <span className="text-[10px] text-slate-400">
                    {msg.sender.location}
                  </span>

                  {msg.sender.currentRadioName && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <Radio className="w-2.5 h-2.5" />
                      {msg.sender.currentRadioName}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 ml-auto">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Text body with custom user color */}
                <div
                  style={{ color: msg.color || undefined }}
                  className={`text-slate-200 text-sm break-words whitespace-pre-wrap leading-relaxed ${
                    !msg.color ? 'text-slate-100' : ''
                  }`}
                >
                  {msg.content}
                </div>

                {/* YouTube Preview Card if attached */}
                {msg.youtubeData && (
                  <div className="mt-2.5 max-w-md bg-slate-900 border border-emerald-500/30 rounded-xl overflow-hidden shadow-lg group/yt transition-all hover:border-emerald-500/60">
                    <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => onPlayYouTube(msg.youtubeData!)}>
                      <img
                        src={msg.youtubeData.thumbnailUrl}
                        alt={msg.youtubeData.title}
                        className="w-full h-full object-cover group-hover/yt:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover/yt:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover/yt:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        YouTube
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/95 flex flex-col gap-1.5">
                      <h4 className="font-bold text-slate-100 text-xs line-clamp-2 leading-snug">
                        {msg.youtubeData.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-emerald-400 truncate pr-2">
                          {msg.youtubeData.channelName}
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0 text-slate-400">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {msg.youtubeData.viewsText}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => onPlayYouTube(msg.youtubeData!)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
                        >
                          <Tv className="w-3.5 h-3.5" />
                          Ouvrir en fenêtre détachable
                        </button>
                        <a
                          href={msg.youtubeData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-200 p-1.5"
                          title="Voir sur YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reactions Display */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {msg.reactions &&
                    Object.entries(msg.reactions).map(([emoji, userIds]) => {
                      if (!userIds || userIds.length === 0) return null;
                      const hasReacted = userIds.includes(currentUserId);
                      return (
                        <button
                          key={emoji}
                          onClick={() => onToggleReaction?.(msg.id, emoji)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs transition-all active:scale-95 border ${
                            hasReacted
                              ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 font-bold shadow-sm'
                              : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70 text-slate-300'
                          }`}
                          title={`${userIds.length} réaction(s)${hasReacted ? ' (dont vous - cliquez pour retirer)' : ' (cliquez pour réagir)'}`}
                        >
                          <span className="text-xs leading-none">{emoji}</span>
                          <span className="text-[11px] font-semibold">{userIds.length}</span>
                        </button>
                      );
                    })}

                  {/* Add reaction trigger pill */}
                  <button
                    onClick={() => setOpenPickerMessageId(openPickerMessageId === msg.id ? null : msg.id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-slate-400 hover:text-emerald-300 bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700/60 transition-colors"
                    title="Ajouter une réaction"
                  >
                    <Smile className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Emoji Picker Popover */}
                {openPickerMessageId === msg.id && (
                  <div className="mt-2.5 p-2 bg-slate-900/95 border border-emerald-500/40 rounded-2xl shadow-2xl max-w-xs z-30 animate-fade-in backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Smile className="w-3 h-3 text-emerald-400" />
                        Choisir une réaction
                      </span>
                      <button
                        onClick={() => setOpenPickerMessageId(null)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto p-1">
                      {POPULAR_SMILEYS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onToggleReaction?.(msg.id, emoji);
                            setOpenPickerMessageId(null);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-base rounded-lg hover:bg-slate-800 hover:scale-110 active:scale-95 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

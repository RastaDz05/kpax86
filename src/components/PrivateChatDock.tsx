import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Minus,
  X,
  Send,
  ShieldAlert,
  Radio,
  Ban,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { PrivateConversation, UserProfile } from '../types';
import { GENDER_CONFIG, ROLE_CONFIG } from '../data/initialData';

interface PrivateChatDockProps {
  conversations: Record<string, PrivateConversation>;
  activeConversationPartnerId: string | null;
  onSelectConversation: (partnerId: string) => void;
  onCloseConversation: (partnerId: string) => void;
  onMinimizeConversation: (partnerId: string) => void;
  onSendMessage: (toUser: UserProfile, content: string) => void;
  onBlockUser: (user: UserProfile) => void;
  onUnblockUser: (user: UserProfile) => void;
  blockedUserIds: string[];
  currentUserId: string;
}

export const PrivateChatDock: React.FC<PrivateChatDockProps> = ({
  conversations,
  activeConversationPartnerId,
  onSelectConversation,
  onCloseConversation,
  onMinimizeConversation,
  onSendMessage,
  onBlockUser,
  onUnblockUser,
  blockedUserIds,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = activeConversationPartnerId
    ? conversations[activeConversationPartnerId]
    : null;

  const convList = Object.values(conversations).filter((c) => c.isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  if (convList.length === 0) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    if (blockedUserIds.includes(activeConv.partner.id)) {
      alert('Vous avez bloqué cet utilisateur. Débloquez-le pour converser.');
      return;
    }

    onSendMessage(activeConv.partner, inputText.trim());
    setInputText('');
  };

  const partner = activeConv?.partner;
  const isPartnerBlocked = partner ? blockedUserIds.includes(partner.id) : false;
  const partnerGender = partner ? GENDER_CONFIG[partner.gender] || GENDER_CONFIG.neutre : null;

  // Protection: cannot block admin, op, modo
  const canBlock = partner
    ? partner.role !== 'admin' && partner.role !== 'op' && partner.role !== 'modo'
    : false;

  return (
    <div className="fixed bottom-0 right-2 sm:right-4 z-40 flex items-end gap-2 max-w-[calc(100vw-16px)] pb-[env(safe-area-inset-bottom,0px)]">
      {/* Minimized tabs list */}
      <div className="flex items-center gap-1.5 mb-1 flex-wrap max-w-full">
        {convList.map((conv) => {
          const isActive = conv.partner.id === activeConversationPartnerId;
          const gender = GENDER_CONFIG[conv.partner.gender] || GENDER_CONFIG.neutre;

          return (
            <div
              key={conv.partner.id}
              onClick={() => onSelectConversation(conv.partner.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl border-t border-x cursor-pointer transition-all shadow-md select-none ${
                isActive && !conv.isMinimized
                  ? 'bg-slate-900 border-emerald-500/50 text-white shadow-emerald-950/40'
                  : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className={`text-xs font-bold ${gender.textClass}`}>
                {conv.partner.pseudo}
              </span>

              {conv.unreadCount > 0 && (
                <span className="bg-red-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                  {conv.unreadCount}
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseConversation(conv.partner.id);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Expanded PV Window */}
      {activeConv && !activeConv.isMinimized && partner && partnerGender && (
        <div className="w-[calc(100vw-20px)] sm:w-96 max-w-sm bg-slate-900 border border-emerald-500/40 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[65vh] sm:h-[420px] max-h-[500px] transition-all">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative">
                <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                  {partner.countryCode === 'DZ' ? '🇩🇿' : partner.countryCode === 'FR' ? '🇫🇷' : 'ⵣ'}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-xs truncate ${partnerGender.textClass}`}>
                    {partner.pseudo}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {partner.location}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>{partner.age} ans</span>
                  {partner.currentRadioName && (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      • <Radio className="w-2.5 h-2.5" /> {partner.currentRadioName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Block/Unblock toggle */}
              {canBlock ? (
                <button
                  type="button"
                  onClick={() =>
                    isPartnerBlocked
                      ? onUnblockUser(partner)
                      : onBlockUser(partner)
                  }
                  className={`p-1.5 rounded transition-colors ${
                    isPartnerBlocked
                      ? 'text-emerald-400 hover:bg-emerald-500/20'
                      : 'text-slate-400 hover:text-red-400 hover:bg-red-500/20'
                  }`}
                  title={isPartnerBlocked ? 'Débloquer' : 'Bloquer cet utilisateur'}
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span title="Protection : Les Admins/OP/Modos ne peuvent pas être bloqués" className="text-slate-400 p-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400/60" />
                </span>
              )}

              <button
                type="button"
                onClick={() => onMinimizeConversation(partner.id)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Réduire"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onCloseConversation(partner.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                title="Fermer le PV"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Blocked Alert Banner if user is blocked */}
          {isPartnerBlocked && (
            <div className="bg-red-950/60 border-b border-red-800/60 px-3 py-1.5 text-[11px] text-red-300 flex items-center justify-between">
              <span>Utilisateur bloqué. Vous ne recevrez plus ses messages.</span>
              <button
                onClick={() => onUnblockUser(partner)}
                className="font-bold underline ml-2 text-red-200 hover:text-white"
              >
                Débloquer
              </button>
            </div>
          )}

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-950/50 text-xs">
            {activeConv.messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p>Début de la conversation privée avec <strong className={partnerGender.textClass}>{partner.pseudo}</strong>.</p>
                <p className="text-[11px] text-slate-400 mt-1">Vos échanges sont discrets et en tête-à-tête.</p>
              </div>
            ) : (
              activeConv.messages.map((m) => {
                const isFromMe = m.fromId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                        isFromMe
                          ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{m.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* PV Message Input */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              disabled={isPartnerBlocked}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isPartnerBlocked
                  ? 'Débloquez l\'utilisateur pour envoyer'
                  : `Message privé pour ${partner.pseudo}...`
              }
              className="flex-1 bg-slate-950 text-base sm:text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500/60 focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isPartnerBlocked}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-40"
              title="Envoyer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

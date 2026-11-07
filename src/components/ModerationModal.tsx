import React, { useState } from 'react';
import {
  Shield,
  Crown,
  Star,
  Ban,
  UserX,
  VolumeX,
  AlertTriangle,
  Trash2,
  X,
  Check,
  UserCheck,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface ModerationModalProps {
  targetUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onKick: (pseudo: string) => void;
  onBan: (pseudo: string) => void;
  onMute: (pseudo: string) => void;
  onWarn: (pseudo: string, reason: string) => void;
  onSetRole: (pseudo: string, role: UserRole) => void;
  onClearRoom: () => void;
  activeRoomName: string;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  targetUser,
  isOpen,
  onClose,
  onKick,
  onBan,
  onMute,
  onWarn,
  onSetRole,
  onClearRoom,
  activeRoomName,
}) => {
  const [warnReason, setWarnReason] = useState('');
  const [targetPseudo, setTargetPseudo] = useState(targetUser?.pseudo || '');

  if (!isOpen) return null;

  const currentPseudo = targetUser?.pseudo || targetPseudo;

  const handleWarn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPseudo) return;
    onWarn(currentPseudo, warnReason.trim() || 'Non-respect des règles de courtoisie et de respect');
    setWarnReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Panneau de Modération Algerie.cool
              </h3>
              <p className="text-xs text-slate-400">
                Commandes rapides IRC : /kick, /ban, /mute, /warn, /clear, rôles
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

        {/* Target user input if not preset */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Utilisateur ciblé
            </label>
            <input
              type="text"
              value={targetPseudo}
              onChange={(e) => setTargetPseudo(e.target.value)}
              placeholder="Pseudo de l'utilisateur..."
              className="w-full bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-200 text-xs font-semibold focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          {/* Action Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Sanctions rapides
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onKick(currentPseudo);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-600/20 text-amber-300 border border-slate-700 hover:border-amber-500/40 font-semibold flex flex-col items-center gap-1.5 transition-colors"
              >
                <UserX className="w-4 h-4 text-amber-400" />
                <span>/kick</span>
                <span className="text-[10px] text-slate-400 font-normal">Éjecter du salon</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onMute(currentPseudo);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-purple-600/20 text-purple-300 border border-slate-700 hover:border-purple-500/40 font-semibold flex flex-col items-center gap-1.5 transition-colors"
              >
                <VolumeX className="w-4 h-4 text-purple-400" />
                <span>/mute</span>
                <span className="text-[10px] text-slate-400 font-normal">Couper la parole</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onBan(currentPseudo);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-600/20 text-red-300 border border-slate-700 hover:border-red-500/40 font-semibold flex flex-col items-center gap-1.5 transition-colors"
              >
                <Ban className="w-4 h-4 text-red-400" />
                <span>/ban</span>
                <span className="text-[10px] text-slate-400 font-normal">Bannir du site</span>
              </button>
            </div>
          </div>

          {/* Warn Form */}
          <form onSubmit={handleWarn} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 font-semibold text-amber-400 text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Envoyer un Avertissement (/warn)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={warnReason}
                onChange={(e) => setWarnReason(e.target.value)}
                placeholder="Raison (ex: Propos inappropriés, spam, etc.)..."
                className="flex-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!currentPseudo}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors text-xs"
              >
                Avertir
              </button>
            </div>
          </form>

          {/* Grades Hiérarchiques */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Grades Hiérarchiques (/admin, /op, /modo)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onSetRole(currentPseudo, 'admin');
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>/admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onSetRole(currentPseudo, 'op');
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>/op</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onSetRole(currentPseudo, 'modo');
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <Star className="w-4 h-4 text-cyan-400" />
                <span>/modo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentPseudo) {
                    onSetRole(currentPseudo, 'user');
                    onClose();
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold flex flex-col items-center gap-1 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Membre</span>
              </button>
            </div>
          </div>

          {/* Clear Room */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-slate-200">Nettoyer le salon</h5>
              <p className="text-[11px] text-slate-400">
                Efface tous les messages affichés dans {activeRoomName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClearRoom();
                onClose();
              }}
              className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              /clear salon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

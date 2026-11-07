import React from 'react';
import {
  X,
  MessageCircle,
  Ban,
  Shield,
  Crown,
  Star,
  MapPin,
  Calendar,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  CheckCircle2,
  Hash,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { GENDER_CONFIG, ROLE_CONFIG } from '../data/initialData';

interface UserProfileModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onOpenPV: (user: UserProfile) => void;
  onBlockUser: (user: UserProfile) => void;
  onUnblockUser: (user: UserProfile) => void;
  isBlocked: boolean;
  currentUserRole: UserRole;
  onOpenModeration: (user: UserProfile) => void;
  isCurrentUser: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onOpenPV,
  onBlockUser,
  onUnblockUser,
  isBlocked,
  currentUserRole,
  onOpenModeration,
  isCurrentUser,
}) => {
  if (!user) return null;

  const genderCfg = GENDER_CONFIG[user.gender] || GENDER_CONFIG.neutre;
  const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;

  // Rule: Cannot block Admin, OP, Modo
  const isStaff = user.role === 'admin' || user.role === 'op' || user.role === 'modo';
  const canBlock = !isStaff && !isCurrentUser;
  const canModerate =
    !isCurrentUser &&
    (currentUserRole === 'admin' ||
      currentUserRole === 'op' ||
      (currentUserRole === 'modo' && user.role === 'user'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Banner with Algeria vibe */}
        <div className="h-24 bg-gradient-to-r from-emerald-900 via-slate-900 to-red-950/60 p-4 relative flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-slate-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <span>🇩🇿 Algerie.cool</span>
            <span>•</span>
            <span>Fiche Membre</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-black/40 hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Info */}
        <div className="px-6 pb-6 pt-0 relative flex-1">
          {/* Avatar & Badges */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-3xl shadow-xl">
                {user.countryCode === 'DZ' ? '🇩🇿' : user.countryCode === 'FR' ? '🇫🇷' : 'ⵣ'}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="En ligne" />
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${roleCfg.color}`}>
                {roleCfg.badge}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${genderCfg.bgBadgeClass}`}>
                {genderCfg.icon} {genderCfg.label}
              </span>
            </div>
          </div>

          {/* Pseudo & Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-xl font-extrabold ${genderCfg.textClass}`}>
                {user.pseudo}
              </h3>
              {user.isRegistered && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Pseudo Enregistré
                </span>
              )}
              {user.isBot && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  bot officiel
                </span>
              )}
            </div>
            {user.bio && (
              <p className="text-xs text-slate-300 mt-2 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                "{user.bio}"
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-5">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Géolocalisation</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {user.location}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Appareil utilisé</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1 capitalize">
                {user.machine === 'pc' ? (
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {user.machine}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Âge & Profil</span>
              <span className="font-semibold text-slate-200">
                {user.age} ans • {genderCfg.label}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Webradio en cours</span>
              <span className="font-semibold text-emerald-400 truncate flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {user.currentRadioName || 'Aucune radio'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2">
              <span className="text-[11px] text-slate-400 block mb-0.5">Salons connectés</span>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                {user.currentRooms.map((r) => (
                  <span
                    key={r}
                    className="text-[11px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1"
                  >
                    <Hash className="w-3 h-3 text-emerald-400" />
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isCurrentUser && (
              <button
                onClick={() => {
                  onOpenPV(user);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                Ouvrir une discussion privée (PV)
              </button>
            )}

            <div className="flex items-center gap-2">
              {canBlock ? (
                <button
                  onClick={() => {
                    if (isBlocked) {
                      onUnblockUser(user);
                    } else {
                      onBlockUser(user);
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isBlocked
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  {isBlocked ? 'Débloquer le membre' : 'Bloquer ce membre'}
                </button>
              ) : !isCurrentUser && isStaff ? (
                <div className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-[11px] text-slate-400 text-center border border-slate-700">
                  🛡️ Staff officiel (non-bloquable)
                </div>
              ) : null}

              {canModerate && (
                <button
                  onClick={() => {
                    onOpenModeration(user);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Modération
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

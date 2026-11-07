import React, { useState } from 'react';
import {
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  Shield,
  Crown,
  Star,
  MessageCircle,
  Ban,
  Search,
  Hash,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Bot,
  Globe,
  Activity,
  Cpu,
  VolumeX,
  UserX,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { GENDER_CONFIG } from '../data/initialData';

interface UserListProps {
  users: UserProfile[];
  currentUserId: string;
  activeRoomName: string;
  onOpenPV: (user: UserProfile) => void;
  onSelectUser: (user: UserProfile) => void;
  blockedUserIds: string[];
  currentUser?: UserProfile;
  onClose?: () => void;
  onModerate?: (user: UserProfile, action: 'kick' | 'ban' | 'mute' | 'warn') => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  activeRoomName,
  onOpenPV,
  onSelectUser,
  blockedUserIds,
  currentUser,
  onClose,
  onModerate,
}) => {
  const [search, setSearch] = useState('');
  const [adminDiagMode, setAdminDiagMode] = useState(false);

  const isAdminOrModo =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'op' ||
    currentUser?.role === 'modo';

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      u.pseudo.toLowerCase().includes(term) ||
      u.location.toLowerCase().includes(term) ||
      (u.ipAddress && u.ipAddress.toLowerCase().includes(term)) ||
      (u.currentRadioName && u.currentRadioName.toLowerCase().includes(term))
    );
  });

  // Split into three distinct groups:
  // 1. Administration / Staff
  // 2. Regular Members
  // 3. Bots ("les bits") rassemblés en bas !
  const adminUsers = filteredUsers.filter((u) => !u.isBot && (u.role === 'admin' || u.role === 'op' || u.role === 'modo'));
  const regularUsers = filteredUsers.filter((u) => !u.isBot && u.role === 'user');
  const botUsers = filteredUsers.filter((u) => u.isBot);

  // Count users specifically in current active room
  const usersInCurrentRoom = users.filter((u) =>
    u.currentRooms.includes(activeRoomName)
  ).length;

  const getMachineIcon = (machine: string) => {
    switch (machine) {
      case 'smartphone':
        return (
          <span title="Smartphone">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          </span>
        );
      case 'tablette':
        return (
          <span title="Tablette">
            <Tablet className="w-3.5 h-3.5 text-slate-400" />
          </span>
        );
      case 'pc':
      default:
        return (
          <span title="PC / Bureau">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span
            className="flex items-center gap-1 text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded"
            title="Administrateur du site"
          >
            <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
            Admin
          </span>
        );
      case 'op':
        return (
          <span
            className="flex items-center gap-1 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded"
            title="Opérateur du salon"
          >
            <Shield className="w-3 h-3 text-emerald-400" />
            OP
          </span>
        );
      case 'modo':
        return (
          <span
            className="flex items-center gap-1 text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded"
            title="Modérateur"
          >
            <Star className="w-3 h-3 text-cyan-400" />
            Modo
          </span>
        );
      default:
        return null;
    }
  };

  const renderUserCard = (user: UserProfile, isBotSection = false) => {
    const isCurrentUser = user.id === currentUserId;
    const isBlocked = blockedUserIds.includes(user.id);
    const genderCfg = GENDER_CONFIG[user.gender] || GENDER_CONFIG.neutre;

    return (
      <div
        key={user.id}
        onDoubleClick={() => !isCurrentUser && onOpenPV(user)}
        onClick={() => onSelectUser(user)}
        className={`group p-2.5 rounded-xl border transition-all cursor-pointer relative select-none ${
          isCurrentUser
            ? 'bg-slate-800/90 border-emerald-500/50 ring-1 ring-emerald-500/30'
            : isBotSection
            ? 'bg-slate-950/30 border-slate-800/40 hover:bg-slate-800/40'
            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
        } ${isBlocked ? 'opacity-40' : ''}`}
      >
        {/* Row 1: Online Dot + Pseudo with strict gender color + Roles & Icons */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBotSection ? 'bg-cyan-400' : 'bg-emerald-500'
                }`}
              ></span>
            </span>

            {/* Pseudo colored strictly according to requirement */}
            <span
              className={`font-extrabold text-xs truncate ${genderCfg.textClass}`}
              title={`${user.pseudo} (${genderCfg.label})`}
            >
              {user.pseudo}
            </span>

            {isCurrentUser && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                (Moi)
              </span>
            )}

            {user.isRegistered && (
              <span title="Pseudo protégé et enregistré">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              </span>
            )}

            {user.isBot && (
              <span className="text-[9px] bg-slate-800/90 border border-slate-700 text-slate-300 px-1 py-0.2 rounded font-mono flex items-center gap-0.5">
                <Bot className="w-2.5 h-2.5 text-cyan-400" />
                bot
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {getRoleBadge(user.role)}
            <div title={`Machine: ${user.machine}`}>
              {getMachineIcon(user.machine)}
            </div>
          </div>
        </div>

        {/* Row 2: Demographics (Real Location, Age, Gender) */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 gap-1">
          <span className="truncate flex items-center gap-1 text-slate-300 font-medium">
            {user.location}
          </span>
          <span className="flex-shrink-0 text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 font-semibold">
            {user.age} ans • {user.gender.toUpperCase()}
          </span>
        </div>

        {/* Row 3: Webradio listened to right now & Rooms */}
        <div className="mt-1 pt-1 border-t border-slate-800/50 flex items-center justify-between gap-1 text-[10px]">
          <div className="flex items-center gap-1 truncate text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              {user.currentRadioName ? (
                <span className="text-emerald-400 font-medium">
                  {user.currentRadioName}
                </span>
              ) : (
                <span className="text-slate-400">Silence radio</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 text-slate-400">
            <Hash className="w-2.5 h-2.5" />
            <span>{user.currentRooms[0] || '#Général'}</span>
          </div>
        </div>

        {/* ADMIN DIAGNOSTIC PANEL: IP Address, ISP, Device Model & Quick Moderation */}
        {isAdminOrModo && (adminDiagMode || isCurrentUser) && (
          <div className="mt-2 pt-2 border-t border-amber-500/30 bg-slate-900/90 p-2 rounded-lg text-[10px] space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-400" />
                IP : <span className="font-mono text-slate-200">{user.ipAddress || '105.101.48.214'}</span>
              </span>
              <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-400">
                {user.isp || 'Algérie Télécom'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[9px]">
              <span className="truncate">
                🖥️ {user.deviceModel || 'PC / Android'} {user.os ? `(${user.os})` : ''}
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <Activity className="w-2.5 h-2.5" /> 28 ms
              </span>
            </div>

            {/* Admin quick moderation actions */}
            {!isCurrentUser && onModerate && (
              <div className="flex items-center gap-1 pt-1 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onModerate(user, 'warn')}
                  className="flex-1 py-0.5 px-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[9px] font-bold flex items-center justify-center gap-0.5"
                  title="Avertir l'utilisateur"
                >
                  <AlertTriangle className="w-2.5 h-2.5" /> Warn
                </button>
                <button
                  type="button"
                  onClick={() => onModerate(user, 'mute')}
                  className="flex-1 py-0.5 px-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-[9px] font-bold flex items-center justify-center gap-0.5"
                  title="Mettre en sourdine"
                >
                  <VolumeX className="w-2.5 h-2.5" /> Mute
                </button>
                <button
                  type="button"
                  onClick={() => onModerate(user, 'kick')}
                  className="flex-1 py-0.5 px-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded text-[9px] font-bold flex items-center justify-center gap-0.5"
                  title="Expulser du salon"
                >
                  <UserX className="w-2.5 h-2.5" /> Kick
                </button>
                <button
                  type="button"
                  onClick={() => onModerate(user, 'ban')}
                  className="flex-1 py-0.5 px-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-[9px] font-bold flex items-center justify-center gap-0.5"
                  title="Bannir l'IP et le pseudo"
                >
                  <Ban className="w-2.5 h-2.5" /> Ban
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hover Quick Action Buttons */}
        {!isCurrentUser && (
          <div className="hidden group-hover:flex items-center gap-1 absolute right-2 top-2 bg-slate-900/95 border border-slate-700 rounded-lg p-0.5 shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPV(user);
              }}
              className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors"
              title="Envoyer un message privé (PV)"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectUser(user);
              }}
              className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
              title="Voir le profil complet"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-l border-slate-800/80">
      {/* Header with counter and Admin Diag Toggle */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 truncate">
            <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-200 truncate">
              Connectés
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {usersInCurrentRoom}/{users.length}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all text-xs font-bold shadow-sm active:scale-95"
                title="Réduire la liste des pseudos"
              >
                <X className="w-3.5 h-3.5" />
                <span>Réduire</span>
              </button>
            )}
          </div>
        </div>

        {/* Color legend reminder */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 pb-2 border-b border-slate-800/60">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
            Rose : F
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            Bleu : H
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
            Mauve : Ado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
            Gris : N
          </span>
        </div>

        {/* Admin Diagnostic Switcher (visible for staff) */}
        {isAdminOrModo && (
          <div className="mt-2 pt-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-400" />
              Diagnostics IP & Appareils
            </span>
            <button
              type="button"
              onClick={() => setAdminDiagMode(!adminDiagMode)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                adminDiagMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {adminDiagMode ? 'Activé (ON)' : 'Afficher (OFF)'}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mt-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher pseudo, ville, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Users list grouped into sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* 1. ADMINISTRATION & MODERATION */}
        {adminUsers.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              <span>Administration & Modération ({adminUsers.length})</span>
            </div>
            <div className="space-y-1.5 mt-1">
              {adminUsers.map((u) => renderUserCard(u))}
            </div>
          </div>
        )}

        {/* 2. REGULAR MEMBERS */}
        <div>
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Membres en ligne ({regularUsers.length})</span>
          </div>
          <div className="space-y-1.5 mt-1">
            {regularUsers.length > 0 ? (
              regularUsers.map((u) => renderUserCard(u))
            ) : (
              <p className="text-[11px] text-slate-400 px-2 italic">Aucun membre supplémentaire.</p>
            )}
          </div>
        </div>

        {/* 3. BOTS & SALONS RASSEMBLÉS EN BAS */}
        {botUsers.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-cyan-400">
                <Bot className="w-3 h-3" />
                Bots Système & Animation ({botUsers.length})
              </span>
              <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                en bas
              </span>
            </div>
            <div className="space-y-1.5 mt-1">
              {botUsers.map((u) => renderUserCard(u, true))}
            </div>
          </div>
        )}
      </div>

      {onClose && (
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <X className="w-4 h-4 text-emerald-400" />
            <span>Fermer la liste & retourner au tchat</span>
          </button>
        </div>
      )}
    </div>
  );
};

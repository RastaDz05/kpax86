import React from 'react';
import {
  MessageSquare,
  Compass,
  MapPin,
  Music,
  Heart,
  Sun,
  Mountain,
  Cpu,
  Trophy,
  Users,
  X,
  Check,
  Hash,
  Sparkles,
} from 'lucide-react';
import { Room } from '../types';

interface RoomListModalProps {
  rooms: Room[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ROOM_ICONS: Record<string, React.FC<{ className?: string }>> = {
  MessageSquare,
  Compass,
  MapPin,
  Music,
  Heart,
  Sun,
  Mountain,
  Cpu,
  Trophy,
};

export const RoomListModal: React.FC<RoomListModalProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Salons de discussion
                <span className="text-[11px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {rooms.length} salons disponibles
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Rejoignez le salon de votre région, passion ou communauté
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

        {/* Rooms Grid / List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {rooms.map((room) => {
            const isSelected = room.id === activeRoomId;
            const IconComponent = ROOM_ICONS[room.iconName] || MessageSquare;

            return (
              <div
                key={room.id}
                onClick={() => {
                  onSelectRoom(room.id);
                  onClose();
                }}
                className={`group p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-800 text-emerald-400 border-slate-700 group-hover:border-emerald-500/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`font-bold text-sm tracking-wide ${
                          isSelected ? 'text-emerald-300' : 'text-slate-100 group-hover:text-emerald-400'
                        }`}
                      >
                        {room.name}
                      </h4>
                      {room.isOfficial && (
                        <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-semibold uppercase">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      {room.description}
                    </p>
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/60">
                      Topic : {room.topic}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{room.userCount}</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-auto">
                      <Check className="w-3.5 h-3.5" />
                      Connecté
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tapez <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">/topic &lt;texte&gt;</code> pour changer le topic (Modos/Admins).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

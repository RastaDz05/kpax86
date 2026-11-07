import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Lock,
  Sparkles,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { GenderType, MachineType, UserProfile } from '../types';
import { GENDER_CONFIG } from '../data/initialData';

interface AuthModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: Partial<UserProfile>, isRegistration: boolean) => void;
}

const DZ_CITIES = [
  '🇩🇿 Alger (El Bahdja)',
  '🇩🇿 Oran (El Bahia)',
  '🇩🇿 Constantine (Cirta)',
  '🇩🇿 Annaba (Bône)',
  '🇩🇿 Tizi Ouzou',
  '🇩🇿 Bejaia (Bgayet)',
  '🇩🇿 Sétif (El Fouara)',
  '🇩🇿 Batna (Aurès)',
  '🇩🇿 Blida (Ville des Roses)',
  '🇩🇿 Tlemcen',
  '🇩🇿 Mostaganem',
  '🇫🇷 Paris & Île-de-France',
  '🇫🇷 Marseille & PACA',
  '🇫🇷 Lyon & Rhône-Alpes',
  '🇫🇷 Lille & Nord',
  '🇫🇷 Toulouse',
  '🇫🇷 Bordeaux',
  '🇨🇦 Montréal (Diaspora)',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'register'>(
    currentUser.isRegistered ? 'profile' : 'register'
  );
  const [pseudo, setPseudo] = useState(currentUser.pseudo);
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<GenderType>(currentUser.gender);
  const [age, setAge] = useState<number>(currentUser.age || 22);
  const [location, setLocation] = useState(currentUser.location || DZ_CITIES[0]);
  const [machine, setMachine] = useState<MachineType>(currentUser.machine || 'pc');
  const [bio, setBio] = useState(currentUser.bio || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) return;

    const isRegister = activeTab === 'register';

    onSaveProfile(
      {
        pseudo: pseudo.trim(),
        gender,
        age: Number(age) || 20,
        location,
        countryCode: location.includes('🇩🇿') ? 'DZ' : location.includes('🇫🇷') ? 'FR' : 'OTHER',
        machine,
        bio: bio.trim(),
        isRegistered: currentUser.isRegistered || isRegister,
        registeredAt: currentUser.isRegistered
          ? currentUser.registeredAt
          : isRegister
          ? new Date().toISOString().split('T')[0]
          : undefined,
      },
      isRegister
    );

    if (isRegister) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#ffffff', '#ef4444', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {currentUser.isRegistered
                  ? 'Modifier mon profil'
                  : 'Mon Profil & Enregistrement'}
              </h3>
              <p className="text-xs text-slate-400">
                Mode invité ou pseudo protégé avec code secret
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

        {/* Tab switcher */}
        {!currentUser.isRegistered && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode Invité
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-slate-950 shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Enregistrer mon pseudo ✨
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Pseudo */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Votre Pseudo
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: Fennec_Oran, Yasmine_DZ..."
                className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 font-bold focus:border-emerald-500/60 focus:outline-none"
              />
              {currentUser.isRegistered && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Enregistré
                </span>
              )}
            </div>
          </div>

          {/* Password (if registering) */}
          {activeTab === 'register' && !currentUser.isRegistered && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Mot de passe de protection
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez un mot de passe ou code PIN..."
                className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-emerald-500/30 text-slate-100 focus:outline-none"
              />
              <p className="text-[10px] text-emerald-300/80 mt-1">
                Protège votre pseudo contre toute usurpation et débloque le badge certifié !
              </p>
            </div>
          )}

          {/* Gender selection with exact prompt colors */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Genre & Couleur de pseudo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['femme', 'homme', 'ado', 'neutre'] as GenderType[]).map((g) => {
                const cfg = GENDER_CONFIG[g];
                const isSelected = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? `${cfg.bgBadgeClass} ring-1 ring-emerald-500 shadow-md`
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cfg.colorHex }}
                    />
                    <div className="text-left">
                      <span className={`block font-bold text-xs ${cfg.textClass}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {g === 'femme'
                          ? 'Rose'
                          : g === 'homme'
                          ? 'Bleu'
                          : g === 'ado'
                          ? 'Mauve'
                          : 'Gris'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age & Device */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Âge
              </label>
              <input
                type="number"
                min={13}
                max={99}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-200 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Type de machine
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMachine('pc')}
                  className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-colors ${
                    machine === 'pc' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'
                  }`}
                  title="Ordinateur"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMachine('smartphone')}
                  className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-colors ${
                    machine === 'smartphone' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                  }`}
                  title="Smartphone"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMachine('tablette')}
                  className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-colors ${
                    machine === 'tablette' ? 'bg-slate-800 text-purple-400' : 'text-slate-400'
                  }`}
                  title="Tablette"
                >
                  <Tablet className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Ville & Géolocalisation
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-200 text-xs font-medium focus:border-emerald-500/60 focus:outline-none"
            >
              {DZ_CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Petite phrase / Bio
            </label>
            <input
              type="text"
              maxLength={120}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex: Fièrement DZ, passion musique et rencontres sympas !"
              className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-200 text-xs focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-xl transition-all hover:scale-[1.01]"
            >
              {activeTab === 'register' && !currentUser.isRegistered
                ? 'Valider & Enregistrer mon pseudo 🇩🇿'
                : 'Mettre à jour mon profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

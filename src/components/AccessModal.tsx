import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  Cpu,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { GenderType, MachineType, UserProfile } from '../types';
import { GENDER_CONFIG } from '../data/initialData';
import {
  findAccountByPseudo,
  isPseudoRegistered,
  registerAccount,
  verifyCredentials,
} from '../services/accountService';
import { fetchRealIPAndLocation, DeviceDiagnosticInfo } from '../services/deviceDiagnostics';

interface AccessModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose?: () => void;
  onCompleteAccess: (updatedUser: Partial<UserProfile>) => void;
  isFirstVisit?: boolean;
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
  '🇩🇿 Chlef',
  '🇩🇿 Biskra (Porte du Sahara)',
  '🇫🇷 Paris & Île-de-France',
  '🇫🇷 Marseille & PACA',
  '🇫🇷 Lyon & Rhône-Alpes',
  '🇫🇷 Lille & Nord',
  '🇫🇷 Toulouse',
  '🇨🇦 Montréal (Diaspora)',
];

export const AccessModal: React.FC<AccessModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onCompleteAccess,
  isFirstVisit = false,
}) => {
  const [pseudo, setPseudo] = useState(currentUser.pseudo || '');
  const [gender, setGender] = useState<GenderType>(currentUser.gender || 'homme');
  const [age, setAge] = useState<number>(currentUser.age || 24);
  const [location, setLocation] = useState<string>(currentUser.location || DZ_CITIES[0]);
  const [protectWithPassword, setProtectWithPassword] = useState<boolean>(currentUser.isRegistered || false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [diagInfo, setDiagInfo] = useState<DeviceDiagnosticInfo | null>(null);
  const [isLoadingIP, setIsLoadingIP] = useState(true);

  // Check if current typed pseudo is already registered
  const isExistingProtected = isPseudoRegistered(pseudo);

  // Fetch real IP & Diagnostics on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingIP(true);
    fetchRealIPAndLocation()
      .then((info) => {
        if (!isMounted) return;
        setDiagInfo(info);
        setIsLoadingIP(false);
        // If location is default, set to detected real city
        if (!currentUser.isRegistered && info.realCity) {
          const match = DZ_CITIES.find((c) => c.toLowerCase().includes(info.realCity.toLowerCase().replace('🇩🇿', '').replace('🇫🇷', '').trim()));
          if (match) {
            setLocation(match);
          } else {
            setLocation(`${info.countryCode === 'DZ' ? '🇩🇿' : '🇫🇷'} ${info.realCity}`);
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingIP(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser.isRegistered]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPseudo = pseudo.trim();
    if (cleanPseudo.length < 3) {
      setErrorMsg('Veuillez entrer un pseudo d\'au moins 3 caractères.');
      return;
    }

    const machine: MachineType = diagInfo?.machine || currentUser.machine || 'smartphone';
    const ipAddress = diagInfo?.ipAddress || currentUser.ipAddress || '105.101.48.214';
    const isp = diagInfo?.isp || currentUser.isp || 'Algérie Télécom';
    const deviceModel = diagInfo?.deviceModel || currentUser.deviceModel || 'Mobile';
    const browser = diagInfo?.browser || currentUser.browser || 'Navigateur';
    const os = diagInfo?.os || currentUser.os || 'Android';

    const countryCode: 'DZ' | 'FR' | 'OTHER' = location.includes('🇩🇿')
      ? 'DZ'
      : location.includes('🇫🇷')
      ? 'FR'
      : 'OTHER';

    // Scenario 1: Pseudo is already registered and protected
    if (isExistingProtected) {
      if (!password) {
        setErrorMsg('Ce pseudo est protégé par un mot de passe. Veuillez le renseigner.');
        return;
      }
      const verify = verifyCredentials(cleanPseudo, password);
      if (!verify.success) {
        setErrorMsg(verify.error || 'Mot de passe incorrect pour ce pseudo.');
        return;
      }

      onCompleteAccess({
        pseudo: cleanPseudo,
        gender: verify.account?.gender || gender,
        age: verify.account?.age || age,
        location: verify.account?.location || location,
        countryCode: verify.account?.countryCode || countryCode,
        machine,
        ipAddress,
        isp,
        deviceModel,
        browser,
        os,
        isRegistered: true,
        isPasswordProtected: true,
      });

      if (onClose) onClose();
      return;
    }

    // Scenario 2: New Registration with Password
    if (protectWithPassword) {
      if (!password || password.length < 3) {
        setErrorMsg('Veuillez définir un mot de passe de protection (minimum 3 caractères).');
        return;
      }

      const reg = registerAccount(cleanPseudo, password, {
        gender,
        age,
        location,
        countryCode,
        machine,
      });

      if (!reg.success) {
        setErrorMsg(reg.error || 'Erreur lors de l\'enregistrement.');
        return;
      }

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#006233', '#ffffff', '#d21034', '#10b981'],
        });
      } catch {
        // ignore
      }

      onCompleteAccess({
        pseudo: cleanPseudo,
        gender,
        age,
        location,
        countryCode,
        machine,
        ipAddress,
        isp,
        deviceModel,
        browser,
        os,
        isRegistered: true,
        isPasswordProtected: true,
        registeredAt: new Date().toISOString().split('T')[0],
      });

      if (onClose) onClose();
      return;
    }

    // Scenario 3: Fast Guest Mode (Invité)
    onCompleteAccess({
      pseudo: cleanPseudo,
      gender,
      age,
      location,
      countryCode,
      machine,
      ipAddress,
      isp,
      deviceModel,
      browser,
      os,
      isRegistered: false,
      isPasswordProtected: false,
    });

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header with Algerian Identity */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-emerald-500/40 p-1 flex items-center justify-center shadow-lg relative flex-shrink-0">
              <svg className="w-full h-full rounded" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="32" fill="#006233" />
                <rect x="16" width="16" height="32" fill="#ffffff" />
                <path d="M18 10a7 7 0 1 0 0 12 6 6 0 1 1 0-12z" fill="#d21034" />
                <polygon points="18,13.5 19.3,15.2 21.5,14.8 20.2,16.5 21.5,18.2 19.3,17.8 18,19.5 18.2,17.3 16.5,16.5 18.2,15.7" fill="#d21034" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight font-[Cabinet_Grotesk]">
                  Algerie<span className="text-emerald-400">.cool</span>
                </h3>
                <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded uppercase">
                  DZ LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Boîte d'accès simplifiée & Enregistrement de pseudo
              </p>
            </div>
          </div>

          {!isFirstVisit && onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Real IP & Device Diagnostics banner */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 truncate text-slate-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200 truncate">
              {isLoadingIP ? (
                'Détection IP & appareil en cours...'
              ) : (
                <>
                  <span className="text-emerald-400 font-mono font-bold">{diagInfo?.ipAddress}</span> •{' '}
                  <span className="text-slate-300">{diagInfo?.realCity}</span> •{' '}
                  <span className="text-slate-400">{diagInfo?.deviceModel}</span>
                </>
              )}
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
            ✓ IP Sécurisée
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Pseudo input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                1. Choisissez votre Pseudo
              </label>
              {isExistingProtected ? (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Pseudo protégé
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-medium">
                  ✓ Pseudo disponible
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={30}
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: Fennec_Oran, Yasmine_DZ, Riad_Paris..."
                className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-700 text-slate-100 font-bold text-sm focus:border-emerald-500 focus:outline-none transition-colors"
              />
              {isExistingProtected && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold">
                  Enregistré
                </span>
              )}
            </div>
          </div>

          {/* 2. Password section: if pseudo is protected, or user wants to protect it */}
          {isExistingProtected ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-amber-300 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Ce pseudo est protégé par mot de passe
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Veuillez saisir votre mot de passe pour vous authentifier avec ce compte certifié :
              </p>
              <div className="relative pt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe..."
                  className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-amber-500/40 text-slate-100 focus:outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Protéger ce pseudo par mot de passe ?
                </span>
                <input
                  type="checkbox"
                  checked={protectWithPassword}
                  onChange={(e) => setProtectWithPassword(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              {protectWithPassword && (
                <div className="pt-1 space-y-1.5 animate-fade-in">
                  <p className="text-[10px] text-emerald-300">
                    Définissez un mot de passe ou code secret pour réserver définitivement ce pseudo :
                  </p>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe de protection (ex: alger2025)..."
                      className="w-full bg-slate-900 px-3 py-2 rounded-lg border border-emerald-500/40 text-slate-100 focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Gender selection with exact prompt colors */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              2. Genre & Couleur dans la liste des connectés
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
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                      isSelected
                        ? `${cfg.bgBadgeClass} ring-2 ring-emerald-500 shadow-md`
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow"
                      style={{ backgroundColor: cfg.colorHex }}
                    />
                    <div className="min-w-0">
                      <span className={`block font-extrabold text-xs leading-tight ${cfg.textClass}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {g === 'femme'
                          ? 'Rose (Femme)'
                          : g === 'homme'
                          ? 'Bleu (Homme)'
                          : g === 'ado'
                          ? 'Mauve (Ado)'
                          : 'Gris (Neutre)'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Age & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                3. Âge
              </label>
              <input
                type="number"
                min={13}
                max={99}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                4. Ville & Localisation
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-slate-200 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
              >
                {DZ_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-slate-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              {isExistingProtected ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter & Entrer sur Algerie.cool 🇩🇿</span>
                </>
              ) : protectWithPassword ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Enregistrer mon pseudo & Entrer ✨</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Entrer en mode invité direct 🇩🇿</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

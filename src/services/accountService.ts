import { GenderType, MachineType, UserProfile } from '../types';

export interface RegisteredAccount {
  pseudo: string;
  passwordHash: string; // Plain or hashed string for client validation
  gender: GenderType;
  age: number;
  location: string;
  countryCode: 'DZ' | 'FR' | 'OTHER';
  machine: MachineType;
  registeredAt: string;
}

const STORAGE_KEY = 'algerie_cool_registered_accounts';

/**
 * Get all registered accounts from local persistence
 */
export function getRegisteredAccounts(): Record<string, RegisteredAccount> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Pre-seeded protected accounts (e.g. admin, rosalyne)
  const defaultAccounts: Record<string, RegisteredAccount> = {
    admin_dz: {
      pseudo: 'Admin_DZ',
      passwordHash: 'admin123',
      gender: 'homme',
      age: 30,
      location: '🇩🇿 Alger (El Bahdja)',
      countryCode: 'DZ',
      machine: 'pc',
      registeredAt: '2025-01-01',
    },
    rosalyne: {
      pseudo: 'rosalyne',
      passwordHash: 'rose2025',
      gender: 'femme',
      age: 23,
      location: '🇩🇿 Alger (Bab El Oued)',
      countryCode: 'DZ',
      machine: 'smartphone',
      registeredAt: '2025-01-10',
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAccounts));
  } catch {
    // ignore
  }

  return defaultAccounts;
}

/**
 * Check if a pseudo is registered
 */
export function isPseudoRegistered(pseudo: string): boolean {
  if (!pseudo) return false;
  const accounts = getRegisteredAccounts();
  const normalized = pseudo.trim().toLowerCase();
  return Object.keys(accounts).some((key) => key.toLowerCase() === normalized);
}

/**
 * Find account by pseudo
 */
export function findAccountByPseudo(pseudo: string): RegisteredAccount | null {
  if (!pseudo) return null;
  const accounts = getRegisteredAccounts();
  const normalized = pseudo.trim().toLowerCase();
  const foundKey = Object.keys(accounts).find((k) => k.toLowerCase() === normalized);
  return foundKey ? accounts[foundKey] : null;
}

/**
 * Register a new pseudo with password protection
 */
export function registerAccount(
  pseudo: string,
  password: string,
  profile: Partial<UserProfile>
): { success: boolean; error?: string; account?: RegisteredAccount } {
  const cleanPseudo = pseudo.trim();
  if (cleanPseudo.length < 3) {
    return { success: false, error: 'Le pseudo doit comporter au moins 3 caractères.' };
  }
  if (!password || password.length < 3) {
    return { success: false, error: 'Le mot de passe doit comporter au moins 3 caractères.' };
  }

  const accounts = getRegisteredAccounts();
  const normalized = cleanPseudo.toLowerCase();

  // If already exists
  if (Object.keys(accounts).some((k) => k.toLowerCase() === normalized)) {
    return { success: false, error: 'Ce pseudo est déjà enregistré. Connectez-vous avec son mot de passe.' };
  }

  const newAccount: RegisteredAccount = {
    pseudo: cleanPseudo,
    passwordHash: password,
    gender: profile.gender || 'homme',
    age: profile.age || 22,
    location: profile.location || '🇩🇿 Alger',
    countryCode: profile.countryCode || 'DZ',
    machine: profile.machine || 'smartphone',
    registeredAt: new Date().toISOString().split('T')[0],
  };

  accounts[cleanPseudo] = newAccount;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }

  return { success: true, account: newAccount };
}

/**
 * Verify credentials for a registered pseudo
 */
export function verifyCredentials(
  pseudo: string,
  password: string
): { success: boolean; error?: string; account?: RegisteredAccount } {
  const account = findAccountByPseudo(pseudo);
  if (!account) {
    return { success: false, error: 'Ce pseudo n\'est pas encore enregistré.' };
  }
  if (account.passwordHash !== password) {
    return { success: false, error: 'Mot de passe incorrect pour ce pseudo.' };
  }
  return { success: true, account };
}

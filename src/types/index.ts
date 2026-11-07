export type GenderType = 'femme' | 'homme' | 'ado' | 'neutre';

export type UserRole = 'admin' | 'op' | 'modo' | 'user';

export type MachineType = 'pc' | 'smartphone' | 'tablette';

export interface UserProfile {
  id: string;
  pseudo: string;
  gender: GenderType;
  age: number;
  location: string; // e.g. "🇩🇿 Alger", "🇫🇷 Paris (11e)", "🇫🇷 Marseille", "🇩🇿 Oran"
  countryCode: 'DZ' | 'FR' | 'OTHER';
  machine: MachineType;
  currentRadioId?: string;
  currentRadioName?: string;
  currentRooms: string[]; // e.g. ["#Général", "#Rai-Chaabi"]
  role: UserRole;
  isRegistered: boolean;
  registeredAt?: string;
  bio?: string;
  avatarUrl?: string;
  isMuted?: boolean;
  isBanned?: boolean;
  isBot?: boolean;
  ipAddress?: string;
  realCity?: string;
  realCountry?: string;
  isp?: string;
  deviceModel?: string;
  browser?: string;
  os?: string;
  isPasswordProtected?: boolean;
  passwordHash?: string;
  joinedAt: number;
}

export interface YouTubeCardData {
  url: string;
  videoId: string;
  title: string;
  channelName: string;
  viewsText: string;
  thumbnailUrl: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: UserProfile;
  content: string;
  color?: string; // custom hex color chosen by user
  timestamp: number;
  isSystem?: boolean;
  systemType?: 'join' | 'leave' | 'kick' | 'ban' | 'warn' | 'topic' | 'clear' | 'info';
  youtubeData?: YouTubeCardData;
  reactions?: Record<string, string[]>; // mapping of emoji to list of userIds
}

export interface PrivateMessage {
  id: string;
  fromId: string;
  fromPseudo: string;
  toId: string;
  toPseudo: string;
  content: string;
  color?: string;
  timestamp: number;
}

export interface PrivateConversation {
  partner: UserProfile;
  messages: PrivateMessage[];
  unreadCount: number;
  isMinimized: boolean;
  isOpen: boolean;
}

export interface Room {
  id: string; // e.g. "general"
  name: string; // e.g. "#Général"
  description: string;
  topic: string;
  iconName: string;
  userCount: number;
  isOfficial?: boolean;
}

export interface RadioStation {
  id: string;
  name: string;
  tagline: string;
  genre: string;
  streamUrl: string;
  location: string;
  logo: string;
  listenersCount: number;
  countryCode?: 'DZ' | 'FR' | 'INT';
  isAlgerianTheme?: boolean;
  bitrate?: string;
}

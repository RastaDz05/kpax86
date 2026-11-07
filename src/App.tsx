/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Algerie.cool - Plateforme Tchat Live & Webradios Diaspora
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { RoomListModal } from './components/RoomListModal';
import { RadioPlayer } from './components/RadioPlayer';
import { RadioPlayerBar } from './components/RadioPlayerBar';
import { UserList } from './components/UserList';
import { ChatRoom } from './components/ChatRoom';
import { MessageInput } from './components/MessageInput';
import { FloatingYouTubePlayer } from './components/FloatingYouTubePlayer';
import { PrivateChatDock } from './components/PrivateChatDock';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { AccessModal } from './components/AccessModal';
import { ModerationModal } from './components/ModerationModal';
import { fetchRealIPAndLocation } from './services/deviceDiagnostics';

import {
  ChatMessage,
  GenderType,
  MachineType,
  PrivateConversation,
  RadioStation,
  Room,
  UserProfile,
  UserRole,
  YouTubeCardData,
} from './types';
import {
  INITIAL_BOTS,
  INITIAL_RADIOS,
  INITIAL_ROOMS,
  CHAT_COLORS,
} from './data/initialData';
import { soundEffects } from './services/soundEffects';
import { extractYouTubeId, extractYouTubeUrl, fetchYouTubeMetadata } from './services/youtubeService';
import {
  syncUserPresence,
  subscribeToRoomMessages,
  postRoomMessage,
  clearRoomFirestoreMessages,
  updateMessageReactionsFirestore,
} from './services/firebaseSync';
import { LIGHT_WALLPAPERS, DARK_WALLPAPERS } from './data/wallpapers';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';

export default function App() {
  // --- Theme State (Dark / Light) ---
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // --- Sound Preference ---
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Current User State ---
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const isMobile =
      typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const defaultMachine: MachineType = isMobile ? 'smartphone' : 'pc';

    // Check localStorage for saved profile
    try {
      const saved = localStorage.getItem('algerie_cool_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    const randomNum = Math.floor(Math.random() * 899 + 100);
    return {
      id: `user_${Date.now()}_${randomNum}`,
      pseudo: `Visiteur_DZ${randomNum}`,
      gender: 'homme', // Bleu by default, easily customized in AuthModal
      age: 24,
      location: '🇩🇿 Alger (El Bahdja)',
      countryCode: 'DZ',
      machine: defaultMachine,
      currentRadioId: undefined,
      currentRadioName: undefined,
      currentRooms: ['#Général'],
      role: 'admin', // Admin by default so the user can test all mod commands (/ban, /kick, /mute, /warn, /clear) immediately!
      isRegistered: false,
      bio: 'Marhaban bikoum ! Fier d\'être sur Algerie.cool 🇩🇿',
      joinedAt: Date.now(),
    };
  });

  // --- Users List (Bots + Current User + simulated active members) ---
  const [users, setUsers] = useState<UserProfile[]>([...INITIAL_BOTS, currentUser]);

  // Sync currentUser changes into users list & localStorage
  useEffect(() => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === currentUser.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = currentUser;
        return next;
      }
      return [...prev, currentUser];
    });

    try {
      localStorage.setItem('algerie_cool_user', JSON.stringify(currentUser));
    } catch {
      // ignore
    }
    // Sync with Firestore database
    syncUserPresence(currentUser);
  }, [currentUser]);

  // --- Salons (Rooms) State ---
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('general');
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Real-time synchronization of active room messages with Firestore
  useEffect(() => {
    const unsubscribe = subscribeToRoomMessages(activeRoomId, (liveMessages) => {
      setMessagesByRoom((prev) => {
        const existing = prev[activeRoomId] || [];
        // Merge without duplicating IDs
        const existingIds = new Set(existing.map((m) => m.id));
        const newOnes = liveMessages.filter((m) => !existingIds.has(m.id));
        if (newOnes.length === 0) return prev;
        return {
          ...prev,
          [activeRoomId]: [...existing, ...newOnes],
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeRoomId]);

  // --- Webradios Master State & Persistent Audio Engine ---
  const [radios, setRadios] = useState<RadioStation[]>(INITIAL_RADIOS);
  const [activeRadio, setActiveRadio] = useState<RadioStation | null>(INITIAL_RADIOS[0]);
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('algerie_cool_volume');
      return saved !== null ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const [isRadioLoading, setIsRadioLoading] = useState<boolean>(false);
  const [hasRadioError, setHasRadioError] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Engine Lifecycle
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }
    const audio = audioRef.current;

    const handleWaiting = () => setIsRadioLoading(true);
    const handlePlaying = () => {
      setIsRadioLoading(false);
      setHasRadioError(false);
    };
    const handleError = () => {
      setIsRadioLoading(false);
      setHasRadioError(true);
      console.warn('Radio stream playback error, checking backup stream');
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update audio source and playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeRadio) {
      if (audio.src !== activeRadio.streamUrl) {
        audio.src = activeRadio.streamUrl;
        audio.load();
      }
      if (isPlayingRadio) {
        setIsRadioLoading(true);
        setHasRadioError(false);
        audio.play().catch((err) => {
          console.warn('Audio play restricted by browser policy:', err);
          setIsRadioLoading(false);
        });
      } else {
        audio.pause();
        setIsRadioLoading(false);
      }
    } else {
      audio.pause();
      setIsRadioLoading(false);
    }
  }, [activeRadio, isPlayingRadio]);

  // Volume & Mute control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isRadioMuted ? 0 : radioVolume;
    }
    try {
      localStorage.setItem('algerie_cool_volume', String(radioVolume));
    } catch {
      // ignore
    }
  }, [radioVolume, isRadioMuted]);

  // Subtle live broadcast listener variation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadios((prev) =>
        prev.map((r) => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return {
            ...r,
            listenersCount: Math.max(100, r.listenersCount + delta),
          };
        })
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // --- Messages State ---
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({
    general: [
      {
        id: 'msg_welcome_1',
        roomId: 'general',
        sender: INITIAL_BOTS[0], // rosalyne
        content: 'Salam alaykoum et marhaba bikoum sur Algerie.cool ! 🌸 Heureuse de vous accueillir dans le salon principal !',
        color: '#f472b6',
        timestamp: Date.now() - 1000 * 60 * 15,
        reactions: {
          '🌸': ['bot_rosalyne', 'bot_lynda'],
          '🇩🇿': ['bot_amine'],
        },
      },
      {
        id: 'msg_welcome_2',
        roomId: 'general',
        sender: INITIAL_BOTS[2], // lynda_paris
        content: 'Coucou tout le monde depuis Paris ! Branchez la webradio en haut, le son de Skyrock Alger et Beur FM tourne non-stop 📻✨',
        color: '#22d3ee',
        timestamp: Date.now() - 1000 * 60 * 10,
        reactions: {
          '📻': ['bot_amine', 'bot_rosalyne'],
          '🔥': ['bot_amine'],
        },
      },
      {
        id: 'msg_welcome_3',
        roomId: 'general',
        sender: INITIAL_BOTS[1], // amine_dz
        content: 'Marhaba bikoum ! Double-cliquez sur n\'importe quel pseudo pour démarrer un PV en tête-à-tête. Tahia El Djazair 🇩🇿 ⚽',
        color: '#10b981',
        timestamp: Date.now() - 1000 * 60 * 5,
        reactions: {
          '🇩🇿': ['bot_amine', 'bot_rosalyne', 'bot_lynda'],
          '⚽': ['bot_amine'],
        },
      },
    ],
    'diaspora-france': [
      {
        id: 'msg_dia_1',
        roomId: 'diaspora-france',
        sender: INITIAL_BOTS[2],
        content: 'Bienvenue aux Algériens de France et de toute l\'Europe ! Paris, Marseille, Lyon, partagez vos actualités.',
        timestamp: Date.now() - 1000 * 60 * 30,
      },
    ],
    'rai-chaabi': [
      {
        id: 'msg_rai_1',
        roomId: 'rai-chaabi',
        sender: INITIAL_BOTS[1],
        content: 'Le temple de la musique DZ ! Collez un lien YouTube ici pour lancer la vidéo en mode détachable 🎥',
        timestamp: Date.now() - 1000 * 60 * 45,
      },
    ],
  });

  // Current active room messages
  const activeRoomMessages = messagesByRoom[activeRoomId] || [];

  // --- Mod & Block State ---
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [mutedUserIds, setMutedUserIds] = useState<string[]>([]);
  const [bannedUserIds, setBannedUserIds] = useState<string[]>([]);

  // --- Private Messages (PV) State ---
  const [privateConversations, setPrivateConversations] = useState<
    Record<string, PrivateConversation>
  >({});
  const [activePVPartnerId, setActivePVPartnerId] = useState<string | null>(null);

  // --- Floating YouTube State ---
  const [floatingYouTube, setFloatingYouTube] = useState<YouTubeCardData | null>(null);

  // --- UI Modals State ---
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [isRadiosModalOpen, setIsRadiosModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(() => {
    try {
      const entered = localStorage.getItem('algerie_cool_entered');
      return !entered;
    } catch {
      return true;
    }
  });
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [moderationTargetUser, setModerationTargetUser] = useState<UserProfile | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [isUserListOpenOnMobile, setIsUserListOpenOnMobile] = useState(false);

  // --- Chat text color choice ---
  const [selectedTextColor, setSelectedTextColor] = useState<string>(CHAT_COLORS[0].hex);

  // --- Initial Mount: Theme, Sound initialization, Join Bip ---
  useEffect(() => {
    soundEffects.initSoundPreference();
    setSoundEnabled(soundEffects.isEnabled());

    // Play connection sound bip once user enters!
    const timer = setTimeout(() => {
      soundEffects.playJoinBip();
    }, 600);

    // Auto-detect real IP, ISP and device diagnostics
    fetchRealIPAndLocation()
      .then((diag) => {
        setCurrentUser((prev) => {
          if (prev.ipAddress) return prev;
          return {
            ...prev,
            ipAddress: diag.ipAddress,
            realCity: diag.realCity,
            realCountry: diag.realCountry,
            isp: diag.isp,
            deviceModel: diag.deviceModel,
            browser: diag.browser,
            os: diag.os,
            machine: prev.machine || diag.machine,
          };
        });
      })
      .catch(() => {});

    return () => clearTimeout(timer);
  }, []);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkTheme]);

  // --- Wallpaper Themes State (Light & Dark) ---
  const [currentLightWallpaperId, setCurrentLightWallpaperId] = useState<string>(() => {
    try {
      return localStorage.getItem('algerie_cool_wp_light') || 'alger_monument';
    } catch {
      return 'alger_monument';
    }
  });

  const [currentDarkWallpaperId, setCurrentDarkWallpaperId] = useState<string>(() => {
    try {
      return localStorage.getItem('algerie_cool_wp_dark') || 'alger_nuit';
    } catch {
      return 'alger_nuit';
    }
  });

  const [overlayOpacity, setOverlayOpacity] = useState<number>(() => {
    try {
      const val = localStorage.getItem('algerie_cool_overlay_opacity');
      return val ? parseFloat(val) : 0.65;
    } catch {
      return 0.65;
    }
  });

  const [backdropBlur, setBackdropBlur] = useState<number>(() => {
    try {
      const val = localStorage.getItem('algerie_cool_backdrop_blur');
      return val ? parseInt(val) : 2;
    } catch {
      return 2;
    }
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Active wallpaper resolution
  const currentWallpapersList = isDarkTheme ? DARK_WALLPAPERS : LIGHT_WALLPAPERS;
  const currentWallpaperId = isDarkTheme ? currentDarkWallpaperId : currentLightWallpaperId;
  const activeWallpaper =
    currentWallpapersList.find((w) => w.id === currentWallpaperId) || currentWallpapersList[0];

  // Zapper: Fast cycle to next wallpaper in current mode
  const handleZapWallpaper = () => {
    if (isDarkTheme) {
      const currentIdx = DARK_WALLPAPERS.findIndex((w) => w.id === currentDarkWallpaperId);
      const nextIdx = (currentIdx + 1) % DARK_WALLPAPERS.length;
      const nextWp = DARK_WALLPAPERS[nextIdx];
      setCurrentDarkWallpaperId(nextWp.id);
      try {
        localStorage.setItem('algerie_cool_wp_dark', nextWp.id);
      } catch {
        // ignore
      }
    } else {
      const currentIdx = LIGHT_WALLPAPERS.findIndex((w) => w.id === currentLightWallpaperId);
      const nextIdx = (currentIdx + 1) % LIGHT_WALLPAPERS.length;
      const nextWp = LIGHT_WALLPAPERS[nextIdx];
      setCurrentLightWallpaperId(nextWp.id);
      try {
        localStorage.setItem('algerie_cool_wp_light', nextWp.id);
      } catch {
        // ignore
      }
    }
    soundEffects.playMessageSound();
  };

  const handleSelectLightWallpaper = (id: string) => {
    setCurrentLightWallpaperId(id);
    try {
      localStorage.setItem('algerie_cool_wp_light', id);
    } catch {
      // ignore
    }
  };

  const handleSelectDarkWallpaper = (id: string) => {
    setCurrentDarkWallpaperId(id);
    try {
      localStorage.setItem('algerie_cool_wp_dark', id);
    } catch {
      // ignore
    }
  };

  const handleChangeOverlayOpacity = (opacity: number) => {
    setOverlayOpacity(opacity);
    try {
      localStorage.setItem('algerie_cool_overlay_opacity', opacity.toString());
    } catch {
      // ignore
    }
  };

  const handleChangeBackdropBlur = (blur: number) => {
    setBackdropBlur(blur);
    try {
      localStorage.setItem('algerie_cool_backdrop_blur', blur.toString());
    } catch {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setEnabled(next);
  };

  const handleToggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  // Switch Room
  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom) {
      // Update currentUser rooms
      setCurrentUser((prev) => ({
        ...prev,
        currentRooms: [targetRoom.name],
      }));
    }
  };

  // Webradio Selection & Play
  const handleSelectRadio = (radio: RadioStation) => {
    setActiveRadio(radio);
    setIsPlayingRadio(true);
    setHasRadioError(false);

    // Update user profile with radio being listened to!
    setCurrentUser((prev) => ({
      ...prev,
      currentRadioId: radio.id,
      currentRadioName: radio.name,
    }));
  };

  const handleToggleRadioPlay = () => {
    const next = !isPlayingRadio;
    setIsPlayingRadio(next);
    setHasRadioError(false);
    if (!next) {
      setCurrentUser((prev) => ({
        ...prev,
        currentRadioId: undefined,
        currentRadioName: undefined,
      }));
    } else if (activeRadio) {
      setCurrentUser((prev) => ({
        ...prev,
        currentRadioId: activeRadio.id,
        currentRadioName: activeRadio.name,
      }));
    }
  };

  const handleNextRadio = () => {
    if (!activeRadio) return;
    const currentIndex = radios.findIndex((r) => r.id === activeRadio.id);
    const nextIndex = (currentIndex + 1) % radios.length;
    handleSelectRadio(radios[nextIndex]);
  };

  const handlePrevRadio = () => {
    if (!activeRadio) return;
    const currentIndex = radios.findIndex((r) => r.id === activeRadio.id);
    const prevIndex = (currentIndex - 1 + radios.length) % radios.length;
    handleSelectRadio(radios[prevIndex]);
  };

  const handleVolumeChange = (newVol: number) => {
    setRadioVolume(newVol);
    if (isRadioMuted) setIsRadioMuted(false);
  };

  const handleToggleMute = () => {
    setIsRadioMuted((prev) => !prev);
  };

  // Connected chat users tuned into the active radio
  const connectedChatListenersCount = users.filter(
    (u) => u.currentRadioId === activeRadio?.id
  ).length;

  // --- Open PV (Double-click or Profile button) ---
  const handleOpenPV = (partner: UserProfile) => {
    if (partner.id === currentUser.id) return;

    // Check if partner is blocked
    if (blockedUserIds.includes(partner.id)) {
      alert(`Vous avez bloqué ${partner.pseudo}. Débloquez-le pour ouvrir un PV.`);
      return;
    }

    setPrivateConversations((prev) => {
      const existing = prev[partner.id];
      if (existing) {
        return {
          ...prev,
          [partner.id]: {
            ...existing,
            isOpen: true,
            isMinimized: false,
            unreadCount: 0,
          },
        };
      }
      return {
        ...prev,
        [partner.id]: {
          partner,
          messages: [],
          unreadCount: 0,
          isMinimized: false,
          isOpen: true,
        },
      };
    });

    setActivePVPartnerId(partner.id);
  };

  // --- Send Public Chat Message & IRC Command Parser ---
  const handleSendMessage = async (text: string, color: string) => {
    if (bannedUserIds.includes(currentUser.id)) {
      alert('Vous avez été banni de la plateforme par un administrateur.');
      return;
    }
    if (mutedUserIds.includes(currentUser.id)) {
      alert('Vous êtes actuellement en mode muet.');
      return;
    }

    // Check if message is an IRC Command
    if (text.startsWith('/')) {
      handleExecuteCommand(text);
      return;
    }

    // Check for YouTube link
    const ytVideoId = extractYouTubeId(text);
    const ytUrl = extractYouTubeUrl(text);
    let youtubeData: YouTubeCardData | undefined = undefined;

    if (ytVideoId) {
      youtubeData = await fetchYouTubeMetadata(ytVideoId, ytUrl || undefined);
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId: activeRoomId,
      sender: currentUser,
      content: text,
      color,
      timestamp: Date.now(),
      youtubeData,
    };

    setMessagesByRoom((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));

    // Post to Firestore database
    postRoomMessage(newMessage).catch((err) => {
      console.warn('Could not post message to Firestore:', err);
    });

    soundEffects.playMessageSound();

    // If YouTube link was posted, prompt or auto-open floating player
    if (youtubeData) {
      setFloatingYouTube(youtubeData);
    }

    // Simulate smart bot reactions if mentioned or in general
    triggerBotReactions(text, activeRoomId);
  };

  // --- Toggle Emoji Reaction on a Message ---
  const handleToggleReaction = (messageId: string, emoji: string) => {
    setMessagesByRoom((prev) => {
      const currentMessages = prev[activeRoomId] || [];
      const updatedMessages = currentMessages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions: Record<string, string[]> = { ...(msg.reactions || {}) };
        const userList: string[] = currentReactions[emoji] ? [...currentReactions[emoji]] : [];
        const userIdx = userList.indexOf(currentUser.id);

        if (userIdx >= 0) {
          // Remove reaction
          userList.splice(userIdx, 1);
        } else {
          // Add reaction
          userList.push(currentUser.id);
          soundEffects.playMessageSound();
        }

        if (userList.length === 0) {
          delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = userList;
        }

        // Sync reaction to Firestore database
        updateMessageReactionsFirestore(activeRoomId, messageId, currentReactions).catch(() => {});

        return {
          ...msg,
          reactions: currentReactions,
        };
      });

      return {
        ...prev,
        [activeRoomId]: updatedMessages,
      };
    });
  };

  // --- Command Execution (/ban, /kick, /mute, /warn, /clear, /admin, /op, /modo, /topic, /help) ---
  const handleExecuteCommand = (rawCommand: string) => {
    const parts = rawCommand.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const targetPseudo = parts[1];
    const extra = parts.slice(2).join(' ');

    const targetUser = users.find(
      (u) => u.pseudo.toLowerCase() === targetPseudo?.toLowerCase()
    );

    switch (cmd) {
      case '/clear': {
        setMessagesByRoom((prev) => ({
          ...prev,
          [activeRoomId]: [
            {
              id: `sys_clear_${Date.now()}`,
              roomId: activeRoomId,
              sender: currentUser,
              content: `🧹 Le salon ${activeRoom.name} a été nettoyé par ${currentUser.pseudo}.`,
              timestamp: Date.now(),
              isSystem: true,
              systemType: 'clear',
            },
          ],
        }));
        clearRoomFirestoreMessages(activeRoomId).catch(() => {});
        soundEffects.playWarnSound();
        break;
      }

      case '/kick': {
        if (!targetPseudo) {
          alert('Usage : /kick <pseudo>');
          return;
        }
        addSystemMessage(
          `👢 ${targetPseudo} a été éjecté du salon par ${currentUser.pseudo}.`
        );
        soundEffects.playWarnSound();
        break;
      }

      case '/ban': {
        if (!targetPseudo) {
          alert('Usage : /ban <pseudo>');
          return;
        }
        if (targetUser) {
          if (targetUser.role === 'admin') {
            alert('Impossible de bannir un Administrateur.');
            return;
          }
          setBannedUserIds((prev) => [...prev, targetUser.id]);
        }
        addSystemMessage(
          `⛔ ${targetPseudo} a été banni définitivement du tchat par ${currentUser.pseudo}.`
        );
        soundEffects.playWarnSound();
        break;
      }

      case '/mute': {
        if (!targetPseudo) {
          alert('Usage : /mute <pseudo>');
          return;
        }
        if (targetUser) {
          setMutedUserIds((prev) => [...prev, targetUser.id]);
        }
        addSystemMessage(
          `🔇 ${targetPseudo} a été réduit au silence par ${currentUser.pseudo}.`
        );
        soundEffects.playWarnSound();
        break;
      }

      case '/warn': {
        if (!targetPseudo) {
          alert('Usage : /warn <pseudo> [raison]');
          return;
        }
        const reason = extra || 'Non-respect de la charte de convivialité';
        addSystemMessage(
          `⚠️ Avertissement officiel pour ${targetPseudo} : "${reason}" (Modération par ${currentUser.pseudo})`
        );
        soundEffects.playWarnSound();
        break;
      }

      case '/admin':
      case '/op':
      case '/modo': {
        if (!targetPseudo) {
          alert(`Usage : ${cmd} <pseudo>`);
          return;
        }
        const newRole = cmd.replace('/', '') as UserRole;
        if (targetUser) {
          setUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
          );
          if (targetUser.id === currentUser.id) {
            setCurrentUser((prev) => ({ ...prev, role: newRole }));
          }
        }
        addSystemMessage(
          `👑 ${targetPseudo} a été promu au grade de ${newRole.toUpperCase()} par ${currentUser.pseudo} !`
        );
        soundEffects.playMessageSound();
        break;
      }

      case '/topic': {
        const newTopic = parts.slice(1).join(' ');
        if (!newTopic) {
          alert('Usage : /topic <nouveau topic>');
          return;
        }
        setRooms((prev) =>
          prev.map((r) =>
            r.id === activeRoomId ? { ...r, topic: newTopic } : r
          )
        );
        addSystemMessage(
          `📌 ${currentUser.pseudo} a mis à jour le topic du salon : "${newTopic}"`
        );
        soundEffects.playMessageSound();
        break;
      }

      case '/help': {
        addSystemMessage(
          `📖 Commandes disponibles : /ban, /kick, /mute, /warn, /clear, /admin, /op, /modo, /topic, /help. Double-clic sur un pseudo = message privé (PV).`
        );
        break;
      }

      default:
        alert(`Commande inconnue : ${cmd}. Tapez /help pour la liste.`);
        break;
    }
  };

  const addSystemMessage = (content: string) => {
    const sysMsg: ChatMessage = {
      id: `sys_${Date.now()}`,
      roomId: activeRoomId,
      sender: currentUser,
      content,
      timestamp: Date.now(),
      isSystem: true,
      systemType: 'info',
    };
    setMessagesByRoom((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), sysMsg],
    }));
  };

  // --- Trigger Bot Responses ---
  const triggerBotReactions = (userText: string, roomId: string) => {
    const lower = userText.toLowerCase();

    // Rosalyne greetings bot
    if (
      lower.includes('bonjour') ||
      lower.includes('salam') ||
      lower.includes('salut') ||
      lower.includes('marhaba') ||
      lower.includes('coucou') ||
      lower.includes('rosalyne')
    ) {
      setTimeout(() => {
        const rosalyne = INITIAL_BOTS[0];
        const botMsg: ChatMessage = {
          id: `bot_reply_${Date.now()}`,
          roomId,
          sender: rosalyne,
          content: `Wa alaykoum salam @${currentUser.pseudo} ! 🌸 Marhaban bikoum sur Algerie.cool, installe-toi bien et profite du tchat et des radios !`,
          color: '#f472b6',
          timestamp: Date.now(),
        };
        setMessagesByRoom((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), botMsg],
        }));
        soundEffects.playMessageSound();
      }, 1400);
    }
  };

  // --- Send Private Message ---
  const handleSendPrivateMessage = (toUser: UserProfile, content: string) => {
    if (blockedUserIds.includes(toUser.id)) {
      alert(`Vous avez bloqué ${toUser.pseudo}.`);
      return;
    }

    const partnerId = toUser.id;
    const newPM = {
      id: `pm_${Date.now()}`,
      fromId: currentUser.id,
      fromPseudo: currentUser.pseudo,
      toId: toUser.id,
      toPseudo: toUser.pseudo,
      content,
      timestamp: Date.now(),
    };

    setPrivateConversations((prev) => {
      const conv = prev[partnerId] || {
        partner: toUser,
        messages: [],
        unreadCount: 0,
        isMinimized: false,
        isOpen: true,
      };

      return {
        ...prev,
        [partnerId]: {
          ...conv,
          messages: [...conv.messages, newPM],
          isOpen: true,
        },
      };
    });

    soundEffects.playMessageSound();

    // If toUser is a bot, simulate an authentic conversational answer!
    if (toUser.isBot) {
      setTimeout(() => {
        let reply = `Merci pour ton message @${currentUser.pseudo} ! Ravi d'échanger avec toi sur Algerie.cool 🇩🇿`;
        if (toUser.pseudo === 'rosalyne') {
          reply = `Coucou @${currentUser.pseudo} 🌸 ! Comment se passe ta journée ? Si tu cherches un salon sympa, #Rencontres-DZ et #Général sont top aujourd'hui !`;
        } else if (toUser.pseudo === 'amine_dz') {
          reply = `Salem frangin ! Wahran El Bahia en force. Tu écoutes quelle radio en ce moment ? Moi le Raï me quitte jamais ! 🪕`;
        } else if (toUser.pseudo === 'lynda_paris') {
          reply = `Hello @${currentUser.pseudo} ! Trop contente de te croiser en PV. Tu es basé en France ou au bled ?`;
        }

        const botPM = {
          id: `bot_pm_${Date.now()}`,
          fromId: toUser.id,
          fromPseudo: toUser.pseudo,
          toId: currentUser.id,
          toPseudo: currentUser.pseudo,
          content: reply,
          timestamp: Date.now(),
        };

        setPrivateConversations((prev) => {
          const conv = prev[partnerId];
          if (!conv) return prev;
          return {
            ...prev,
            [partnerId]: {
              ...conv,
              messages: [...conv.messages, botPM],
              unreadCount: conv.isMinimized ? conv.unreadCount + 1 : 0,
            },
          };
        });

        soundEffects.playPVSound();
      }, 1600);
    }
  };

  // --- Block / Unblock User ---
  const handleBlockUser = (target: UserProfile) => {
    // Prompt rule: Cannot block admin / op / modo
    if (target.role === 'admin' || target.role === 'op' || target.role === 'modo') {
      alert('Impossible de bloquer les membres de l\'équipe de modération (Admin, OP, Modo).');
      return;
    }

    setBlockedUserIds((prev) => [...prev, target.id]);
    alert(`${target.pseudo} a été bloqué. Vous ne verrez plus ses messages.`);
  };

  const handleUnblockUser = (target: UserProfile) => {
    setBlockedUserIds((prev) => prev.filter((id) => id !== target.id));
    alert(`${target.pseudo} a été débloqué.`);
  };

  // --- Save / Update Profile in AuthModal ---
  const handleSaveProfile = (
    updatedFields: Partial<UserProfile>,
    isRegistration: boolean
  ) => {
    setCurrentUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      if (isRegistration) {
        nextUser.isRegistered = true;
      }
      return nextUser;
    });

    if (isRegistration) {
      addSystemMessage(
        `✨ Félicitations à ${updatedFields.pseudo || currentUser.pseudo} qui vient d'enregistrer son pseudo sur Algerie.cool !`
      );
      soundEffects.playJoinBip();
    }
  };

  const handleCompleteAccess = (updatedFields: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const nextUser: UserProfile = {
        ...prev,
        ...updatedFields,
        role: prev.role || 'admin',
      };
      return nextUser;
    });

    try {
      localStorage.setItem('algerie_cool_entered', 'true');
    } catch {
      // ignore
    }

    setIsAccessModalOpen(false);
    soundEffects.playJoinBip();

    addSystemMessage(
      `🇩🇿 ${updatedFields.pseudo || currentUser.pseudo} a rejoint Algerie.cool (${updatedFields.location || currentUser.location}) !`
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-slate-100 font-sans relative selection:bg-emerald-500 selection:text-white bg-slate-950">
      {/* Dynamic Background Image Layer with Legibility Protection */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700 ease-in-out z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${activeWallpaper.imageUrl})`,
          filter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : undefined,
          transform: 'scale(1.03)',
        }}
      />

      {/* Contrast Protection Overlay (Anti-sabotage of text & chat) */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-500 z-0"
        style={{
          backgroundColor: isDarkTheme
            ? `rgba(2, 6, 23, ${overlayOpacity})`
            : `rgba(2, 6, 23, ${Math.max(0.35, overlayOpacity * 0.7)})`,
          backdropFilter: backdropBlur > 0 ? `blur(${Math.min(backdropBlur, 3)}px)` : undefined,
        }}
      />

      {/* Top Navbar */}
      <Navbar
        activeRoom={activeRoom}
        totalUsersCount={users.length}
        activeRadio={activeRadio}
        isPlayingRadio={isPlayingRadio}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleToggleTheme}
        onOpenRooms={() => setIsRoomsModalOpen(true)}
        onOpenRadios={() => setIsRadiosModalOpen(true)}
        onToggleUserList={() => setIsUserListOpenOnMobile(!isUserListOpenOnMobile)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAccessModalOpen(true)}
        onOpenThemes={() => setIsThemeModalOpen(true)}
        onZapWallpaper={handleZapWallpaper}
        currentWallpaperName={activeWallpaper.name}
        activeTheme={activeWallpaper}
      />

      {/* Persistent Web Radio Player Bar */}
      <RadioPlayerBar
        radios={radios}
        activeRadio={activeRadio}
        isPlaying={isPlayingRadio}
        isLoading={isRadioLoading}
        hasError={hasRadioError}
        volume={radioVolume}
        isMuted={isRadioMuted}
        onTogglePlay={handleToggleRadioPlay}
        onSelectRadio={handleSelectRadio}
        onNextRadio={handleNextRadio}
        onPrevRadio={handlePrevRadio}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onOpenModal={() => setIsRadiosModalOpen(true)}
        connectedChatListenersCount={connectedChatListenersCount}
        accentColor={activeWallpaper.accentColor}
      />

      {/* Main Body: Chat Workspace + Users Sidebar */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left / Center: Active Room Feed + Message Input */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <ChatRoom
            room={activeRoom}
            messages={activeRoomMessages}
            currentUserId={currentUser.id}
            onOpenPV={handleOpenPV}
            onSelectUser={(u) => setSelectedProfileUser(u)}
            onPlayYouTube={(video) => setFloatingYouTube(video)}
            blockedUserIds={blockedUserIds}
            canEditTopic={currentUser.role === 'admin' || currentUser.role === 'op' || currentUser.role === 'modo'}
            onChangeTopicClick={() => {
              const currentTopic = activeRoom.topic;
              const newTopic = prompt('Modifier le topic du salon :', currentTopic);
              if (newTopic && newTopic.trim()) {
                handleExecuteCommand(`/topic ${newTopic.trim()}`);
              }
            }}
            activeTheme={activeWallpaper}
            onToggleReaction={handleToggleReaction}
          />

          <MessageInput
            onSendMessage={handleSendMessage}
            selectedColor={selectedTextColor}
            onSelectColor={setSelectedTextColor}
            roomName={activeRoom.name}
            isMuted={mutedUserIds.includes(currentUser.id)}
            activeTheme={activeWallpaper}
          />
        </div>

        {/* Mobile/Tablet Backdrop when UserList is open */}
        {isUserListOpenOnMobile && (
          <div
            onClick={() => setIsUserListOpenOnMobile(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity cursor-pointer"
            title="Cliquer pour réduire la liste des membres"
          />
        )}

        {/* Right Sidebar: Connected Users (Desktop fixed, Mobile/Tablet slide-over drawer) */}
        <div
          className={`w-[85vw] max-w-sm sm:w-80 lg:w-80 flex-shrink-0 h-full transition-transform duration-300 z-40 lg:z-20 lg:static fixed right-0 top-0 lg:top-auto bottom-0 shadow-2xl lg:shadow-none ${
            isUserListOpenOnMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <UserList
            users={users}
            currentUserId={currentUser.id}
            activeRoomName={activeRoom.name}
            onOpenPV={(u) => {
              handleOpenPV(u);
              setIsUserListOpenOnMobile(false);
            }}
            onSelectUser={(u) => setSelectedProfileUser(u)}
            blockedUserIds={blockedUserIds}
            currentUser={currentUser}
            onClose={() => setIsUserListOpenOnMobile(false)}
            onModerate={(u, action) => handleExecuteCommand(`/${action} ${u.pseudo}`)}
          />
        </div>
      </div>

      {/* Floating Detachable & Transportable YouTube Player */}
      <FloatingYouTubePlayer
        video={floatingYouTube}
        onClose={() => setFloatingYouTube(null)}
      />

      {/* Parallel Private Messages Dock */}
      <PrivateChatDock
        conversations={privateConversations}
        activeConversationPartnerId={activePVPartnerId}
        onSelectConversation={(partnerId) => {
          setActivePVPartnerId(partnerId);
          setPrivateConversations((prev) => {
            const conv = prev[partnerId];
            if (!conv) return prev;
            return {
              ...prev,
              [partnerId]: { ...conv, isMinimized: false, unreadCount: 0 },
            };
          });
        }}
        onCloseConversation={(partnerId) => {
          setPrivateConversations((prev) => {
            const next = { ...prev };
            delete next[partnerId];
            return next;
          });
          if (activePVPartnerId === partnerId) {
            setActivePVPartnerId(null);
          }
        }}
        onMinimizeConversation={(partnerId) => {
          setPrivateConversations((prev) => {
            const conv = prev[partnerId];
            if (!conv) return prev;
            return {
              ...prev,
              [partnerId]: { ...conv, isMinimized: !conv.isMinimized },
            };
          });
        }}
        onSendMessage={handleSendPrivateMessage}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        blockedUserIds={blockedUserIds}
        currentUserId={currentUser.id}
      />

      {/* Salons (Rooms) Selector Modal */}
      <RoomListModal
        rooms={rooms}
        activeRoomId={activeRoomId}
        onSelectRoom={handleSelectRoom}
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
      />

      {/* Webradios Selector & Studio Modal */}
      <RadioPlayer
        radios={radios}
        activeRadio={activeRadio}
        isPlaying={isPlayingRadio}
        isLoading={isRadioLoading}
        hasError={hasRadioError}
        volume={radioVolume}
        isMuted={isRadioMuted}
        onSelectRadio={handleSelectRadio}
        onTogglePlay={handleToggleRadioPlay}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        isOpen={isRadiosModalOpen}
        onClose={() => setIsRadiosModalOpen(false)}
        connectedChatListenersCount={connectedChatListenersCount}
        accentColor={activeWallpaper.accentColor}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        onOpenPV={handleOpenPV}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        isBlocked={selectedProfileUser ? blockedUserIds.includes(selectedProfileUser.id) : false}
        currentUserRole={currentUser.role}
        onOpenModeration={(u) => {
          setModerationTargetUser(u);
          setIsModerationModalOpen(true);
        }}
        isCurrentUser={selectedProfileUser?.id === currentUser.id}
      />

      {/* Guest Mode & Registered Pseudo Modal */}
      <AuthModal
        currentUser={currentUser}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSaveProfile={handleSaveProfile}
      />

      {/* Simplified Foreground Access & Registration Dialog */}
      <AccessModal
        currentUser={currentUser}
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onCompleteAccess={handleCompleteAccess}
        isFirstVisit={!Boolean(localStorage.getItem('algerie_cool_entered'))}
      />

      {/* Moderation Command Panel Modal */}
      <ModerationModal
        targetUser={moderationTargetUser}
        isOpen={isModerationModalOpen}
        onClose={() => {
          setIsModerationModalOpen(false);
          setModerationTargetUser(null);
        }}
        onKick={(pseudo) => handleExecuteCommand(`/kick ${pseudo}`)}
        onBan={(pseudo) => handleExecuteCommand(`/ban ${pseudo}`)}
        onMute={(pseudo) => handleExecuteCommand(`/mute ${pseudo}`)}
        onWarn={(pseudo, reason) => handleExecuteCommand(`/warn ${pseudo} ${reason}`)}
        onSetRole={(pseudo, role) => handleExecuteCommand(`/${role} ${pseudo}`)}
        onClearRoom={() => handleExecuteCommand('/clear')}
        activeRoomName={activeRoom.name}
      />

      {/* Themes & Wallpaper Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleToggleTheme}
        currentLightId={currentLightWallpaperId}
        currentDarkId={currentDarkWallpaperId}
        onSelectLightWallpaper={handleSelectLightWallpaper}
        onSelectDarkWallpaper={handleSelectDarkWallpaper}
        onZapWallpaper={handleZapWallpaper}
        overlayOpacity={overlayOpacity}
        onChangeOverlayOpacity={handleChangeOverlayOpacity}
        backdropBlur={backdropBlur}
        onChangeBackdropBlur={handleChangeBackdropBlur}
      />
    </div>
  );
}

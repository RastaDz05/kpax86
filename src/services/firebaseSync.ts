import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ChatMessage, PrivateMessage, UserProfile } from '../types';

/**
 * Sync user presence and profile to Firestore
 */
export async function syncUserPresence(user: UserProfile) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      id: user.id,
      pseudo: user.pseudo,
      gender: user.gender,
      age: user.age,
      location: user.location,
      countryCode: user.countryCode,
      machine: user.machine,
      currentRadioId: user.currentRadioId || '',
      currentRadioName: user.currentRadioName || '',
      currentRooms: user.currentRooms,
      role: user.role,
      isRegistered: user.isRegistered,
      registeredAt: user.registeredAt || '',
      bio: user.bio || '',
      isMuted: !!user.isMuted,
      isBanned: !!user.isBanned,
      joinedAt: user.joinedAt,
      lastSeen: Date.now(),
    });
  } catch (err) {
    // Non-blocking log
    console.warn('Could not sync user presence to Firestore:', err);
  }
}

/**
 * Real-time listener for public room messages
 */
export function subscribeToRoomMessages(
  roomId: string,
  onUpdate: (messages: ChatMessage[]) => void
) {
  const path = `rooms/${roomId}/messages`;
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        msgs.push({
          id: docSnap.id,
          roomId: d.roomId || roomId,
          sender: {
            id: d.senderId,
            pseudo: d.senderPseudo,
            gender: d.senderGender || 'neutre',
            age: d.senderAge || 20,
            location: d.senderLocation || '🇩🇿 Alger',
            countryCode: d.senderCountryCode || 'DZ',
            machine: d.senderMachine || 'pc',
            currentRadioName: d.senderRadio || undefined,
            currentRooms: [d.roomId || '#Général'],
            role: d.senderRole || 'user',
            isRegistered: !!d.senderIsRegistered,
            joinedAt: d.timestamp,
          },
          content: d.content,
          color: d.color,
          timestamp: d.timestamp,
          isSystem: d.isSystem,
          reactions: d.reactions || undefined,
          youtubeData: d.youtubeVideoId
            ? {
                videoId: d.youtubeVideoId,
                url: `https://www.youtube.com/watch?v=${d.youtubeVideoId}`,
                title: d.youtubeTitle || 'Vidéo YouTube',
                channelName: d.youtubeChannel || 'YouTube',
                viewsText: d.youtubeViews || '1.2M vues',
                thumbnailUrl: d.youtubeThumbnail || `https://img.youtube.com/vi/${d.youtubeVideoId}/hqdefault.jpg`,
              }
            : undefined,
        });
      });
      if (msgs.length > 0) {
        onUpdate(msgs);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Post a public message to Firestore
 */
export async function postRoomMessage(message: ChatMessage) {
  const path = `rooms/${message.roomId}/messages`;
  try {
    const payload: Record<string, unknown> = {
      roomId: message.roomId,
      senderId: message.sender.id,
      senderPseudo: message.sender.pseudo,
      senderGender: message.sender.gender,
      senderAge: message.sender.age,
      senderLocation: message.sender.location,
      senderCountryCode: message.sender.countryCode,
      senderMachine: message.sender.machine,
      senderRole: message.sender.role,
      senderRadio: message.sender.currentRadioName || '',
      senderIsRegistered: message.sender.isRegistered,
      content: message.content,
      color: message.color || '#f8fafc',
      timestamp: message.timestamp,
      isSystem: !!message.isSystem,
    };

    if (message.youtubeData) {
      payload.youtubeVideoId = message.youtubeData.videoId;
      payload.youtubeTitle = message.youtubeData.title;
      payload.youtubeChannel = message.youtubeData.channelName;
      payload.youtubeViews = message.youtubeData.viewsText;
      payload.youtubeThumbnail = message.youtubeData.thumbnailUrl;
    }

    await addDoc(collection(db, 'rooms', message.roomId, 'messages'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Clear messages for a room in Firestore
 */
export async function clearRoomFirestoreMessages(roomId: string) {
  const path = `rooms/${roomId}/messages`;
  try {
    const snap = await getDocs(collection(db, 'rooms', roomId, 'messages'));
    const deletes = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletes);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Update message reactions in Firestore
 */
export async function updateMessageReactionsFirestore(
  roomId: string,
  messageId: string,
  reactions: Record<string, string[]>
) {
  try {
    await setDoc(doc(db, 'rooms', roomId, 'messages', messageId), { reactions }, { merge: true });
  } catch (err) {
    // Non-blocking for local fallback
    console.warn('Could not sync reaction to Firestore:', err);
  }
}

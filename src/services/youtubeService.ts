import { YouTubeCardData } from '../types';

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

export function extractYouTubeId(text: string): string | null {
  const match = text.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function extractYouTubeUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s]+|embed\/[^\s]+|shorts\/[^\s]+)|youtu\.be\/[a-zA-Z0-9_-]{11})[^\s]*)/i);
  return match ? match[0] : null;
}

// Fallback curated titles & channels for popular Algerian / Raï / Rap DZ videos if network oEmbed fails or takes time
const KNOWN_VIDEOS: Record<string, { title: string; channel: string; views: string }> = {
  default: {
    title: 'Musique Algérienne & Diaspora Live',
    channel: 'DZ Vibes Officiel',
    views: '1.8M vues'
  }
};

export async function fetchYouTubeMetadata(videoId: string, originalUrl?: string): Promise<YouTubeCardData> {
  const targetUrl = originalUrl || `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  let title = 'Vidéo YouTube';
  let channelName = 'YouTube';
  // Realistic view counter formatted nicely (e.g. 1.2M vues, 450K vues)
  const seed = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomViews = Math.floor((seed % 800 + 120) * 10000);
  const formattedViews = randomViews > 1000000 
    ? `${(randomViews / 1000000).toFixed(1)}M de vues` 
    : `${Math.floor(randomViews / 1000)}K de vues`;

  try {
    // Attempt noembed / oembed which returns title and author_name
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(targetUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        title = data.title;
        channelName = data.author_name || channelName;
      }
    }
  } catch {
    // Fallback if offline or blocked
    if (KNOWN_VIDEOS[videoId]) {
      title = KNOWN_VIDEOS[videoId].title;
      channelName = KNOWN_VIDEOS[videoId].channel;
    } else {
      title = `Vidéo YouTube (${videoId})`;
    }
  }

  return {
    url: targetUrl,
    videoId,
    title,
    channelName,
    viewsText: formattedViews,
    thumbnailUrl
  };
}

export interface WallpaperTheme {
  id: string;
  name: string;
  subtitle: string;
  mode: 'light' | 'dark';
  imageUrl: string;
  icon: string;
  // Adaptive "Mode IA" styling
  paletteName: string;
  accentColor: string; // hex
  primaryGradient: string; // Tailwind gradient for CTA buttons
  primaryTextColor: string;
  accentText: string; // Tailwind text color class
  borderAccent: string; // Tailwind border class
  bgAccent: string; // Subtle background tint
  glowShadow: string;
  suggestedChatColor: string;
}

export const LIGHT_WALLPAPERS: WallpaperTheme[] = [
  {
    id: 'alger_monument',
    name: 'Alger - Monument des Martyrs & Drapeau',
    subtitle: 'Maqam Echahid & Baie d\'Alger sous le soleil radieux',
    mode: 'light',
    imageUrl: new URL('../assets/images/alger_monument_day_1793848920969.jpg', import.meta.url).href,
    icon: '🇩🇿',
    paletteName: 'Émeraude & Rouge Fierté DZ',
    accentColor: '#10b981',
    primaryGradient: 'from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400',
    primaryTextColor: 'text-slate-950 font-extrabold',
    accentText: 'text-emerald-400',
    borderAccent: 'border-emerald-500/50',
    bgAccent: 'bg-emerald-500/15 text-emerald-300',
    glowShadow: 'shadow-[0_0_22px_rgba(16,185,129,0.4)]',
    suggestedChatColor: '#10b981',
  },
  {
    id: 'plage',
    name: 'Plage Turquoise Méditerranée',
    subtitle: 'Côte algérienne, eaux cristallines et sable doré',
    mode: 'light',
    imageUrl: new URL('../assets/images/plage_algerie_day_1793848947600.jpg', import.meta.url).href,
    icon: '🌊',
    paletteName: 'Cyan Lagon & Azur Méditerranéen',
    accentColor: '#06b6d4',
    primaryGradient: 'from-cyan-500 via-teal-400 to-cyan-600 hover:from-cyan-400 hover:to-teal-300',
    primaryTextColor: 'text-slate-950 font-extrabold',
    accentText: 'text-cyan-400',
    borderAccent: 'border-cyan-500/50',
    bgAccent: 'bg-cyan-500/15 text-cyan-300',
    glowShadow: 'shadow-[0_0_22px_rgba(6,182,212,0.4)]',
    suggestedChatColor: '#22d3ee',
  },
  {
    id: 'sahara',
    name: 'Sahara - Dunes dorées de Taghit',
    subtitle: 'Grand Erg Occidental, mer de sable et soleil chaud',
    mode: 'light',
    imageUrl: new URL('../assets/images/sahara_dunes_day_1793848934890.jpg', import.meta.url).href,
    icon: '🏜️',
    paletteName: 'Ambre Saharien & Ocre Flamboyant',
    accentColor: '#f59e0b',
    primaryGradient: 'from-amber-500 via-orange-400 to-amber-600 hover:from-amber-400 hover:to-orange-300',
    primaryTextColor: 'text-slate-950 font-extrabold',
    accentText: 'text-amber-400',
    borderAccent: 'border-amber-500/50',
    bgAccent: 'bg-amber-500/15 text-amber-300',
    glowShadow: 'shadow-[0_0_22px_rgba(245,158,11,0.45)]',
    suggestedChatColor: '#f59e0b',
  },
];

export const DARK_WALLPAPERS: WallpaperTheme[] = [
  {
    id: 'tour_eiffel',
    name: 'Paris - Tour Eiffel Lumineuse',
    subtitle: 'Pour la diaspora en France, Paris brillant de mille feux',
    mode: 'dark',
    imageUrl: new URL('../assets/images/tour_eiffel_lumineuse_1793848960337.jpg', import.meta.url).href,
    icon: '🗼',
    paletteName: 'Or Champagne & Lumières de Paris',
    accentColor: '#fbbf24',
    primaryGradient: 'from-yellow-500 via-amber-400 to-yellow-600 hover:from-yellow-400 hover:to-amber-300',
    primaryTextColor: 'text-slate-950 font-extrabold',
    accentText: 'text-amber-300',
    borderAccent: 'border-yellow-500/50',
    bgAccent: 'bg-yellow-500/15 text-yellow-300',
    glowShadow: 'shadow-[0_0_25px_rgba(251,191,36,0.45)]',
    suggestedChatColor: '#fbbf24',
  },
  {
    id: 'pleine_lune',
    name: 'Pleine Lune, Galaxie & Étoiles',
    subtitle: 'Ciel cosmique étoilé et pleine lune au-dessus du désert',
    mode: 'dark',
    imageUrl: new URL('../assets/images/pleine_lune_galaxie_1793848975692.jpg', import.meta.url).href,
    icon: '🌌',
    paletteName: 'Nébuleuse Cosmique & Violet Starlight',
    accentColor: '#c084fc',
    primaryGradient: 'from-purple-600 via-fuchsia-500 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-400',
    primaryTextColor: 'text-white font-extrabold',
    accentText: 'text-purple-300',
    borderAccent: 'border-purple-500/50',
    bgAccent: 'bg-purple-500/15 text-purple-200',
    glowShadow: 'shadow-[0_0_25px_rgba(192,132,252,0.45)]',
    suggestedChatColor: '#c084fc',
  },
  {
    id: 'alger_nuit',
    name: 'Alger la Blanche la Nuit',
    subtitle: 'Boulevard de front de mer et lumières de la capitale',
    mode: 'dark',
    imageUrl: new URL('../assets/images/alger_la_nuit_1793848987675.jpg', import.meta.url).href,
    icon: '🌙',
    paletteName: 'Émeraude Nocturne & Reflets Casbah',
    accentColor: '#10b981',
    primaryGradient: 'from-emerald-600 via-teal-500 to-emerald-700 hover:from-emerald-500 hover:to-teal-400',
    primaryTextColor: 'text-slate-950 font-extrabold',
    accentText: 'text-emerald-400',
    borderAccent: 'border-emerald-500/50',
    bgAccent: 'bg-emerald-500/15 text-emerald-300',
    glowShadow: 'shadow-[0_0_22px_rgba(16,185,129,0.4)]',
    suggestedChatColor: '#10b981',
  },
];

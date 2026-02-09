import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SoundLayer, Preset, TimerState, Settings, PomodoroConfig } from '../types';

interface AppState {
  audio: {
    isPlaying: boolean;
    masterVolume: number;
    layers: SoundLayer[];
    setIsPlaying: (playing: boolean) => void;
    setMasterVolume: (volume: number) => void;
    updateLayerVolume: (index: number, volume: number) => void;
    toggleLayer: (index: number) => void;
    addLayer: (layer: SoundLayer) => void;
    removeLayer: (index: number) => void;
  };
  presets: {
    custom: Preset[];
    savePreset: (preset: Preset) => void;
    deletePreset: (id: string) => void;
  };
  timer: TimerState;
  pomodoroConfig: PomodoroConfig;
  settings: Settings;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  setTimerState: (state: Partial<TimerState>) => void;
  setPomodoroConfig: (config: Partial<PomodoroConfig>) => void;
  setSettings: (settings: Partial<Settings>) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  clearToast: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      audio: {
        isPlaying: false,
        masterVolume: 0.5,
        layers: [],
        setIsPlaying: (playing) => set((state) => ({ audio: { ...state.audio, isPlaying: playing } })),
        setMasterVolume: (volume) => set((state) => ({ audio: { ...state.audio, masterVolume: volume } })),
        updateLayerVolume: (index, volume) => set((state) => ({
          audio: {
            ...state.audio,
            layers: state.audio.layers.map((layer, i) =>
              i === index ? { ...layer, volume } : layer
            ),
          },
        })),
        toggleLayer: (index) => set((state) => ({
          audio: {
            ...state.audio,
            layers: state.audio.layers.map((layer, i) =>
              i === index ? { ...layer, enabled: !layer.enabled } : layer
            ),
          },
        })),
        addLayer: (layer) => set((state) => ({
          audio: { ...state.audio, layers: [...state.audio.layers, layer] },
        })),
        removeLayer: (index) => set((state) => ({
          audio: {
            ...state.audio,
            layers: state.audio.layers.filter((_, i) => i !== index),
          },
        })),
      },
      presets: {
        custom: [],
        savePreset: (preset) => set((state) => ({
          presets: {
            ...state.presets,
            custom: [...state.presets.custom, preset],
          },
        })),
        deletePreset: (id) => set((state) => ({
          presets: {
            ...state.presets,
            custom: state.presets.custom.filter((p) => p.id !== id),
          },
        })),
      },
      timer: {
        type: 'off',
        remainingSeconds: 0,
        isActive: false,
        pomodoroSession: 0,
        pomodoroPhase: 'focus',
      },
      pomodoroConfig: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
        autoSwitchPreset: false,
      },
      settings: {
        theme: 'dark',
        visualizerEnabled: true,
        notificationSound: true,
      },
      toast: null,
      setTimerState: (newState) => set((state) => ({
        timer: { ...state.timer, ...newState },
      })),
      setPomodoroConfig: (newConfig) => set((state) => ({
        pomodoroConfig: { ...state.pomodoroConfig, ...newConfig },
      })),
      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      showToast: (message, type = 'success') => set({ toast: { message, type } }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'soundscape-storage',
      partialize: (state) => ({
        presets: state.presets,
        pomodoroConfig: state.pomodoroConfig,
        settings: state.settings,
      }),
    }
  )
);

export const SOUND_ICONS: Record<string, string> = {
  white: 'circle',
  pink: 'flower',
  brown: 'mountain',
  rain: 'cloud-rain',
  thunderstorm: 'cloud-lightning',
  wind: 'wind',
  wave: 'waves',
  fire: 'flame',
  bird: 'bird',
  cricket: 'bug',
  forest: 'trees',
  city: 'building',
  'coffee-shop': 'coffee',
  stream: 'droplets',
};

export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  focus: { label: 'Focus', color: '#6366F1' },
  sleep: { label: 'Sleep', color: '#8B5CF6' },
  relax: { label: 'Relax', color: '#06B6D4' },
  nature: { label: 'Nature', color: '#22C55E' },
  custom: { label: 'Custom', color: '#F59E0B' },
};

export const defaultPresets: Preset[] = [
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    emoji: 'brain',
    description: 'Brown noise and gentle rain for deep concentration and coding sessions.',
    category: 'focus',
    layers: [
      { type: 'brown', volume: 0.6, enabled: true },
      { type: 'rain', volume: 0.3, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'cafe-vibe',
    name: 'Cafe Vibe',
    emoji: 'coffee',
    description: 'Recreate the ambient buzz of a cozy coffee shop for productive work.',
    category: 'focus',
    layers: [
      { type: 'coffee-shop', volume: 0.5, enabled: true },
      { type: 'pink', volume: 0.2, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'study-session',
    name: 'Study Session',
    emoji: 'book',
    description: 'Balanced mix of noise and cafe ambience for study and reading.',
    category: 'focus',
    layers: [
      { type: 'brown', volume: 0.4, enabled: true },
      { type: 'coffee-shop', volume: 0.3, enabled: true },
      { type: 'pink', volume: 0.2, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'night-rain',
    name: 'Night Rain',
    emoji: 'cloud-moon',
    description: 'A rainy night with distant thunder and crickets to help you fall asleep.',
    category: 'sleep',
    layers: [
      { type: 'rain', volume: 0.5, enabled: true },
      { type: 'thunderstorm', volume: 0.3, enabled: true },
      { type: 'cricket', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'thunderstorm-night',
    name: 'Storm Night',
    emoji: 'zap',
    description: 'Powerful thunderstorm with heavy rain and howling wind for deep sleep.',
    category: 'sleep',
    layers: [
      { type: 'thunderstorm', volume: 0.6, enabled: true },
      { type: 'rain', volume: 0.4, enabled: true },
      { type: 'wind', volume: 0.2, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    emoji: 'sunset',
    description: 'Gentle waves, soft breeze, and distant seabirds for peaceful relaxation.',
    category: 'relax',
    layers: [
      { type: 'wave', volume: 0.6, enabled: true },
      { type: 'wind', volume: 0.15, enabled: true },
      { type: 'bird', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'peaceful-monastery',
    name: 'Peaceful Zen',
    emoji: 'sparkles',
    description: 'Pink noise blended with birdsong and flowing water for meditation.',
    category: 'relax',
    layers: [
      { type: 'pink', volume: 0.3, enabled: true },
      { type: 'bird', volume: 0.2, enabled: true },
      { type: 'stream', volume: 0.3, enabled: true },
      { type: 'wind', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'campfire',
    name: 'Campfire',
    emoji: 'flame',
    description: 'Crackling campfire with crickets under a gentle breeze.',
    category: 'relax',
    layers: [
      { type: 'fire', volume: 0.5, enabled: true },
      { type: 'cricket', volume: 0.2, enabled: true },
      { type: 'wind', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'summer-forest',
    name: 'Summer Forest',
    emoji: 'tree-pine',
    description: 'Immerse yourself in a lush forest with birds and a bubbling stream.',
    category: 'nature',
    layers: [
      { type: 'forest', volume: 0.5, enabled: true },
      { type: 'bird', volume: 0.3, enabled: true },
      { type: 'stream', volume: 0.2, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'mountain-breeze',
    name: 'Mountain Breeze',
    emoji: 'mountain',
    description: 'Crisp mountain wind with birdsong and a rushing stream below.',
    category: 'nature',
    layers: [
      { type: 'wind', volume: 0.5, enabled: true },
      { type: 'bird', volume: 0.3, enabled: true },
      { type: 'stream', volume: 0.4, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    emoji: 'palm-tree',
    description: 'Waves crashing on a tropical beach with exotic birds overhead.',
    category: 'nature',
    layers: [
      { type: 'wave', volume: 0.5, enabled: true },
      { type: 'bird', volume: 0.4, enabled: true },
      { type: 'wind', volume: 0.2, enabled: true },
      { type: 'stream', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'urban-evening',
    name: 'Urban Evening',
    emoji: 'building-2',
    description: 'The soothing hum of a rainy city evening from your window.',
    category: 'relax',
    layers: [
      { type: 'city', volume: 0.4, enabled: true },
      { type: 'rain', volume: 0.3, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
];

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
  setTimerState: (state: Partial<TimerState>) => void;
  setPomodoroConfig: (config: Partial<PomodoroConfig>) => void;
  setSettings: (settings: Partial<Settings>) => void;
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
      setTimerState: (newState) => set((state) => ({
        timer: { ...state.timer, ...newState },
      })),
      setPomodoroConfig: (newConfig) => set((state) => ({
        pomodoroConfig: { ...state.pomodoroConfig, ...newConfig },
      })),
      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
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

export const defaultPresets: Preset[] = [
  {
    id: 'deep-focus',
    name: 'Deep Focus',
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
    layers: [
      { type: 'pink', volume: 0.2, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'night-rain',
    name: 'Night Rain',
    layers: [
      { type: 'rain', volume: 0.5, enabled: true },
      { type: 'wind', volume: 0.2, enabled: true },
      { type: 'cricket', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    layers: [
      { type: 'wave', volume: 0.6, enabled: true },
      { type: 'wind', volume: 0.15, enabled: true },
      { type: 'bird', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'campfire',
    name: 'Campfire',
    layers: [
      { type: 'fire', volume: 0.5, enabled: true },
      { type: 'cricket', volume: 0.2, enabled: true },
      { type: 'wind', volume: 0.1, enabled: true },
    ],
    createdAt: 0,
    isDefault: true,
  },
];

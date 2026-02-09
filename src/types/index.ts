export type SoundType =
  | 'white'
  | 'pink'
  | 'brown'
  | 'rain'
  | 'thunderstorm'
  | 'wind'
  | 'wave'
  | 'fire'
  | 'bird'
  | 'cricket'
  | 'forest'
  | 'city'
  | 'coffee-shop'
  | 'stream';

export interface SoundLayer {
  type: SoundType;
  volume: number;
  enabled: boolean;
  url?: string;
  params?: Record<string, number>;
}

export type PresetCategory = 'focus' | 'sleep' | 'relax' | 'nature' | 'custom';

export interface Preset {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  category?: PresetCategory;
  layers: SoundLayer[];
  createdAt: number;
  isDefault: boolean;
}

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoSwitchPreset: boolean;
  focusPresetId?: string;
  breakPresetId?: string;
}

export interface TimerState {
  type: 'pomodoro' | 'sleep' | 'off';
  remainingSeconds: number;
  isActive: boolean;
  pomodoroSession: number;
  pomodoroPhase: 'focus' | 'shortBreak' | 'longBreak';
}

export interface Settings {
  theme: 'dark';
  visualizerEnabled: boolean;
  notificationSound: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  masterVolume: number;
  layers: SoundLayer[];
}

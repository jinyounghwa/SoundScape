export type SoundType =
  | 'white'
  | 'pink'
  | 'brown'
  | 'rain'
  | 'wind'
  | 'wave'
  | 'fire'
  | 'bird'
  | 'cricket';

export interface SoundLayer {
  type: SoundType;
  volume: number;
  enabled: boolean;
  params?: Record<string, number>;
}

export interface Preset {
  id: string;
  name: string;
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
  theme: 'dark' | 'light';
  visualizerEnabled: boolean;
  notificationSound: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  masterVolume: number;
  layers: SoundLayer[];
}

import { defaultPresets, useStore } from '../store';
import type { Preset } from '../types';

interface PresetBrowserProps {
  onSelectPreset: (preset: Preset) => void;
  currentPresetId?: string;
}

export function PresetBrowser({ onSelectPreset, currentPresetId }: PresetBrowserProps) {
  const { presets } = useStore();
  const allPresets = [...defaultPresets, ...presets.custom];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-muted mb-3">Presets</h3>
      {allPresets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelectPreset(preset)}
          className={`w-full text-left p-3 rounded-lg transition-all ${
            currentPresetId === preset.id
              ? 'bg-primary text-white'
              : 'bg-card hover:bg-primary/20'
          }`}
        >
          <div className="font-medium">{preset.name}</div>
          <div className="text-xs opacity-80 mt-1">
            {preset.layers.filter((l) => l.enabled).length} sounds
          </div>
        </button>
      ))}
    </div>
  );
}

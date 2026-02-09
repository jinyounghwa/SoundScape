import { defaultPresets, useStore } from '../store';
import type { Preset } from '../types';

interface PresetBrowserProps {
  onSelectPreset: (preset: Preset) => void;
  currentPresetId?: string;
}

export function PresetBrowser({ onSelectPreset, currentPresetId }: PresetBrowserProps) {
  const { presets, presets: { deletePreset } } = useStore();
  const allPresets = [...defaultPresets, ...presets.custom];

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePreset(id);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-muted mb-3">Presets</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {allPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={`w-full text-left p-3 rounded-lg transition-all relative group ${
              currentPresetId === preset.id
                ? 'bg-primary text-white'
                : 'bg-card hover:bg-primary/20'
            }`}
          >
            <div className="font-medium">{preset.name}</div>
            <div className="text-xs opacity-80 mt-1">
              {preset.layers.filter((l) => l.enabled).length} sounds
            </div>
            {!preset.isDefault && (
              <button
                onClick={(e) => handleDelete(e, preset.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

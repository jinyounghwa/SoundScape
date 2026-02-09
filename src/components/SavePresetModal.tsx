import { useState } from 'react';
import { useStore } from '../store';
import type { Preset } from '../types';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavePresetModal({ isOpen, onClose }: SavePresetModalProps) {
  const { audio, presets: { savePreset } } = useStore();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;

    const preset: Preset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      layers: [...audio.layers],
      createdAt: Date.now(),
      isDefault: false,
    };

    savePreset(preset);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Save Preset</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder="My custom mix..."
              className="w-full px-4 py-2 bg-background rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
              autoFocus
            />
          </div>

          <div className="bg-background rounded-lg p-3 text-sm text-text-muted">
            <p>Current sounds: {audio.layers.length}</p>
            <p className="mt-1">
              {audio.layers
                .filter((l) => l.enabled)
                .map((l) => l.type.charAt(0).toUpperCase() + l.type.slice(1))
                .join(', ')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-background hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-2 bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

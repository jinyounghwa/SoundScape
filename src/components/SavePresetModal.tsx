import { useState } from 'react';
import { useStore, CATEGORY_META } from '../store';
import type { Preset, PresetCategory } from '../types';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ICONS = [
  'sparkles', 'heart', 'star', 'moon', 'sun', 'cloud', 'zap',
  'music', 'headphones', 'coffee', 'book', 'flame', 'leaf',
  'mountain', 'waves', 'wind',
];

export function SavePresetModal({ isOpen, onClose }: SavePresetModalProps) {
  const { audio, presets: { savePreset }, showToast } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('custom');

  const handleSave = () => {
    if (!name.trim()) return;
    if (audio.layers.length === 0) return;

    const preset: Preset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      emoji: selectedIcon,
      description: description.trim() || undefined,
      category: selectedCategory,
      layers: [...audio.layers],
      createdAt: Date.now(),
      isDefault: false,
    };

    savePreset(preset);
    showToast(`"${name.trim()}" saved successfully!`);
    setName('');
    setDescription('');
    setSelectedIcon('sparkles');
    setSelectedCategory('custom');
    onClose();
  };

  if (!isOpen) return null;

  const enabledLayers = audio.layers.filter((l) => l.enabled);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass-heavy rounded-3xl p-8 w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Save Mix</h2>
            <p className="text-sm text-text-muted mt-1">Create a reusable preset from your current mix</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Preset Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="e.g., Morning Focus, Rainy Night..."
              className="w-full px-4 py-3 glass rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
              maxLength={30}
              autoFocus
            />
            <p className="text-xs text-text-muted mt-1 text-right">{name.length}/30</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Description
              <span className="text-text-muted/50 ml-1">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this mix perfect for?"
              rows={2}
              className="w-full px-4 py-3 glass rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors text-sm resize-none"
              maxLength={100}
            />
          </div>

          {/* Icon selection */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    selectedIcon === icon
                      ? 'bg-primary text-white shadow-lg scale-110'
                      : 'glass hover:bg-primary/20'
                  }`}
                >
                  <span className="text-xs font-bold capitalize">{icon.slice(0, 2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(CATEGORY_META) as [PresetCategory, { label: string; color: string }][]).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                    selectedCategory === key
                      ? 'text-white shadow-lg scale-105'
                      : 'glass hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === key ? meta.color : undefined,
                  }}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mix Preview */}
          <div className="glass rounded-xl p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Mix Preview
            </p>
            {enabledLayers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-2">No active layers to save</p>
            ) : (
              <div className="space-y-2">
                {enabledLayers.map((layer, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-20 truncate capitalize">{layer.type}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${layer.volume * 100}%`,
                          background: `linear-gradient(90deg, var(--primary), var(--accent))`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-muted w-10 text-right">
                      {Math.round(layer.volume * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 glass rounded-xl font-semibold transition-all hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || enabledLayers.length === 0}
              className="flex-1 py-3.5 bg-gradient-to-r from-primary to-secondary disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition-all text-white shadow-lg hover:shadow-xl cursor-pointer"
            >
              Save Preset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

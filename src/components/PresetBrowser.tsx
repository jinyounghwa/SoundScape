import { useState } from 'react';
import { useStore, defaultPresets, CATEGORY_META } from '../store';
import type { Preset, PresetCategory } from '../types';
import { Icons } from './Icons';

interface PresetBrowserProps {
  onSelectPreset: (preset: Preset) => void;
  currentPresetId?: string;
}

export function PresetBrowser({ onSelectPreset, currentPresetId }: PresetBrowserProps) {
  const { presets, presets: { deletePreset } } = useStore();
  const [activeCategory, setActiveCategory] = useState<PresetCategory | 'all'>('all');
  
  const allPresets = [...defaultPresets, ...presets.custom];
  
  const filteredPresets = activeCategory === 'all' 
    ? allPresets 
    : allPresets.filter(p => p.category === activeCategory);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePreset(id);
  };

  const categories: (PresetCategory | 'all')[] = ['all', 'focus', 'sleep', 'relax', 'nature'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Icons.Filter className="text-primary" />
          Presets
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-text-muted">
          {filteredPresets.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/5 text-text-muted hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[500px] pr-2 overflow-y-auto custom-scrollbar">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-10 glass rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/5">
            <p className="text-text-muted text-xs font-medium">No presets in this category</p>
          </div>
        ) : (
          filteredPresets.map((preset) => {
            const catMeta = preset.category ? CATEGORY_META[preset.category] : null;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`w-full text-left p-4 rounded-2xl transition-all-smooth relative group cursor-pointer border-2 ${
                  currentPresetId === preset.id
                    ? 'bg-gradient-to-br from-primary to-secondary text-white border-transparent shadow-lg'
                    : 'glass hover:border-primary/30 border-transparent shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      currentPresetId === preset.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'
                    }`}>
                      <Icons.Noise size={14} />
                    </div>
                    <div className="font-bold text-sm truncate">{preset.name}</div>
                  </div>
                  {catMeta && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        currentPresetId === preset.id ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-white/10'
                      }`}
                      style={{ color: currentPresetId === preset.id ? undefined : catMeta.color }}
                    >
                      {catMeta.label}
                    </span>
                  )}
                </div>
                
                <p className={`text-[11px] mb-3 line-clamp-2 leading-relaxed ${
                  currentPresetId === preset.id ? 'text-white/80' : 'text-text-muted'
                }`}>
                  {preset.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.layers.map((layer, i) => (
                    <span
                      key={i}
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${
                        currentPresetId === preset.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-text-muted dark:text-text'
                      }`}
                    >
                      {layer.type.replace('-', ' ')}
                    </span>
                  ))}
                </div>

                {!preset.isDefault && (
                  <button
                    onClick={(e) => handleDelete(e, preset.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer ${
                      currentPresetId === preset.id ? 'text-white' : 'text-red-500'
                    }`}
                  >
                    <Icons.Trash size={12} />
                  </button>
                )}
                
                {currentPresetId === preset.id && (
                  <div className="absolute bottom-2 right-2">
                    <Icons.ArrowRight size={14} className="text-white animate-pulse" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

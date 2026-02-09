import { useState, useEffect, useCallback } from 'react';
import { useStore } from './store';
import { SoundCard } from './components/SoundCard';
import { PresetBrowser } from './components/PresetBrowser';
import { TimerPanel } from './components/TimerPanel';
import { MasterVolume } from './components/MasterVolume';
import { SoundLibrary } from './components/SoundLibrary';
import { Visualizer } from './components/Visualizer';
import { SavePresetModal } from './components/SavePresetModal';
import { Toast } from './components/Toast';
import { Icons } from './components/Icons';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useTimer } from './hooks/useTimer';
import type { Preset, SoundType } from './types';

function App() {
  const { audio, audio: { setIsPlaying, addLayer, updateLayerVolume, toggleLayer, removeLayer }, settings, setSettings, showToast } = useStore();
  const { play, stop, isReady, getAnalyser } = useAudioEngine();
  useTimer();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (audio.isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      if (audio.layers.length === 0) {
        showToast('Add sounds first from the library or select a preset', 'info');
        return;
      }
      await play();
      setIsPlaying(true);
    }
  }, [audio.isPlaying, audio.layers.length, play, stop, setIsPlaying, showToast]);

  // Keyboard shortcut: Space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]);

  const handleAddSound = (type: SoundType) => {
    if (audio.layers.length >= 5) {
      showToast('Maximum 5 layers reached. Remove a layer first.', 'info');
      return;
    }
    if (audio.layers.some(l => l.type === type)) {
      showToast(`${type} is already in your mix`, 'info');
      return;
    }
    addLayer({ type, volume: 0.5, enabled: true });
    if (!audio.isPlaying) {
      play().then(() => setIsPlaying(true));
    }
  };

  const handleRemoveLayer = (index: number) => {
    removeLayer(index);
    if (audio.layers.length <= 1) {
      stop();
      setIsPlaying(false);
    }
  };

  const handleClearAll = () => {
    const count = audio.layers.length;
    for (let i = 0; i < count; i++) {
      removeLayer(0);
    }
    stop();
    setIsPlaying(false);
    showToast('All layers cleared');
  };

  const handlePresetSelect = (preset: Preset) => {
    const count = audio.layers.length;
    for (let i = 0; i < count; i++) {
      removeLayer(0);
    }
    preset.layers.forEach((layer) => {
      addLayer(layer);
    });
    if (!audio.isPlaying) {
      play().then(() => setIsPlaying(true));
    }
    showToast(`Loaded "${preset.name}"`);
  };

  return (
    <div className="min-h-screen bg-background text-text relative flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10 flex-1">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SoundScape
            </h1>
            <p className="text-xs text-text-muted mt-1 tracking-wider uppercase">
              Ambient Sound Generator
            </p>
          </div>
           <div className="flex items-center gap-3">
             <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-text-muted font-mono glass px-2.5 py-1 rounded-full">
               <Icons.Keyboard size={10} />
               Space to play
             </span>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player card */}
            <div className="glass-heavy rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-accent" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">Player</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {audio.isPlaying
                      ? `${audio.layers.filter(l => l.enabled).length} layers active`
                      : 'Ready to play'}
                  </p>
                </div>
                <button
                  onClick={handlePlayPause}
                  disabled={!isReady}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-xl flex items-center justify-center cursor-pointer relative"
                  style={{
                    boxShadow: audio.isPlaying
                      ? '0 0 30px var(--primary-glow), 0 4px 20px rgba(0,0,0,0.3)'
                      : '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {audio.isPlaying ? (
                    <Icons.Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Icons.Play className="w-8 h-8 text-white ml-1" />
                  )}
                  {audio.isPlaying && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-15 bg-primary" />
                  )}
                </button>
              </div>

              <MasterVolume />
            </div>

            {/* Visualizer */}
            <Visualizer getAnalyser={getAnalyser} />

            {/* Active layers */}
            <div className="glass-heavy rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold">Active Layers</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {audio.layers.length === 0
                      ? 'No sounds selected'
                      : `${audio.layers.filter(l => l.enabled).length} of ${audio.layers.length} enabled`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (audio.layers.length === 0) {
                        showToast('Add some sounds first before saving', 'info');
                        return;
                      }
                      setIsSaveModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-primary text-white hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Icons.Save size={14} />
                    Save Mix
                  </button>
                  {audio.layers.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-1.5 rounded-full glass hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                      title="Clear all"
                    >
                      <Icons.Trash size={14} />
                    </button>
                  )}
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-primary font-bold">
                    {audio.layers.length}/5
                  </span>
                </div>
              </div>

              {audio.layers.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/5">
                  <Icons.Logo className="w-12 h-12 mx-auto mb-4 text-text-muted/20" />
                  <p className="text-text-muted text-sm font-semibold">Ready for your creation</p>
                  <p className="text-text-muted/60 text-xs mt-1.5">Select sounds from the library to begin</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {audio.layers.map((layer, index) => (
                    <SoundCard
                      key={`${layer.type}-${index}`}
                      type={layer.type}
                      name={layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
                      volume={layer.volume}
                      enabled={layer.enabled}
                      onVolumeChange={(volume) => updateLayerVolume(index, volume)}
                      onToggle={() => toggleLayer(index)}
                      onRemove={() => handleRemoveLayer(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sound library */}
            <SoundLibrary onSelectSound={handleAddSound} activeSounds={audio.layers.map(l => l.type)} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="glass-heavy rounded-2xl p-5">
              <PresetBrowser onSelectPreset={handlePresetSelect} />
            </div>

            <div className="glass-heavy rounded-2xl p-5">
              <TimerPanel />
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Visualizer</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.visualizerEnabled}
                      onChange={(e) => setSettings({ visualizerEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">Timer Sounds</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.notificationSound}
                      onChange={(e) => setSettings({ notificationSound: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </div>
                </label>
              </div>
            </div>

            {/* Keyboard shortcuts */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-3">Shortcuts</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Play / Pause</span>
                  <kbd className="px-2 py-0.5 rounded glass font-mono text-[10px]">Space</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/5 mt-12">
        <div className="container mx-auto px-4 max-w-7xl py-6 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Icons.Logo size={14} />
            </div>
            <span className="font-bold text-sm tracking-tight text-text">
              SoundScape
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline font-medium opacity-60">Pure procedural synthesis. No server.</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
      <Toast />
    </div>
  );
}

export default App;

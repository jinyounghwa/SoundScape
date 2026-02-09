import { useStore } from './store';
import { SoundCard } from './components/SoundCard';
import { PresetBrowser } from './components/PresetBrowser';
import { TimerPanel } from './components/TimerPanel';
import { MasterVolume } from './components/MasterVolume';
import { SoundLibrary } from './components/SoundLibrary';
import { useAudioEngine } from './hooks/useAudioEngine';
import type { Preset, SoundType } from './types';

function App() {
  const { audio, audio: { setIsPlaying, addLayer, updateLayerVolume, toggleLayer, removeLayer } } = useStore();
  const { play, stop, isReady } = useAudioEngine();

  const handlePlayPause = async () => {
    if (audio.isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      await play();
      setIsPlaying(true);
    }
  };

  const handleAddSound = (type: SoundType) => {
    if (audio.layers.length >= 5) return;
    addLayer({
      type,
      volume: 0.5,
      enabled: true,
    });
    if (!audio.isPlaying) {
      play().then(() => setIsPlaying(true));
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    audio.layers.forEach((_, i) => removeLayer(i));
    preset.layers.forEach((layer) => {
      addLayer(layer);
    });
    if (!audio.isPlaying) {
      play().then(() => setIsPlaying(true));
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">SoundScape</h1>
          <p className="text-sm text-text-muted">Programmatic White Noise Generator</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <button
                  onClick={handlePlayPause}
                  disabled={!isReady}
                  className="w-20 h-20 rounded-full bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {audio.isPlaying ? (
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </button>
                <p className="mt-3 text-sm text-text-muted">
                  {audio.isPlaying ? 'Playing' : 'Click to start'}
                </p>
              </div>

              <MasterVolume />
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Active Sounds</h2>
              {audio.layers.length === 0 ? (
                <p className="text-text-muted text-center py-8">
                  No sounds selected. Choose from the library or a preset.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {audio.layers.map((layer, index) => (
                    <SoundCard
                      key={index}
                      type={layer.type}
                      name={layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
                      volume={layer.volume}
                      enabled={layer.enabled}
                      onVolumeChange={(volume) => updateLayerVolume(index, volume)}
                      onToggle={() => toggleLayer(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <SoundLibrary onSelectSound={handleAddSound} />
          </div>

          <div className="space-y-6">
            <PresetBrowser onSelectPreset={handlePresetSelect} />
            <TimerPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

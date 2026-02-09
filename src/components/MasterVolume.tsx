import { useStore } from '../store';

export function MasterVolume() {
  const { audio, setMasterVolume } = useStore();

  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Master Volume</span>
        <span className="text-sm text-text-muted">
          {Math.round(audio.masterVolume * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={audio.masterVolume * 100}
        onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
        className="w-full"
      />
    </div>
  );
}

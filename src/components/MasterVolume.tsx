import { useStore } from '../store';
import { Icons } from './Icons';

export function MasterVolume() {
  const { audio, audio: { setMasterVolume } } = useStore();

  const volumeIcon = audio.masterVolume === 0
    ? <Icons.SpeakerMute size={32} />
    : audio.masterVolume < 0.3
    ? <Icons.SpeakerLow size={32} />
    : audio.masterVolume < 0.7
    ? <Icons.SpeakerMedium size={32} />
    : <Icons.SpeakerHigh size={32} />;

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden card-hover">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20"></div>
      
      <div className="flex items-center gap-5">
        <div className="text-primary drop-shadow-sm p-3 rounded-xl bg-slate-100 dark:bg-white/5">
          {volumeIcon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm tracking-tight">Master Volume</span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
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
      </div>

      <div className="grid grid-cols-4 gap-2 mt-6">
        {[25, 50, 75, 100].map((preset) => (
          <button
            key={preset}
            onClick={() => setMasterVolume(preset / 100)}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all-smooth cursor-pointer border ${
              Math.round(audio.masterVolume * 100) === preset
                ? 'bg-primary text-white border-transparent shadow-lg'
                : 'glass hover:bg-slate-100 dark:hover:bg-white/10 text-text-muted border-transparent'
            }`}
          >
            {preset}%
          </button>
        ))}
      </div>
    </div>
  );
}

import type { SoundType } from '../types';

interface SoundCardProps {
  type: SoundType;
  name: string;
  volume: number;
  enabled: boolean;
  onVolumeChange: (volume: number) => void;
  onToggle: () => void;
}

const SOUND_COLORS: Record<SoundType, string> = {
  white: '#6366F1',
  pink: '#8B5CF6',
  brown: '#06B6D4',
  rain: '#3B82F6',
  wind: '#A855F7',
  wave: '#06B6D4',
  fire: '#F97316',
  bird: '#22C55E',
  cricket: '#84CC16',
};

export function SoundCard({
  type,
  name,
  volume,
  enabled,
  onVolumeChange,
  onToggle,
}: SoundCardProps) {
  const color = SOUND_COLORS[type];

  return (
    <div
      className={`bg-card rounded-xl p-4 transition-all ${
        enabled ? 'ring-2 ring-primary shadow-lg' : 'opacity-60'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggle();
        }
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium">{name}</span>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            enabled ? 'border-primary' : 'border-gray-600'
          }`}
        >
          {enabled && (
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          )}
        </div>
      </div>

      {enabled && (
        <div className="mt-3">
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => {
              e.stopPropagation();
              onVolumeChange(Number(e.target.value) / 100);
            }}
            className="w-full"
            style={{
              background: `linear-gradient(to right, ${color} ${volume * 100}%, rgba(99, 102, 241, 0.2) ${volume * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1 text-xs text-text-muted">
            <span>Vol</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

import type { SoundType } from '../types';
import { Icons } from './Icons';

interface SoundCardProps {
  type: SoundType;
  name: string;
  volume: number;
  enabled: boolean;
  onVolumeChange: (volume: number) => void;
  onToggle: () => void;
  onRemove: () => void;
}

const SOUND_ICONS: Record<SoundType, React.ReactNode> = {
  white: <Icons.Noise size={18} />,
  pink: <Icons.Noise size={18} />,
  brown: <Icons.Noise size={18} />,
  rain: <Icons.Rain size={18} />,
  thunderstorm: <Icons.Storm size={18} />,
  wind: <Icons.Wind size={18} />,
  wave: <Icons.Waves size={18} />,
  fire: <Icons.Fire size={18} />,
  bird: <Icons.Bird size={18} />,
  cricket: <Icons.Bird size={18} />,
  forest: <Icons.Nature size={18} />,
  city: <Icons.City size={18} />,
  'coffee-shop': <Icons.Cafe size={18} />,
  stream: <Icons.Nature size={18} />,
};

const SOUND_COLORS: Record<SoundType, string> = {
  white: '#6366F1',
  pink: '#8B5CF6',
  brown: '#06B6D4',
  rain: '#3B82F6',
  thunderstorm: '#6366F1',
  wind: '#A855F7',
  wave: '#06B6D4',
  fire: '#F97316',
  bird: '#22C55E',
  cricket: '#84CC16',
  forest: '#10B981',
  city: '#8B5CF6',
  'coffee-shop': '#D97706',
  stream: '#3B82F6',
};

const SOUND_LABELS: Record<SoundType, string> = {
  white: 'White Noise',
  pink: 'Pink Noise',
  brown: 'Brown Noise',
  rain: 'Rain',
  thunderstorm: 'Thunder',
  wind: 'Wind',
  wave: 'Ocean Waves',
  fire: 'Campfire',
  bird: 'Birdsong',
  cricket: 'Crickets',
  forest: 'Forest',
  city: 'City Hum',
  'coffee-shop': 'Cafe',
  stream: 'Stream',
};

export function SoundCard({
  type,
  name: _name,
  volume,
  enabled,
  onVolumeChange,
  onToggle,
  onRemove,
}: SoundCardProps) {
  const color = SOUND_COLORS[type];
  const label = SOUND_LABELS[type] || _name;

  return (
    <div
      className={`relative group rounded-2xl p-5 transition-all ${
        enabled
          ? 'glass-heavy shadow-lg'
          : 'glass opacity-50'
      }`}
      style={{
        borderLeft: enabled ? `3px solid ${color}` : '3px solid transparent',
      }}
    >
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg cursor-pointer z-10"
        aria-label="Remove layer"
      >
        <Icons.Clear size={12} />
      </button>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: enabled
                ? `linear-gradient(135deg, ${color}, ${color}AA)`
                : `${color}30`,
            }}
          >
            {SOUND_ICONS[type]}
          </div>
          <div>
            <span className="font-semibold text-sm block leading-tight">{label}</span>
            <span className="text-[10px] text-text-muted">
              {enabled ? `${Math.round(volume * 100)}% vol` : 'Muted'}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
            enabled ? '' : 'bg-slate-200 dark:bg-slate-700'
          }`}
          style={{
            background: enabled ? `linear-gradient(90deg, ${color}, ${color}CC)` : undefined,
          }}
          aria-label={enabled ? 'Mute layer' : 'Unmute layer'}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
              enabled ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => {
              e.stopPropagation();
              onVolumeChange(Number(e.target.value) / 100);
            }}
            className="w-full cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-text-muted">Volume</span>
            <span
              className="font-mono font-bold px-2 py-0.5 rounded"
              style={{ background: `${color}20`, color }}
            >
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

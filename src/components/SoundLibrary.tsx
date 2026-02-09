import { Icons } from './Icons';
import type { SoundType } from '../types';

interface SoundLibraryProps {
  onSelectSound: (type: SoundType) => void;
  activeSounds?: SoundType[];
}

export function SoundLibrary({ onSelectSound, activeSounds = [] }: SoundLibraryProps) {
  const groups: { name: string; icon: React.ReactNode; sounds: { type: SoundType; name: string; icon: React.ReactNode }[] }[] = [
    {
      name: 'Noises',
      icon: <Icons.Noise size={18} />,
      sounds: [
        { type: 'white', name: 'White', icon: <Icons.Noise size={28} /> },
        { type: 'pink', name: 'Pink', icon: <Icons.Noise size={28} className="text-pink-400" /> },
        { type: 'brown', name: 'Brown', icon: <Icons.Noise size={28} className="text-amber-800" /> },
      ],
    },
    {
      name: 'Nature',
      icon: <Icons.Rain size={18} />,
      sounds: [
        { type: 'rain', name: 'Rain', icon: <Icons.Rain size={28} /> },
        { type: 'thunderstorm', name: 'Storm', icon: <Icons.Storm size={28} /> },
        { type: 'wind', name: 'Wind', icon: <Icons.Wind size={28} /> },
        { type: 'wave', name: 'Ocean', icon: <Icons.Waves size={28} /> },
        { type: 'stream', name: 'Stream', icon: <Icons.Nature size={28} /> },
      ],
    },
    {
      name: 'Atmosphere',
      icon: <Icons.City size={18} />,
      sounds: [
        { type: 'fire', name: 'Fire', icon: <Icons.Fire size={28} /> },
        { type: 'bird', name: 'Birds', icon: <Icons.Bird size={28} /> },
        { type: 'cricket', name: 'Crickets', icon: <Icons.Bird size={28} className="opacity-70" /> },
        { type: 'forest', name: 'Forest', icon: <Icons.Nature size={28} /> },
        { type: 'city', name: 'City', icon: <Icons.City size={28} /> },
        { type: 'coffee-shop', name: 'Cafe', icon: <Icons.Cafe size={28} /> },
      ],
    },
  ];

  return (
    <div className="glass-heavy rounded-3xl p-6 shadow-xl space-y-6 card-hover">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Icons.Library className="text-primary" />
          Sound Library
        </h3>
      </div>

      {groups.map((group, groupIndex) => (
        <div key={group.name} style={{ animationDelay: `${groupIndex * 100}ms` }}>
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="p-1 rounded-md bg-slate-100 dark:bg-white/5">{group.icon}</span>
            {group.name}
            <span className="flex-1 h-px bg-gradient-to-r from-text-muted/20 to-transparent"></span>
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {group.sounds.map((sound, soundIndex) => (
              <button
                key={sound.type}
                onClick={() => onSelectSound(sound.type)}
                className={`group flex flex-col items-center justify-center p-4 rounded-2xl transition-all-smooth hover:scale-110 hover:shadow-lg border relative overflow-hidden cursor-pointer ${
                  activeSounds.includes(sound.type)
                    ? 'glass-heavy border-primary/40 shadow-md'
                    : 'glass hover:glass-heavy border-transparent hover:border-primary/30'
                }`}
                style={{ animationDelay: `${soundIndex * 30}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all-smooth"></div>
                {activeSounds.includes(sound.type) && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse z-10" />
                )}
                <span className="mb-2 transform group-hover:scale-125 transition-transform relative z-10">
                  {sound.icon}
                </span>
                <span className={`text-[11px] font-semibold relative z-10 transition-colors ${
                  activeSounds.includes(sound.type) ? 'text-primary' : 'group-hover:text-primary'
                }`}>
                  {sound.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

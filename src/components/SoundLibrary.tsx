import type { SoundType } from '../types';

interface SoundLibraryProps {
  onSelectSound: (type: SoundType) => void;
}

export function SoundLibrary({ onSelectSound }: SoundLibraryProps) {
  const sounds: { type: SoundType; name: string }[] = [
    { type: 'white', name: 'White Noise' },
    { type: 'pink', name: 'Pink Noise' },
    { type: 'brown', name: 'Brown Noise' },
    { type: 'rain', name: 'Rain' },
    { type: 'wind', name: 'Wind' },
    { type: 'wave', name: 'Ocean Wave' },
    { type: 'fire', name: 'Fire' },
    { type: 'bird', name: 'Bird Song' },
    { type: 'cricket', name: 'Cricket' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-muted mb-3">Add Sound</h3>
      <div className="grid grid-cols-3 gap-2">
        {sounds.map((sound) => (
          <button
            key={sound.type}
            onClick={() => onSelectSound(sound.type)}
            className="p-3 bg-card hover:bg-primary/20 rounded-lg text-sm transition-colors"
          >
            {sound.name}
          </button>
        ))}
      </div>
    </div>
  );
}

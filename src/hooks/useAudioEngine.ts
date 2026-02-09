import { useEffect, useRef, useState } from 'react';
import { MixerController } from '../audio/MixerController';
import { useStore } from '../store';

export function useAudioEngine() {
  const mixerRef = useRef<MixerController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { audio } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        mixerRef.current = new MixerController(audioContextRef.current);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();

    return () => {
      mixerRef.current?.stopAll();
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!mixerRef.current || !isReady) return;

    const mixer = mixerRef.current;

    mixer.setMasterVolume(audio.masterVolume);

    audio.layers.forEach((layer, index) => {
      const layerId = `layer-${index}`;

      if (layer.enabled) {
        if (!mixer['layers'].has(layerId)) {
          mixer.addLayer(layerId, layer.type, layer.volume);
        } else {
          mixer.setLayerVolume(layerId, layer.volume);
        }
      } else {
        mixer.removeLayer(layerId);
      }
    });

    mixer['layers'].forEach((_, id) => {
      const index = parseInt(id.replace('layer-', ''));
      if (index >= audio.layers.length || !audio.layers[index]?.enabled) {
        mixer.removeLayer(id);
      }
    });
  }, [audio.layers, audio.masterVolume, isReady]);

  const play = async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const stop = () => {
    mixerRef.current?.stopAll();
  };

  return { play, stop, isReady };
}

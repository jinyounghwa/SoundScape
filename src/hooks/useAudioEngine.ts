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

    const syncLayers = async () => {
      for (let i = 0; i < audio.layers.length; i++) {
        const layer = audio.layers[i];
        if (!layer) continue;
        const layerId = `layer-${i}`;

        if (layer.enabled) {
          if (!mixer['layers'].has(layerId)) {
            await mixer.addLayer(layerId, layer.type, layer.volume, layer.url);
          } else {
            mixer.setLayerVolume(layerId, layer.volume);
          }
        } else {
          mixer.removeLayer(layerId);
        }
      }
    };

    syncLayers();

    mixer['layers'].forEach((_, id) => {
      const index = parseInt(id.replace('layer-', ''));
      if (index >= audio.layers.length || !audio.layers[index]?.enabled) {
        mixer.removeLayer(id);
      }
    });
  }, [audio.layers, audio.masterVolume, isReady]);

  const play = async () => {
    // Unlock AudioContext for iOS Safari (must be from user interaction)
    await mixerRef.current?.unlockAudioContext();

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    mixerRef.current?.enableAnalyser();
  };

  const unlockAudio = async () => {
    await mixerRef.current?.unlockAudioContext();
  };

  const stop = () => {
    mixerRef.current?.stopAll();
  };

  const getAnalyser = () => {
    return mixerRef.current?.getAnalyser() || null;
  };

  return { play, stop, isReady, getAnalyser, unlockAudio };
}

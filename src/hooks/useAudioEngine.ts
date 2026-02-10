import { useEffect, useRef, useState, useCallback } from 'react';
import { MixerController } from '../audio/MixerController';
import { useStore } from '../store';

/**
 * iOS Safari requires AudioContext to be created AND resumed
 * within a direct user gesture (touchend/click) handler.
 * We lazily initialize AudioContext on the first user interaction
 * and play a silent buffer to "unlock" audio playback.
 */
export function useAudioEngine() {
  const mixerRef = useRef<MixerController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { audio } = useStore();
  const [isReady, setIsReady] = useState(false);
  const isUnlockedRef = useRef(false);

  // Lazily create AudioContext — must be called from a user gesture handler
  const ensureAudioContext = useCallback((): AudioContext => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;
    mixerRef.current = new MixerController(ctx);
    setIsReady(true);
    return ctx;
  }, []);

  // Unlock audio on iOS by playing a silent buffer inside a user gesture
  const unlockAudio = useCallback((ctx: AudioContext) => {
    if (isUnlockedRef.current) return;

    // Play a short silent buffer to unlock iOS audio
    const silentBuffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(ctx.destination);
    source.start(0);
    source.onended = () => {
      source.disconnect();
    };

    isUnlockedRef.current = true;
  }, []);

  // Listen for first user interaction to initialize and unlock AudioContext
  useEffect(() => {
    const handleUserGesture = () => {
      const ctx = ensureAudioContext();

      // Resume suspended AudioContext (iOS requires this in gesture handler)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Unlock iOS audio with a silent buffer
      unlockAudio(ctx);
    };

    // iOS Safari uses 'touchend' as the trusted user gesture event
    window.addEventListener('touchend', handleUserGesture, { once: false, passive: true });
    window.addEventListener('click', handleUserGesture, { once: false, passive: true });

    return () => {
      window.removeEventListener('touchend', handleUserGesture);
      window.removeEventListener('click', handleUserGesture);
    };
  }, [ensureAudioContext, unlockAudio]);

  // Handle iOS interruptions (e.g., phone call, Control Center)
  // When audio is interrupted on iOS, AudioContext goes to 'interrupted' state.
  // We need to resume it when the user returns.
  useEffect(() => {
    const handleStateChange = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
        ctx.resume().catch(() => {
          // iOS may reject resume if not in a user gesture — we'll retry on next interaction
        });
      }
    };

    // Visibility change (user returns from another app/tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleStateChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // AudioContext state change
    const ctx = audioContextRef.current;
    if (ctx) {
      ctx.addEventListener('statechange', handleStateChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (ctx) {
        ctx.removeEventListener('statechange', handleStateChange);
      }
    };
  }, [isReady]);

  // Sync layers and master volume
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

  const play = useCallback(async () => {
    // Ensure AudioContext exists (creates it if first time)
    const ctx = ensureAudioContext();

    // Resume if suspended — this must be called within user gesture chain
    if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
      await ctx.resume();
    }

    // Unlock iOS audio
    unlockAudio(ctx);

    mixerRef.current?.enableAnalyser();
  }, [ensureAudioContext, unlockAudio]);

  const stop = useCallback(() => {
    mixerRef.current?.stopAll();
  }, []);

  const getAnalyser = useCallback(() => {
    return mixerRef.current?.getAnalyser() || null;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      mixerRef.current?.stopAll();
      audioContextRef.current?.close();
    };
  }, []);

  return { play, stop, isReady: isReady || false, getAnalyser };
}

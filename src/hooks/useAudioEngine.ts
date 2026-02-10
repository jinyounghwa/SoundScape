import { useEffect, useRef, useState, useCallback } from 'react';
import { MixerController } from '../audio/MixerController';
import { useStore } from '../store';

/**
 * iOS Safari Audio Playback Requirements:
 * 
 * 1. AudioContext MUST be created during a user gesture (touchend/click).
 * 2. AudioContext.resume() MUST be called during a user gesture.
 * 3. At least one AudioBufferSourceNode.start() must be called during a
 *    user gesture to "unlock" the audio hardware.
 * 4. After an interruption (phone call, Control Center open, app switching),
 *    AudioContext transitions to 'interrupted' state and must be re-resumed
 *    on the next user gesture.
 * 5. The silent-buffer trick must be used to prime the audio output chain.
 * 
 * This hook implements all of these requirements with robust retry logic.
 */
export function useAudioEngine() {
  const mixerRef = useRef<MixerController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { audio } = useStore();
  const [isReady, setIsReady] = useState(false);
  const isUnlockedRef = useRef(false);
  const resumePromiseRef = useRef<Promise<void> | null>(null);
  const pendingLayerSyncRef = useRef(false);

  // Create AudioContext with iOS webkit fallback
  const getOrCreateAudioContext = useCallback((): AudioContext => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass({
      // Use 'playback' latency hint for better iOS compatibility
      latencyHint: 'playback',
    });
    audioContextRef.current = ctx;
    mixerRef.current = new MixerController(ctx);
    setIsReady(true);
    return ctx;
  }, []);

  // Resume AudioContext — safe to call multiple times.
  // Returns a cached promise to avoid duplicate resume() calls.
  const resumeAudioContext = useCallback(async (ctx: AudioContext): Promise<void> => {
    const state = ctx.state as string;
    if (state === 'running') {
      resumePromiseRef.current = null;
      return;
    }

    if (state === 'closed') {
      // AudioContext was closed — recreate it
      audioContextRef.current = null;
      mixerRef.current = null;
      isUnlockedRef.current = false;
      const newCtx = getOrCreateAudioContext();
      await newCtx.resume();
      return;
    }

    // 'suspended' or 'interrupted' (iOS-specific)
    if (!resumePromiseRef.current) {
      resumePromiseRef.current = ctx.resume().then(() => {
        resumePromiseRef.current = null;
      }).catch(() => {
        resumePromiseRef.current = null;
        // Will retry on next user gesture
      });
    }
    return resumePromiseRef.current;
  }, [getOrCreateAudioContext]);

  // Play a silent buffer — this is the iOS "unlock" trick.
  // Must be called within a user gesture event handler.
  const playSilentBuffer = useCallback((ctx: AudioContext) => {
    try {
      const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      // Immediately schedule stop to avoid iOS resource warnings
      source.stop(ctx.currentTime + 0.001);
      source.onended = () => {
        try { source.disconnect(); } catch (_) { /* ignore */ }
      };
    } catch (_) {
      // Silently fail — we'll retry on next interaction
    }
  }, []);

  // Comprehensive iOS unlock — called on every user interaction until confirmed
  const unlockiOSAudio = useCallback((ctx: AudioContext) => {
    // Always try to resume (no-op if already running)
    resumeAudioContext(ctx);
    
    // Play silent buffer on every interaction until the first real
    // sound plays successfully
    if (!isUnlockedRef.current) {
      playSilentBuffer(ctx);
      
      // Check if audio is actually running after a brief delay
      setTimeout(() => {
        if (ctx.state === 'running') {
          isUnlockedRef.current = true;
        }
      }, 100);
    }
  }, [resumeAudioContext, playSilentBuffer]);

  // Global user gesture handlers to keep AudioContext alive on iOS
  useEffect(() => {
    const handleUserGesture = () => {
      const ctx = getOrCreateAudioContext();
      unlockiOSAudio(ctx);
    };

    // iOS Safari specifically requires 'touchend' (not 'touchstart')
    const events = ['touchend', 'click', 'keydown'] as const;
    events.forEach(event => {
      window.addEventListener(event, handleUserGesture, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserGesture);
      });
    };
  }, [getOrCreateAudioContext, unlockiOSAudio]);

  // Handle iOS interruptions:
  // - Phone calls cause AudioContext to go to 'interrupted' state
  // - Opening Control Center can suspend audio
  // - Switching apps suspends audio
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ctx = audioContextRef.current;
        if (ctx) {
          const state = ctx.state as string;
          if (state === 'suspended' || state === 'interrupted') {
            // Attempt resume — on iOS this may fail until next user gesture
            ctx.resume().catch(() => {
              // Mark as needing unlock on next gesture
              isUnlockedRef.current = false;
            });
          }
        }
      }
    };

    const handleStateChange = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      if (ctx.state === 'running' && pendingLayerSyncRef.current) {
        // AudioContext just became running — trigger a layer re-sync
        pendingLayerSyncRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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

  // Sync layers with the mixer when audio state changes
  useEffect(() => {
    if (!mixerRef.current || !isReady) return;

    const mixer = mixerRef.current;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    mixer.setMasterVolume(audio.masterVolume);

    const syncLayers = async () => {
      // CRITICAL for iOS: Ensure AudioContext is running before creating sources
      const state = ctx.state as string;
      if (state !== 'running') {
        try {
          await ctx.resume();
        } catch (_) {
          // AudioContext.resume() rejected — likely not in a user gesture.
          // Mark for re-sync when AudioContext resumes.
          pendingLayerSyncRef.current = true;
          return;
        }
      }

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

    // Remove stale layers
    mixer['layers'].forEach((_, id) => {
      const index = parseInt(id.replace('layer-', ''));
      if (index >= audio.layers.length || !audio.layers[index]?.enabled) {
        mixer.removeLayer(id);
      }
    });
  }, [audio.layers, audio.masterVolume, isReady]);

  // Play: called from a user gesture (button click)
  const play = useCallback(async () => {
    const ctx = getOrCreateAudioContext();

    // Resume AudioContext — this is inside a user gesture chain
    await resumeAudioContext(ctx);

    // iOS unlock
    unlockiOSAudio(ctx);

    // CRITICAL for iOS: Activate Media Session API to bypass silent mode
    // This tells iOS that this is media playback (like YouTube/Spotify),
    // not ambient sound effects, so it will play even with the mute switch on.
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'SoundScape',
          artist: 'Ambient Sound Generator',
          album: 'Focus & Relaxation',
        });

        // Set playback state to playing
        navigator.mediaSession.playbackState = 'playing';

        // Handle media controls
        navigator.mediaSession.setActionHandler('play', () => {
          ctx.resume();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          mixerRef.current?.stopAll();
        });
      } catch (e) {
        // MediaSession API not supported or failed — gracefully degrade
        console.warn('Media Session API not available:', e);
      }
    }

    // Enable analyser for visualizer
    mixerRef.current?.enableAnalyser();
  }, [getOrCreateAudioContext, resumeAudioContext, unlockiOSAudio]);

  const stop = useCallback(() => {
    mixerRef.current?.stopAll();

    // Update Media Session state
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const getAnalyser = useCallback(() => {
    return mixerRef.current?.getAnalyser() || null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mixerRef.current?.stopAll();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  return { play, stop, isReady: isReady || false, getAnalyser };
}

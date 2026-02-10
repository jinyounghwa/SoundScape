import { useEffect, useRef, useState, useCallback } from 'react';
import { MixerController } from '../audio/MixerController';
import { useStore } from '../store';

/**
 * iOS Silent Mode Bypass Strategy:
 * 
 * iOS has a physical mute switch. By default, Web Audio API respects it
 * (audio session category = 'ambient'). To play audio even in silent mode:
 * 
 * 1. navigator.audioSession.type = 'playback' (iOS 17+, Safari 17+)
 *    → Tells iOS this is media playback, not ambient sound effects.
 *    → Audio plays even with the mute switch ON.
 * 
 * 2. HTML5 <audio> silent playback trick (iOS < 17 fallback)
 *    → Playing an <audio> element in a user gesture handler "kicks" the
 *      audio session into a state that allows Web Audio API output,
 *      even in silent mode.
 * 
 * 3. Standard Web Audio unlock:
 *    → AudioContext must be created + resumed inside a user gesture.
 *    → A silent buffer must be played to prime the audio pipeline.
 */

// Minimal silent MP3 (1 frame, ~100ms) encoded as base64 data URI.
// Playing this via an <audio> tag unlocks audio in silent mode on older iOS.
const SILENT_AUDIO_DATA_URI =
  'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAABhna6EfEAAAAAAAAAAAAAAAAAAAAAAP/7UGQAD/AAADSAAAAAgAAA0gAAABAAANIAAAAAAAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQZBgP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export function useAudioEngine() {
  const mixerRef = useRef<MixerController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { audio } = useStore();
  const [isReady, setIsReady] = useState(false);
  const isUnlockedRef = useRef(false);
  const resumePromiseRef = useRef<Promise<void> | null>(null);
  const pendingLayerSyncRef = useRef(false);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Step 1: Set AudioSession to 'playback' (iOS 17+) ──────────────
  // This is the "proper" API from Apple to bypass the silent switch.
  useEffect(() => {
    try {
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav.audioSession) {
        nav.audioSession.type = 'playback';
      }
    } catch (_) {
      // Not supported — will fall back to <audio> trick
    }
  }, []);

  // ── Step 2: Create silent <audio> element for older iOS fallback ───
  useEffect(() => {
    const audio = new Audio();
    audio.src = SILENT_AUDIO_DATA_URI;
    audio.loop = false;
    // Use setAttribute for playsinline (no typed property on HTMLAudioElement)
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    // Preload so it's ready for immediate playback in a gesture handler
    audio.preload = 'auto';
    audio.volume = 0.01; // Near-silent but not zero (iOS ignores volume=0)
    silentAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      silentAudioRef.current = null;
    };
  }, []);

  // ── AudioContext creation ──────────────────────────────────────────
  const getOrCreateAudioContext = useCallback((): AudioContext => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass({
      latencyHint: 'playback',
    });
    audioContextRef.current = ctx;
    mixerRef.current = new MixerController(ctx);
    setIsReady(true);
    return ctx;
  }, []);

  // ── Resume AudioContext ────────────────────────────────────────────
  const resumeAudioContext = useCallback(async (ctx: AudioContext): Promise<void> => {
    const state = ctx.state as string;
    if (state === 'running') {
      resumePromiseRef.current = null;
      return;
    }

    if (state === 'closed') {
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
      });
    }
    return resumePromiseRef.current;
  }, [getOrCreateAudioContext]);

  // ── Silent buffer for Web Audio unlock ─────────────────────────────
  const playSilentBuffer = useCallback((ctx: AudioContext) => {
    try {
      const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      source.stop(ctx.currentTime + 0.001);
      source.onended = () => {
        try { source.disconnect(); } catch (_) { /* noop */ }
      };
    } catch (_) {
      // Will retry on next interaction
    }
  }, []);

  // ── Play silent <audio> to bypass silent mode on older iOS ─────────
  const playSilentAudioElement = useCallback(() => {
    const el = silentAudioRef.current;
    if (!el) return;

    try {
      // Reset to beginning
      el.currentTime = 0;
      const playPromise = el.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Expected to fail outside user gesture — that's fine
        });
      }
    } catch (_) {
      // Ignore
    }
  }, []);

  // ── Comprehensive iOS unlock ───────────────────────────────────────
  const unlockiOSAudio = useCallback((ctx: AudioContext) => {
    // Re-assert audioSession type on every interaction (defensive)
    try {
      const nav = navigator as unknown as { audioSession?: { type: string } };
      if (nav.audioSession && nav.audioSession.type !== 'playback') {
        nav.audioSession.type = 'playback';
      }
    } catch (_) { /* noop */ }

    // Resume AudioContext
    resumeAudioContext(ctx);

    if (!isUnlockedRef.current) {
      // Play silent <audio> element to bypass mute switch (older iOS)
      playSilentAudioElement();

      // Play silent AudioContext buffer for standard Web Audio unlock
      playSilentBuffer(ctx);

      setTimeout(() => {
        if (ctx.state === 'running') {
          isUnlockedRef.current = true;
        }
      }, 100);
    }
  }, [resumeAudioContext, playSilentBuffer, playSilentAudioElement]);

  // ── Global user gesture listeners ──────────────────────────────────
  useEffect(() => {
    const handleUserGesture = () => {
      const ctx = getOrCreateAudioContext();
      unlockiOSAudio(ctx);
    };

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

  // ── iOS interruption recovery ──────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ctx = audioContextRef.current;
        if (ctx) {
          const state = ctx.state as string;
          if (state === 'suspended' || state === 'interrupted') {
            ctx.resume().catch(() => {
              isUnlockedRef.current = false;
            });
          }

          // Re-assert audioSession type after interruption
          try {
            const nav = navigator as unknown as { audioSession?: { type: string } };
            if (nav.audioSession) {
              nav.audioSession.type = 'playback';
            }
          } catch (_) { /* noop */ }
        }
      }
    };

    const handleStateChange = () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'running' && pendingLayerSyncRef.current) {
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

  // ── Layer sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mixerRef.current || !isReady) return;

    const mixer = mixerRef.current;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    mixer.setMasterVolume(audio.masterVolume);

    const syncLayers = async () => {
      const state = ctx.state as string;
      if (state !== 'running') {
        try {
          await ctx.resume();
        } catch (_) {
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

    mixer['layers'].forEach((_, id) => {
      const index = parseInt(id.replace('layer-', ''));
      if (index >= audio.layers.length || !audio.layers[index]?.enabled) {
        mixer.removeLayer(id);
      }
    });
  }, [audio.layers, audio.masterVolume, isReady]);

  // ── Play (called from user gesture) ────────────────────────────────
  const play = useCallback(async () => {
    const ctx = getOrCreateAudioContext();

    // Resume AudioContext inside user gesture chain
    await resumeAudioContext(ctx);

    // Full iOS unlock (audioSession + silent <audio> + silent buffer)
    unlockiOSAudio(ctx);

    // MediaSession for lock screen controls
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'SoundScape',
          artist: 'Ambient Sound Generator',
          album: 'Focus & Relaxation',
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setActionHandler('play', () => {
          ctx.resume();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          mixerRef.current?.stopAll();
        });
      } catch (_) {
        // Not supported
      }
    }

    mixerRef.current?.enableAnalyser();
  }, [getOrCreateAudioContext, resumeAudioContext, unlockiOSAudio]);

  // ── Stop ───────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    mixerRef.current?.stopAll();
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch (_) { /* noop */ }
    }
  }, []);

  const getAnalyser = useCallback(() => {
    return mixerRef.current?.getAnalyser() || null;
  }, []);

  // ── Cleanup ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      mixerRef.current?.stopAll();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  return { play, stop, isReady: isReady || false, getAnalyser };
}

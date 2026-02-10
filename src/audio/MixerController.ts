import type { SoundType } from '../types';
import { NoiseGenerator } from './NoiseGenerator';

interface LayerNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
  type: SoundType;
}

export class MixerController {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private layers: Map<string, LayerNode> = new Map();
  private noiseGenerator: NoiseGenerator;
  private analyser: AnalyserNode | null = null;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.masterGain = audioContext.createGain();
    this.masterGain.connect(audioContext.destination);
    this.noiseGenerator = new NoiseGenerator(audioContext);
  }

  enableAnalyser(): AnalyserNode {
    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.masterGain.disconnect();
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
    return this.analyser;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  setMasterVolume(volume: number): void {
    // Use linearRampToValueAtTime for smooth iOS transitions (avoids clicks)
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 0.02);
  }

  getMasterVolume(): number {
    return this.masterGain.gain.value;
  }

  async addLayer(id: string, type: SoundType, volume: number, url?: string): Promise<void> {
    if (this.layers.has(id)) {
      return;
    }

    // CRITICAL for iOS: Ensure AudioContext is running before any audio operations
    const state = this.audioContext.state as string;
    if (state === 'suspended' || state === 'interrupted') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume failed in addLayer:', e);
        // On iOS this may fail if not inside user gesture — caller should retry
        return;
      }
    }

    // Verify AudioContext is now running
    if ((this.audioContext.state as string) !== 'running') {
      console.warn('AudioContext not running after resume attempt, state:', this.audioContext.state);
      return;
    }

    let source: AudioBufferSourceNode;
    let buffer: AudioBuffer;

    try {
      source = this.audioContext.createBufferSource();

      if (url) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          // iOS Safari requires .slice(0) to get a transferable copy
          buffer = await this.decodeAudioDataSafe(arrayBuffer.slice(0));
          source.buffer = buffer;
        } catch (error) {
          console.error(`Failed to load sound from ${url}:`, error);
          source.buffer = this.createSynthBuffer(type);
        }
      } else {
        switch (type) {
          case 'white':
            buffer = this.noiseGenerator.generateWhiteNoise(10);
            source.buffer = buffer;
            break;
          case 'pink':
            buffer = this.noiseGenerator.generatePinkNoise(10);
            source.buffer = buffer;
            break;
          case 'brown':
            buffer = this.noiseGenerator.generateBrownNoise(10);
            source.buffer = buffer;
            break;
          default:
            source.buffer = this.createSynthBuffer(type);
            break;
        }
      }

      source.loop = true;

      const gain = this.audioContext.createGain();
      // Set initial volume to 0 and ramp up to avoid iOS click/pop
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.05);

      source.connect(gain);
      gain.connect(this.masterGain);

      // Start the source — wrap in try/catch for iOS safety
      source.start(0);

      this.layers.set(id, { source, gain, type });
    } catch (e) {
      console.warn('Failed to create audio layer:', e);
      // On iOS, if AudioContext got suspended between our check and start(),
      // this can happen. The layer sync effect will retry.
    }
  }

  /**
   * Safely decode audio data with fallback for older iOS Safari versions
   * that use the callback-based API.
   */
  private decodeAudioDataSafe(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      // Try the promise-based API first (modern browsers)
      const result = this.audioContext.decodeAudioData(
        arrayBuffer,
        (buffer) => resolve(buffer),
        (error) => reject(error)
      );
      // Some browsers return a promise from decodeAudioData
      if (result && typeof result.then === 'function') {
        result.catch(() => {
          // Already handled by the callback
        });
      }
    });
  }

  private createSynthBuffer(type: SoundType): AudioBuffer {
    // Use longer buffers (8s) to reduce looping artifacts on iOS
    const duration = 8;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    switch (type) {
      case 'rain':
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = white * Math.exp(-white * white * 10);
        }
        break;
      case 'wind':
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        break;
      case 'wave': {
        const cycleLength = this.audioContext.sampleRate * 4;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const cycle = i % cycleLength;
          const envelope = Math.pow(Math.sin((cycle / cycleLength) * Math.PI), 2);
          output[i] = white * envelope * 0.5;
        }
        break;
      }
      case 'fire':
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = white * white;
        }
        break;
      case 'bird':
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          const freq = 2000 + Math.sin(t * 10) * 500;
          output[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3);
        }
        break;
      case 'cricket':
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          const freq = 4000;
          const pulse = Math.sin(2 * Math.PI * 20 * t) > 0.5 ? 1 : 0;
          output[i] = Math.sin(2 * Math.PI * freq * t) * pulse * Math.exp(-t * 10);
        }
        break;
      case 'thunderstorm':
        for (let i = 0; i < bufferSize; i++) {
          const white = (Math.random() * 2 - 1);
          output[i] = white * white * white * 0.8;
        }
        break;
      case 'stream':
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = white * Math.sin(i * 0.05) * 0.4;
        }
        break;
      case 'forest':
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          const leaves = (Math.random() * 2 - 1) * 0.15 * Math.sin(t * 0.5);
          const birdChirp = Math.sin(2 * Math.PI * (1800 + Math.sin(t * 3) * 400) * t) *
                           Math.exp(-(t % 2) * 5) * 0.1;
          const wind = (Math.random() * 2 - 1) * 0.08 * Math.sin(t * 0.3);
          output[i] = leaves + birdChirp + wind;
        }
        break;
      case 'city':
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          const traffic = Math.sin(2 * Math.PI * 60 * t) * 0.15 +
                         Math.sin(2 * Math.PI * 90 * t) * 0.1;
          const cityNoise = (Math.random() * 2 - 1) * 0.08;
          const horn = Math.sin(2 * Math.PI * 440 * t) *
                      (Math.random() > 0.998 ? 0.05 : 0);
          output[i] = traffic + cityNoise + horn;
        }
        break;
      case 'coffee-shop':
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          let murmur = 0;
          for (let h = 1; h <= 5; h++) {
            murmur += Math.sin(2 * Math.PI * (200 + h * 50) * t + Math.random() * Math.PI) / h;
          }
          murmur *= 0.08 * (1 + Math.sin(t * 0.5) * 0.3);
          const clink = Math.sin(2 * Math.PI * 2000 * t) *
                       Math.exp(-((t % 5) * 100)) *
                       (Math.random() > 0.995 ? 0.15 : 0);
          const hiss = (Math.random() * 2 - 1) *
                      (Math.sin(t * 0.2) > 0.9 ? 0.1 : 0.02);
          output[i] = murmur + clink + hiss;
        }
        break;
    }

    return buffer;
  }

  removeLayer(id: string): void {
    const layer = this.layers.get(id);
    if (layer) {
      try {
        // Fade out to avoid iOS click/pop
        const now = this.audioContext.currentTime;
        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
        layer.gain.gain.linearRampToValueAtTime(0, now + 0.05);
        
        // Stop after fade out is complete
        setTimeout(() => {
          try {
            layer.source.stop();
          } catch (_) { /* already stopped */ }
          try {
            layer.source.disconnect();
            layer.gain.disconnect();
          } catch (_) { /* already disconnected */ }
        }, 60);
      } catch (_) {
        // Fallback: immediate stop
        try { layer.source.stop(); } catch (__) { /* ignore */ }
        try { layer.source.disconnect(); } catch (__) { /* ignore */ }
        try { layer.gain.disconnect(); } catch (__) { /* ignore */ }
      }
      this.layers.delete(id);
    }
  }

  setLayerVolume(id: string, volume: number): void {
    const layer = this.layers.get(id);
    if (layer) {
      // Use ramp to avoid iOS audio clicks
      const now = this.audioContext.currentTime;
      layer.gain.gain.cancelScheduledValues(now);
      layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
      layer.gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    }
  }

  setLayerEnabled(id: string, enabled: boolean): void {
    const layer = this.layers.get(id);
    if (layer) {
      const now = this.audioContext.currentTime;
      layer.gain.gain.cancelScheduledValues(now);
      layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
      layer.gain.gain.linearRampToValueAtTime(
        enabled ? layer.gain.gain.value || 0 : 0,
        now + 0.02
      );
    }
  }

  stopAll(): void {
    this.layers.forEach((layer) => {
      try {
        // Fade out quickly to avoid iOS click
        const now = this.audioContext.currentTime;
        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
        layer.gain.gain.linearRampToValueAtTime(0, now + 0.03);
        
        setTimeout(() => {
          try { layer.source.stop(); } catch (_) { /* ignore */ }
          try { layer.source.disconnect(); } catch (_) { /* ignore */ }
          try { layer.gain.disconnect(); } catch (_) { /* ignore */ }
        }, 40);
      } catch (_) {
        try { layer.source.stop(); } catch (__) { /* ignore */ }
        try { layer.source.disconnect(); } catch (__) { /* ignore */ }
        try { layer.gain.disconnect(); } catch (__) { /* ignore */ }
      }
    });
    this.layers.clear();
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }
}

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
    this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  getMasterVolume(): number {
    return this.masterGain.gain.value;
  }

  async addLayer(id: string, type: SoundType, volume: number, url?: string): Promise<void> {
    if (this.layers.has(id)) {
      return;
    }

    // Resume AudioContext if suspended (critical for mobile web)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    let source: AudioBufferSourceNode = this.audioContext.createBufferSource();
    let buffer: AudioBuffer;

    if (url) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        source.buffer = buffer;
      } catch (error) {
        console.error(`Failed to load sound from ${url}:`, error);
        // Fallback to synth
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
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.layers.set(id, { source, gain, type });
  }

  private createSynthBuffer(type: SoundType): AudioBuffer {
    const bufferSize = this.audioContext.sampleRate * 4;
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
      case 'wave':
        const cycleLength = this.audioContext.sampleRate * 4;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const cycle = i % cycleLength;
          const envelope = Math.pow(Math.sin((cycle / cycleLength) * Math.PI), 2);
          output[i] = white * envelope * 0.5;
        }
        break;
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
        // Forest ambience: layered bird chirps + rustling leaves + distant wind
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          // Rustling leaves (filtered noise)
          const leaves = (Math.random() * 2 - 1) * 0.15 * Math.sin(t * 0.5);
          // Occasional bird chirp
          const birdChirp = Math.sin(2 * Math.PI * (1800 + Math.sin(t * 3) * 400) * t) *
                           Math.exp(-(t % 2) * 5) * 0.1;
          // Distant wind
          const wind = (Math.random() * 2 - 1) * 0.08 * Math.sin(t * 0.3);
          output[i] = leaves + birdChirp + wind;
        }
        break;
      case 'city':
        // Urban ambience: distant traffic rumble + occasional horns + general hum
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          // Traffic rumble (low frequency)
          const traffic = Math.sin(2 * Math.PI * 60 * t) * 0.15 +
                         Math.sin(2 * Math.PI * 90 * t) * 0.1;
          // Random city noises
          const cityNoise = (Math.random() * 2 - 1) * 0.08;
          // Occasional horn (very subtle)
          const horn = Math.sin(2 * Math.PI * 440 * t) *
                      (Math.random() > 0.998 ? 0.05 : 0);
          output[i] = traffic + cityNoise + horn;
        }
        break;
      case 'coffee-shop':
        // Coffee shop: murmuring voices + occasional cup clinks + espresso machine
        for (let i = 0; i < bufferSize; i++) {
          const t = i / this.audioContext.sampleRate;
          // Murmuring (filtered pink-ish noise)
          let murmur = 0;
          for (let h = 1; h <= 5; h++) {
            murmur += Math.sin(2 * Math.PI * (200 + h * 50) * t + Math.random() * Math.PI) / h;
          }
          murmur *= 0.08 * (1 + Math.sin(t * 0.5) * 0.3); // Varying volume
          // Cup clinks (random metallic sounds)
          const clink = Math.sin(2 * Math.PI * 2000 * t) *
                       Math.exp(-((t % 5) * 100)) *
                       (Math.random() > 0.995 ? 0.15 : 0);
          // Espresso machine hiss (occasional)
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
        layer.source.stop();
      } catch (e) {
      }
      layer.source.disconnect();
      layer.gain.disconnect();
      this.layers.delete(id);
    }
  }

  setLayerVolume(id: string, volume: number): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }

  setLayerEnabled(id: string, enabled: boolean): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.gain.gain.setValueAtTime(enabled ? layer.gain.gain.value || 0 : 0, this.audioContext.currentTime);
    }
  }

  stopAll(): void {
    this.layers.forEach((layer) => {
      try {
        layer.source.stop();
      } catch (e) {
      }
      layer.source.disconnect();
      layer.gain.disconnect();
    });
    this.layers.clear();
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }
}

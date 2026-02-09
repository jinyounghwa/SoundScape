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

  addLayer(id: string, type: SoundType, volume: number): void {
    if (this.layers.has(id)) {
      return;
    }

    let source: AudioBufferSourceNode;
    let buffer: AudioBuffer;

    switch (type) {
      case 'white':
        buffer = this.noiseGenerator.generateWhiteNoise(10);
        source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        break;
      case 'pink':
        buffer = this.noiseGenerator.generatePinkNoise(10);
        source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        break;
      case 'brown':
        buffer = this.noiseGenerator.generateBrownNoise(10);
        source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        break;
      case 'rain':
      case 'wind':
      case 'wave':
      case 'fire':
      case 'bird':
      case 'cricket':
        source = this.audioContext.createBufferSource();
        const synthBuffer = this.createSynthBuffer(type);
        source.buffer = synthBuffer;
        source.loop = true;
        break;
      default:
        return;
    }

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
